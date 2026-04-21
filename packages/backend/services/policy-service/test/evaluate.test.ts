import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { evaluate, evaluateWithDocuments } from "../src/evaluate.js";

const tests: Array<{ name: string; fn: () => void | Promise<void> }> = [];

function t(name: string, fn: () => void | Promise<void>) {
  tests.push({ name, fn });
}

const runAllTests = async () => {
  for (const { name, fn } of tests) {
    try {
      await fn();
      console.log(`ok - ${name}`);
    } catch (error) {
      console.error(`fail - ${name}`);
      console.error(error);
      process.exitCode = 1;
    }
  }
};

t("allows non-model-training actions", () => {
  const res = evaluate(
    { identityId: "user:123", action: "read", purpose: "social_connection" },
    {
      id: "rule-1",
      version: 1,
      capabilityAxes: {
        derivative_creation: "aggregation",
        monetisation_use: "prohibited",
        transparency_level: "summary_only"
      },
      allowedPurposes: ["social_connection"]
    },
    {
      id: "consent-1",
      identityId: "user:123",
      ruleId: "rule-1",
      state: "active"
    }
  );
  if (!res.allowed) throw new Error("expected allowed");
});

t("denies model training by default", () => {
  const res = evaluate(
    { identityId: "user:123", action: "derive", purpose: "model_training" },
    {
      id: "rule-1",
      version: 1,
      capabilityAxes: {
        derivative_creation: "aggregation"
      }
    },
    {
      id: "consent-1",
      identityId: "user:123",
      ruleId: "rule-1",
      state: "active"
    }
  );
  if (res.allowed) throw new Error("expected denied");
});

t("denies requested cross-service sharing beyond allowed axis", () => {
  const res = evaluate(
    {
      identityId: "user:123",
      action: "share",
      purpose: "safety_moderation",
      context: {
        requestedCapabilityAxes: {
          cross_service_sharing: "unrestricted"
        }
      }
    },
    {
      id: "rule-2",
      version: 1,
      capabilityAxes: {
        cross_service_sharing: "ecosystem"
      }
    },
    {
      id: "consent-2",
      identityId: "user:123",
      ruleId: "rule-2",
      state: "active"
    }
  );

  if (res.allowed) throw new Error("expected denied");
});

t("denies non-read operations in dormant lifecycle state", () => {
  const res = evaluate(
    {
      identityId: "user:123",
      action: "write",
      purpose: "safety_moderation"
    },
    {
      id: "rule-3",
      version: 1,
      capabilityAxes: {
        derivative_creation: "none",
        monetisation_use: "prohibited"
      }
    },
    {
      id: "consent-3",
      identityId: "user:123",
      ruleId: "rule-3",
      state: "dormant"
    }
  );

  if (res.allowed) throw new Error("expected denied");
});

t("requires reauthentication while in recovery state", () => {
  const denied = evaluate(
    {
      identityId: "user:123",
      action: "read",
      purpose: "safety_moderation"
    },
    {
      id: "rule-4",
      version: 1
    },
    {
      id: "consent-4",
      identityId: "user:123",
      ruleId: "rule-4",
      state: "recovery"
    }
  );

  const allowed = evaluate(
    {
      identityId: "user:123",
      action: "read",
      purpose: "safety_moderation",
      context: {
        reauthenticated: true
      }
    },
    {
      id: "rule-4",
      version: 1
    },
    {
      id: "consent-4",
      identityId: "user:123",
      ruleId: "rule-4",
      state: "recovery"
    }
  );

  if (denied.allowed) throw new Error("expected denied without reauthentication");
  if (!allowed.allowed) throw new Error("expected allowed with reauthentication");
});

t("writes append-only audit event using file-backed documents", async () => {
  const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), "sigear-policy-test-"));
  const rulesFile = path.join(tempRoot, "rules.json");
  const consentsFile = path.join(tempRoot, "consents.json");
  const auditFile = path.join(tempRoot, "audit.ndjson");

  process.env.POLICY_RULES_FILE = rulesFile;
  process.env.POLICY_CONSENTS_FILE = consentsFile;
  process.env.POLICY_AUDIT_LOG_FILE = auditFile;

  await fs.writeFile(
    rulesFile,
    JSON.stringify([
      {
        id: "11111111-1111-4111-8111-111111111111",
        version: 3,
        scope: "identity",
        scopeRef: "user:999",
        capabilityAxes: {
          identity_linkage: "pseudonymous",
          storage_duration: "time_limited",
          derivative_creation: "aggregation",
          purpose_scope: "related",
          cross_service_sharing: "ecosystem",
          monetisation_use: "prohibited",
          transparency_level: "full_audit"
        },
        allowedPurposes: ["safety_moderation"],
        createdBy: "parent:fixture",
        createdAt: "2026-04-21T00:00:00.000Z"
      }
    ])
  );

  await fs.writeFile(
    consentsFile,
    JSON.stringify([
      {
        id: "22222222-2222-4222-8222-222222222222",
        identityId: "user:999",
        ruleId: "11111111-1111-4111-8111-111111111111",
        state: "active",
        createdAt: "2026-04-21T00:00:00.000Z"
      }
    ])
  );

  const outcome = await evaluateWithDocuments({
    identityId: "user:999",
    action: "review",
    purpose: "safety_moderation"
  });

  if (!outcome.decision.allowed) throw new Error("expected file-backed policy decision to allow");

  const auditContent = await fs.readFile(auditFile, "utf8");
  if (!auditContent.includes("\"identityId\":\"user:999\"")) {
    throw new Error("expected audit log to contain identity id");
  }
});

await runAllTests();
