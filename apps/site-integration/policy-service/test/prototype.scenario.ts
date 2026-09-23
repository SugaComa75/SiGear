import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { evaluate, evaluateWithDocuments } from "../src/evaluate.js";

const printSection = (title: string) => {
  console.log("\n============================================================");
  console.log(title);
  console.log("============================================================");
};

const run = async () => {
  printSection("SiGear NTI Prototype Scenario (File-Backed)");

  const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), "sigear-prototype-"));
  const auditFile = path.join(tempRoot, "prototype-audit.ndjson");

  process.env.POLICY_STORAGE_BACKEND = "file";
  process.env.POLICY_AUDIT_LOG_FILE = auditFile;

  const baselineDecision = await evaluateWithDocuments({
    identityId: "user:1234",
    action: "read",
    purpose: "social_connection"
  });

  const restrictedDecision = await evaluateWithDocuments({
    identityId: "user:1234",
    action: "derive",
    purpose: "model_training"
  });

  const dormantDecision = evaluate(
    {
      identityId: "user:1234",
      action: "write",
      purpose: "safety_moderation",
      context: {
        requestedCapabilityAxes: {
          derivative_creation: "aggregation"
        }
      }
    },
    {
      id: "8a7f9f2c-3b6f-4c1e-9a2f-0f1d2c3b4e5f",
      version: 1,
      allowedPurposes: ["social_connection", "safety_moderation"],
      capabilityAxes: {
        identity_linkage: "pseudonymous",
        storage_duration: "time_limited",
        derivative_creation: "aggregation",
        purpose_scope: "related",
        cross_service_sharing: "ecosystem",
        monetisation_use: "prohibited",
        transparency_level: "summary_only"
      }
    },
    {
      id: "b6e9f8a1-1c2d-4e3f-9a0b-7c6d5e4f3a2b",
      identityId: "user:1234",
      ruleId: "8a7f9f2c-3b6f-4c1e-9a2f-0f1d2c3b4e5f",
      state: "dormant"
    }
  );

  const recoveryWithoutReauth = evaluate(
    {
      identityId: "user:1234",
      action: "read",
      purpose: "safety_moderation"
    },
    {
      id: "8a7f9f2c-3b6f-4c1e-9a2f-0f1d2c3b4e5f",
      version: 1,
      allowedPurposes: ["social_connection", "safety_moderation"]
    },
    {
      id: "b6e9f8a1-1c2d-4e3f-9a0b-7c6d5e4f3a2b",
      identityId: "user:1234",
      ruleId: "8a7f9f2c-3b6f-4c1e-9a2f-0f1d2c3b4e5f",
      state: "recovery"
    }
  );

  const recoveryWithReauth = evaluate(
    {
      identityId: "user:1234",
      action: "read",
      purpose: "safety_moderation",
      context: {
        reauthenticated: true
      }
    },
    {
      id: "8a7f9f2c-3b6f-4c1e-9a2f-0f1d2c3b4e5f",
      version: 1,
      allowedPurposes: ["social_connection", "safety_moderation"]
    },
    {
      id: "b6e9f8a1-1c2d-4e3f-9a0b-7c6d5e4f3a2b",
      identityId: "user:1234",
      ruleId: "8a7f9f2c-3b6f-4c1e-9a2f-0f1d2c3b4e5f",
      state: "recovery"
    }
  );

  printSection("Decisions");
  const output = [
    {
      scenario: "A. Safe social connection request",
      allowed: baselineDecision.decision.allowed,
      reasons: baselineDecision.decision.reasons
    },
    {
      scenario: "B. Model training request",
      allowed: restrictedDecision.decision.allowed,
      reasons: restrictedDecision.decision.reasons
    },
    {
      scenario: "C. Dormant lifecycle write attempt",
      allowed: dormantDecision.allowed,
      reasons: dormantDecision.reasons
    },
    {
      scenario: "D. Recovery without re-auth",
      allowed: recoveryWithoutReauth.allowed,
      reasons: recoveryWithoutReauth.reasons
    },
    {
      scenario: "E. Recovery with re-auth",
      allowed: recoveryWithReauth.allowed,
      reasons: recoveryWithReauth.reasons
    }
  ];

  console.log(JSON.stringify(output, null, 2));

  const auditLines = (await fs.readFile(auditFile, "utf8"))
    .split("\n")
    .filter((line) => line.trim().length > 0).length;

  printSection("Prototype Summary");
  console.log(`Audit events recorded: ${auditLines}`);
  console.log(`Audit file: ${auditFile}`);
  console.log("Upgrade path: switch POLICY_STORAGE_BACKEND to postgres and apply migrations.");
};

await run();
