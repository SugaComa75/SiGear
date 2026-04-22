import crypto from "node:crypto";
import { Request, Response } from "express";

import { CapabilityAxes, ConsentRecord, createPolicyRepository, PolicyRule } from "./repository.js";

type EvalRequest = {
  identityId: string;
  ruleId?: string;
  action: string;
  purpose?: string;
  context?: Record<string, unknown>;
};

type EvalResponse = {
  allowed: boolean;
  reasons: string[];
  obligations: Record<string, unknown>;
};

type EvalContext = {
  requestedCapabilityAxes?: Partial<CapabilityAxes>;
  requestedRetentionDays?: number;
  monetised?: boolean;
  reauthenticated?: boolean;
};

type EvaluateResult = {
  decision: EvalResponse;
  auditEvent: Record<string, unknown>;
};

const axisOrder = {
  identity_linkage: ["anonymous", "pseudonymous", "identifiable"] as const,
  storage_duration: ["session", "time_limited", "long_term"] as const,
  derivative_creation: ["none", "aggregation", "model_training", "synthetic_reuse"] as const,
  purpose_scope: ["single", "related", "general_improvement"] as const,
  cross_service_sharing: ["isolated", "ecosystem", "unrestricted"] as const,
  monetisation_use: ["prohibited", "indirect", "commercial"] as const,
  transparency_level: ["full_audit", "summary_only", "system_only"] as const
};

type OrderedAxisName = keyof typeof axisOrder;

const isAllowedByOrder = <T extends string>(requested: T, allowed: T, order: readonly T[]): boolean => {
  const requestedIndex = order.indexOf(requested);
  const allowedIndex = order.indexOf(allowed);
  if (requestedIndex < 0 || allowedIndex < 0) return false;
  return requestedIndex <= allowedIndex;
};

const readOnlyActions = new Set(["read", "view", "status", "list", "inspect"]);

const evaluateAxis = (
  axisName: OrderedAxisName,
  requestedAxes: Partial<CapabilityAxes>,
  ruleAxes: CapabilityAxes | undefined,
  pushReason: (code: string, message: string) => void
) => {
  const requested = requestedAxes[axisName];
  const allowed = ruleAxes?.[axisName];
  if (!requested || !allowed) return;
  if (!isAllowedByOrder(requested as any, allowed as any, axisOrder[axisName])) {
    pushReason("AXIS_EXCEEDS_ALLOWED", `requested ${axisName} '${requested}' exceeds allowed '${allowed}'`);
  }
};

