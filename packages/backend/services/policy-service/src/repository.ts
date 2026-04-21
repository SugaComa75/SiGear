import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import type { ErrorObject, ValidateFunction } from "ajv";
import * as ajvModule from "ajv";
import * as ajvFormatsModule from "ajv-formats";
import { Pool } from "pg";

const AjvConstructor =
  (ajvModule as unknown as { default?: new (options?: Record<string, unknown>) => unknown }).default ??
  (ajvModule as unknown as new (options?: Record<string, unknown>) => unknown);

const addFormats =
  (ajvFormatsModule as unknown as { default?: (ajvInstance: unknown) => void }).default ??
  (ajvFormatsModule as unknown as (ajvInstance: unknown) => void);

export type CapabilityAxes = {
  identity_linkage?: "anonymous" | "pseudonymous" | "identifiable";
  storage_duration?: "session" | "time_limited" | "long_term";
  derivative_creation?: "none" | "aggregation" | "model_training" | "synthetic_reuse";
  purpose_scope?: "single" | "related" | "general_improvement";
  cross_service_sharing?: "isolated" | "ecosystem" | "unrestricted";
  monetisation_use?: "prohibited" | "indirect" | "commercial";
  transparency_level?: "full_audit" | "summary_only" | "system_only";
};

export type PolicyRule = {
  id: string;
  version: number;
  allowedPurposes?: string[];
  retention?: {
    maxDays?: number;
    conditions?: string;
  };
  derivativePolicy?: string;
  capabilityAxes?: CapabilityAxes;
};

export type ConsentRecord = {
  id: string;
  identityId: string;
  ruleId: string;
  state: "active" | "reminder" | "dormant" | "recovery" | "archive" | "deleted";
};

export type EvaluationAuditEvent = {
  id: string;
  timestamp: string;
  identityId: string;
  action: string;
  purpose: string | null;
  ruleId: string | null;
  ruleVersion: number | null;
  consentId: string | null;
  consentState: string | null;
  allowed: boolean;
  reasons: string[];
};

export type LoadedPolicyDocuments = {
  rule: PolicyRule | null;
  consent: ConsentRecord | null;
};

export interface PolicyRepository {
  load(identityId: string, requestedRuleId?: string): Promise<LoadedPolicyDocuments>;
  appendAuditEvent(event: EvaluationAuditEvent): Promise<void>;
}

type RepositoryOptions = {
  rulesPath?: string;
  consentsPath?: string;
  auditLogPath?: string;
};

const serviceDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

type SchemaValidators = {
  validateRule: ValidateFunction;
  validateConsent: ValidateFunction;
};

let schemaValidatorsPromise: Promise<SchemaValidators> | null = null;

const formatErrors = (errors: ErrorObject[] | null | undefined): string => {
  if (!errors || errors.length === 0) {
    return "unknown schema validation error";
  }

  return errors.map((error) => `${error.instancePath || "/"} ${error.message ?? "invalid"}`.trim()).join("; ");
};

const getSchemaValidators = async (): Promise<SchemaValidators> => {
  if (!schemaValidatorsPromise) {
    schemaValidatorsPromise = (async () => {
      const [ruleSchemaRaw, consentSchemaRaw] = await Promise.all([
        fs.readFile(path.join(serviceDir, "schemas", "rule.schema.json"), "utf8"),
        fs.readFile(path.join(serviceDir, "schemas", "consent.schema.json"), "utf8")
      ]);

      const ajv = new AjvConstructor({ allErrors: true, strict: false }) as {
        compile: (schema: unknown) => ValidateFunction;
      };
      addFormats(ajv);

      const validateRule = ajv.compile(JSON.parse(ruleSchemaRaw));
      const validateConsent = ajv.compile(JSON.parse(consentSchemaRaw));

      return {
        validateRule,
        validateConsent
      };
    })();
  }

  return schemaValidatorsPromise;
};

const assertRuleValid = async (rule: PolicyRule, source: string): Promise<void> => {
  const { validateRule } = await getSchemaValidators();

  if (!validateRule(rule)) {
    throw new Error(`Invalid rule document from ${source}: ${formatErrors(validateRule.errors)}`);
  }
};

const assertConsentValid = async (consent: ConsentRecord, source: string): Promise<void> => {
  const { validateConsent } = await getSchemaValidators();

  if (!validateConsent(consent)) {
    throw new Error(`Invalid consent document from ${source}: ${formatErrors(validateConsent.errors)}`);
  }
};

const readJsonArrayOrSingle = async <T>(sourcePath: string): Promise<T[]> => {
  const raw = await fs.readFile(sourcePath, "utf8");
  const parsed = JSON.parse(raw) as T | T[];
  return Array.isArray(parsed) ? parsed : [parsed];
};

const selectConsent = (identityId: string, consents: ConsentRecord[]): ConsentRecord | null => {
  const consent = consents.find((item) => item.identityId === identityId);
  return consent ?? null;
};

const selectRule = (requestedRuleId: string | undefined, consent: ConsentRecord | null, rules: PolicyRule[]): PolicyRule | null => {
  const fallbackRuleId = consent?.ruleId;
  const targetRuleId = requestedRuleId ?? fallbackRuleId;

  if (!targetRuleId) {
    return null;
  }

  const rule = rules.find((item) => item.id === targetRuleId);
  return rule ?? null;
};

