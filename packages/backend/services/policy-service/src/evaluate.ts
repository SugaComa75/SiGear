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

const isAllowedByOrder = <T extends string>(
  requested: T,
  allowed: T,
  order: readonly T[]
): boolean => {
  const requestedIndex = order.indexOf(requested);
  const allowedIndex = order.indexOf(allowed);

  if (requestedIndex < 0 || allowedIndex < 0) {
    return false;
  }

  return requestedIndex <= allowedIndex;
};

const evaluateAxis = (
  axisName: OrderedAxisName,
  requestedAxes: Partial<CapabilityAxes>,
  ruleAxes: CapabilityAxes | undefined,
  reasons: string[]
) => {
  const requested = requestedAxes[axisName];
  const allowed = ruleAxes?.[axisName];

  if (!requested || !allowed) {
    return;
  }

  if (!isAllowedByOrder(requested, allowed, axisOrder[axisName])) {
    reasons.push(`requested ${axisName} '${requested}' exceeds allowed '${allowed}'`);
  }
};

const readOnlyActions = new Set(["read", "view", "status", "list", "inspect"]);

export function evaluate(req: EvalRequest, rule: PolicyRule | null, consent: ConsentRecord | null): EvalResponse {
  const reasons: string[] = [];
  const context = (req.context ?? {}) as EvalContext;
  const requestedAxes: Partial<CapabilityAxes> = {
    ...(context.requestedCapabilityAxes ?? {})
  };

  if (req.purpose === "model_training" && !requestedAxes.derivative_creation) {
    requestedAxes.derivative_creation = "model_training";
  }

  if (context.monetised === true && !requestedAxes.monetisation_use) {
    requestedAxes.monetisation_use = "indirect";
  }

  if (typeof context.requestedRetentionDays === "number" && !requestedAxes.storage_duration) {
    if (context.requestedRetentionDays <= 1) {
      requestedAxes.storage_duration = "session";
    } else if (context.requestedRetentionDays <= 365) {
      requestedAxes.storage_duration = "time_limited";
    } else {
      requestedAxes.storage_duration = "long_term";
    }
  }

  if (!consent) {
    reasons.push("no consent record for identity");
  } else {
    if (consent.state === "deleted") {
      reasons.push("consent is deleted; no processing allowed");
    }

    if (consent.state === "archive") {
      reasons.push("consent is archived; processing and sharing are disabled");
    }

    if (consent.state === "recovery" && context.reauthenticated !== true) {
      reasons.push("consent is in recovery; re-authentication required before processing");
    }

    if (consent.state === "dormant") {
      if (!readOnlyActions.has(req.action)) {
        reasons.push("consent is dormant; only read-only access is permitted");
      }

      if (requestedAxes.derivative_creation && requestedAxes.derivative_creation !== "none") {
        reasons.push("consent is dormant; derivative creation is disabled");
      }

      if (requestedAxes.monetisation_use && requestedAxes.monetisation_use !== "prohibited") {
        reasons.push("consent is dormant; monetisation use is disabled");
      }
    }
  }

  if (!rule) {
    reasons.push("no matching rule document");
  }

  if (rule && req.purpose && Array.isArray(rule.allowedPurposes) && !rule.allowedPurposes.includes(req.purpose)) {
    reasons.push(`purpose '${req.purpose}' is not allowed by policy rule`);
  }

  if (rule) {
    evaluateAxis("identity_linkage", requestedAxes, rule.capabilityAxes, reasons);
    evaluateAxis("storage_duration", requestedAxes, rule.capabilityAxes, reasons);
    evaluateAxis("derivative_creation", requestedAxes, rule.capabilityAxes, reasons);
    evaluateAxis("purpose_scope", requestedAxes, rule.capabilityAxes, reasons);
    evaluateAxis("cross_service_sharing", requestedAxes, rule.capabilityAxes, reasons);
    evaluateAxis("monetisation_use", requestedAxes, rule.capabilityAxes, reasons);
    evaluateAxis("transparency_level", requestedAxes, rule.capabilityAxes, reasons);

    if (context.monetised === true && rule.capabilityAxes?.monetisation_use === "prohibited") {
      reasons.push("monetised usage is prohibited by policy rule");
    }

    if (
      typeof context.requestedRetentionDays === "number" &&
      typeof rule.retention?.maxDays === "number" &&
      context.requestedRetentionDays > rule.retention.maxDays
    ) {
      reasons.push(`requested retention ${context.requestedRetentionDays}d exceeds max ${rule.retention.maxDays}d`);
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
      derivativePolicy: rule?.derivativePolicy ?? null
    }
  };
}

export async function evaluateWithDocuments(req: EvalRequest): Promise<EvaluateResult> {
  const policyRepository = createPolicyRepository();
  const { rule, consent } = await policyRepository.load(req.identityId, req.ruleId);
  const decision = evaluate(req, rule, consent);

  const auditEvent = {
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
    reasons: decision.reasons
  };

  await policyRepository.appendAuditEvent(auditEvent);

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
          id: auditEvent.id,
          timestamp: auditEvent.timestamp
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