export function evaluate(req: EvalRequest, rule: PolicyRule | null, consent: ConsentRecord | null): EvalResponse {
  const reasons: string[] = [];
  const reasonCodes: string[] = [];

  const pushReason = (code: string, message: string) => {
    reasonCodes.push(code);
    reasons.push(message);
  };

  const context = (req.context ?? {}) as EvalContext;
  const requestedAxes: Partial<CapabilityAxes> = { ...(context.requestedCapabilityAxes ?? {}) };

  if (req.purpose === "model_training" && !requestedAxes.derivative_creation) {
    requestedAxes.derivative_creation = "model_training";
  }

  if (context.monetised === true && !requestedAxes.monetisation_use) {
    requestedAxes.monetisation_use = "indirect";
  }

  if (typeof context.requestedRetentionDays === "number" && !requestedAxes.storage_duration) {
    if (context.requestedRetentionDays <= 1) requestedAxes.storage_duration = "session";
    else if (context.requestedRetentionDays <= 365) requestedAxes.storage_duration = "time_limited";
    else requestedAxes.storage_duration = "long_term";
  }

  if (!consent) {
    pushReason("CONSENT_NOT_FOUND", "no consent record for identity");
  } else {
    if (consent.state === "deleted") pushReason("CONSENT_DELETED", "consent is deleted; no processing allowed");
    if (consent.state === "archive") pushReason("CONSENT_ARCHIVED", "consent is archived; processing and sharing are disabled");
    if (consent.state === "recovery" && context.reauthenticated !== true)
      pushReason("RECOVERY_REAUTH_REQUIRED", "consent is in recovery; re-authentication required before processing");

    if (consent.state === "dormant") {
      if (!readOnlyActions.has(req.action)) pushReason("CONSENT_DORMANT_READ_ONLY", "consent is dormant; only read-only access is permitted");
      if (requestedAxes.derivative_creation && requestedAxes.derivative_creation !== "none")
        pushReason("CONSENT_DORMANT_DERIVATIVE_DISABLED", "consent is dormant; derivative creation is disabled");
      if (requestedAxes.monetisation_use && requestedAxes.monetisation_use !== "prohibited")
        pushReason("CONSENT_DORMANT_MONETISATION_DISABLED", "consent is dormant; monetisation use is disabled");
    }
  }

  const requestedAxisKeys = Object.keys(requestedAxes) as Array<keyof CapabilityAxes>;
  const unknownRequestedAxes: string[] = [];
  const unapprovedRequestedAxes: string[] = [];

  if (requestedAxisKeys.length > 0) {
    if (!rule) {
      for (const key of requestedAxisKeys) {
        const k = String(key);
        pushReason("RULE_MISSING", `requested capability axis '${k}' cannot be evaluated without a policy rule`);
        unapprovedRequestedAxes.push(k);
      }
    } else {
      for (const key of requestedAxisKeys) {
        const k = String(key);
        const approvedFeatures: string[] = (rule as any)?.metadata && Array.isArray((rule as any).metadata.approvedFeatures)
          ? (rule as any).metadata.approvedFeatures
          : [];
        if (approvedFeatures.includes(k)) continue;

        if (!(key in axisOrder)) {
          pushReason("UNKNOWN_CAPABILITY_AXIS", `requested unknown capability axis '${k}'; explicit approval required`);
          unknownRequestedAxes.push(k);
        } else if (!rule.capabilityAxes || !(key in rule.capabilityAxes)) {
          pushReason("UNAPPROVED_CAPABILITY_AXIS", `requested capability axis '${k}' is not covered by policy rule; explicit approval required`);
          unapprovedRequestedAxes.push(k);
        }
      }
    }
  }

  if (rule && req.purpose && Array.isArray(rule.allowedPurposes) && !rule.allowedPurposes.includes(req.purpose)) {
    pushReason("PURPOSE_NOT_ALLOWED", `purpose '${req.purpose}' is not allowed by policy rule`);
  }

  if (rule) {
    evaluateAxis("identity_linkage", requestedAxes, rule.capabilityAxes, pushReason);
    evaluateAxis("storage_duration", requestedAxes, rule.capabilityAxes, pushReason);
    evaluateAxis("derivative_creation", requestedAxes, rule.capabilityAxes, pushReason);
    evaluateAxis("purpose_scope", requestedAxes, rule.capabilityAxes, pushReason);
    evaluateAxis("cross_service_sharing", requestedAxes, rule.capabilityAxes, pushReason);
    evaluateAxis("monetisation_use", requestedAxes, rule.capabilityAxes, pushReason);
    evaluateAxis("transparency_level", requestedAxes, rule.capabilityAxes, pushReason);

    if (context.monetised === true && rule.capabilityAxes?.monetisation_use === "prohibited") {
      pushReason("MONETISATION_PROHIBITED", "monetised usage is prohibited by policy rule");
    }

    if (
      typeof context.requestedRetentionDays === "number" &&
      typeof rule.retention?.maxDays === "number" &&
      context.requestedRetentionDays > rule.retention.maxDays
    ) {
      pushReason("RETENTION_EXCEEDS_MAX", `requested retention ${context.requestedRetentionDays}d exceeds max ${rule.retention.maxDays}d`);
    }
  }

  const allowed = reasons.length === 0;

  return {
    allowed,
    reasons,
    obligations: {
      ruleId: rule?.id ?? null,
      ruleVersion: rule?.version ?? null,
      consentState: consent?.state ?? null,
      reminderNotificationRequired: consent?.state === "reminder",
      recoveryReauthenticationRequired: consent?.state === "recovery",
      transparencyLevel: rule?.capabilityAxes?.transparency_level ?? null,
      retention: rule?.retention ?? null,
      requestedCapabilityAxes: requestedAxes,
      unknownRequestedAxes,
      unapprovedRequestedAxes,
      reasonCodes,
      derivativePolicy: rule?.derivativePolicy ?? null
    }
  };
}

export async function evaluateWithDocuments(req: EvalRequest): Promise<EvaluateResult> {
  const policyRepository = createPolicyRepository();
  const { rule, consent } = await policyRepository.load(req.identityId, req.ruleId);
  const decision = evaluate(req, rule, consent);

  const auditEvent: Record<string, unknown> = {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    identityId: req.identityId,
    action: req.action,
    purpose: req.purpose ?? null,
    ruleId: rule?.id ?? null,
    ruleVersion: rule?.version ?? null,
    consentId: consent?.id ?? null,
    consentState: consent?.state ?? null,
    allowed: decision.allowed,
    reasons: decision.reasons,
    reasonCodes: (decision.obligations as any).reasonCodes ?? [],
    unknownRequestedAxes: (decision.obligations as any).unknownRequestedAxes ?? [],
    unapprovedRequestedAxes: (decision.obligations as any).unapprovedRequestedAxes ?? []
  };

  await policyRepository.appendAuditEvent(auditEvent as any);

  return { decision, auditEvent };
}

export async function evaluateHandler(req: Request, res: Response) {
  const body = req.body as EvalRequest;
  try {
    const { decision, auditEvent } = await evaluateWithDocuments(body);
    res.json({
      success: true,
      data: {
        ...decision,
        audit: {
          id: (auditEvent as any).id,
          timestamp: (auditEvent as any).timestamp
        }
      },
      error: null,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      data: null,
      error: {
        code: "POLICY_EVALUATION_FAILED",
        message: error instanceof Error ? error.message : "Failed to evaluate policy"
      },
      timestamp: new Date().toISOString()
    });
  }
}