export class FilePolicyRepository implements PolicyRepository {
  private readonly rulesPath: string;

  private readonly consentsPath: string;

  private readonly auditLogPath: string;

  constructor(options?: RepositoryOptions) {
    this.rulesPath = options?.rulesPath ?? process.env.POLICY_RULES_FILE ?? path.join(serviceDir, "examples", "example-rule.json");
    this.consentsPath =
      options?.consentsPath ?? process.env.POLICY_CONSENTS_FILE ?? path.join(serviceDir, "examples", "example-consent.json");
    this.auditLogPath =
      options?.auditLogPath ?? process.env.POLICY_AUDIT_LOG_FILE ?? path.join(serviceDir, "data", "audit-log.ndjson");
  }

  async load(identityId: string, requestedRuleId?: string): Promise<LoadedPolicyDocuments> {
    const [rules, consents] = await Promise.all([
      readJsonArrayOrSingle<PolicyRule>(this.rulesPath),
      readJsonArrayOrSingle<ConsentRecord>(this.consentsPath)
    ]);

    await Promise.all([
      ...rules.map((rule, index) => assertRuleValid(rule, `${this.rulesPath}[${index}]`)),
      ...consents.map((consent, index) => assertConsentValid(consent, `${this.consentsPath}[${index}]`))
    ]);

    const consent = selectConsent(identityId, consents);
    const rule = selectRule(requestedRuleId, consent, rules);
    return { rule, consent };
  }

  async appendAuditEvent(event: EvaluationAuditEvent): Promise<void> {
    await fs.mkdir(path.dirname(this.auditLogPath), { recursive: true });
    await fs.appendFile(this.auditLogPath, `${JSON.stringify(event)}\n`, "utf8");
  }
}

type DbRuleRow = {
  id: string;
  version: number;
  allowed_purposes: string[] | null;
  retention: { maxDays?: number; conditions?: string } | null;
  derivative_policy: string | null;
  capability_axes: CapabilityAxes | null;
};

type DbConsentRow = {
  id: string;
  identity_id: string;
  rule_id: string;
  state: ConsentRecord["state"];
};

export class PostgresPolicyRepository implements PolicyRepository {
  private readonly pool: Pool;

  constructor(connectionString?: string) {
    const databaseUrl = connectionString ?? process.env.POLICY_DATABASE_URL ?? process.env.DATABASE_URL;

    if (!databaseUrl) {
      throw new Error("Missing POLICY_DATABASE_URL (or DATABASE_URL) for postgres policy repository");
    }

    this.pool = new Pool({ connectionString: databaseUrl });
  }

  async load(identityId: string, requestedRuleId?: string): Promise<LoadedPolicyDocuments> {
    const consentQuery = await this.pool.query<DbConsentRow>(
      `
        SELECT id, identity_id, rule_id, state
        FROM policy_consents
        WHERE identity_id = $1
        ORDER BY created_at DESC
        LIMIT 1
      `,
      [identityId]
    );

    const consentRow = consentQuery.rows[0] ?? null;
    const consent: ConsentRecord | null =
      consentRow === null
        ? null
        : {
            id: consentRow.id,
            identityId: consentRow.identity_id,
            ruleId: consentRow.rule_id,
            state: consentRow.state
          };

    if (consent) {
      await assertConsentValid(consent, "postgres.policy_consents");
    }

    const ruleId = requestedRuleId ?? consent?.ruleId;
    if (!ruleId) {
      return { rule: null, consent };
    }

    const ruleQuery = await this.pool.query<DbRuleRow>(
      `
        SELECT id, version, allowed_purposes, retention, derivative_policy, capability_axes
        FROM policy_rules
        WHERE id = $1
        LIMIT 1
      `,
      [ruleId]
    );

    const ruleRow = ruleQuery.rows[0] ?? null;
    const rule: PolicyRule | null =
      ruleRow === null
        ? null
        : {
            id: ruleRow.id,
            version: ruleRow.version,
            allowedPurposes: ruleRow.allowed_purposes ?? undefined,
            retention: ruleRow.retention ?? undefined,
            derivativePolicy: ruleRow.derivative_policy ?? undefined,
            capabilityAxes: ruleRow.capability_axes ?? undefined
          };

    if (rule) {
      await assertRuleValid(rule, "postgres.policy_rules");
    }

    return { rule, consent };
  }

  async appendAuditEvent(event: EvaluationAuditEvent): Promise<void> {
    await this.pool.query(
      `
        INSERT INTO policy_audit_events (
          id,
          created_at,
          identity_id,
          action,
          purpose,
          rule_id,
          rule_version,
          consent_id,
          consent_state,
          allowed,
          reasons,
          payload
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      `,
      [
        event.id,
        event.timestamp,
        event.identityId,
        event.action,
        event.purpose,
        event.ruleId,
        event.ruleVersion,
        event.consentId,
        event.consentState,
        event.allowed,
        event.reasons,
        event
      ]
    );
  }
}

export const createPolicyRepository = (): PolicyRepository => {
  const backend = (process.env.POLICY_STORAGE_BACKEND ?? "file").toLowerCase();

  if (backend === "postgres") {
    return new PostgresPolicyRepository();
  }

  return new FilePolicyRepository();
};
