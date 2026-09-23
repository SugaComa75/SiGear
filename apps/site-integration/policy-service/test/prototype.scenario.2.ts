import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { evaluateWithDocuments } from "../src/evaluate.js";
import { createPolicyRepository } from "../src/repository.js";

const printSection = (title: string) => {
  console.log("\n============================================================");
  console.log(title);
  console.log("============================================================");
};

const run = async () => {
  printSection("SiGear NTI Prototype Scenario 2: New Default-On Options (A,B,C)");

  const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), "sigear-prototype2-"));
  const rulesFile = path.join(tempRoot, "rules.json");
  const consentsFile = path.join(tempRoot, "consents.json");
  const auditFile = path.join(tempRoot, "prototype2-audit.ndjson");

  process.env.POLICY_STORAGE_BACKEND = "file";
  process.env.POLICY_RULES_FILE = rulesFile;
  process.env.POLICY_CONSENTS_FILE = consentsFile;
  process.env.POLICY_AUDIT_LOG_FILE = auditFile;

  // Write a single rule: parent approved X and Z, denied Y implicitly by absence
  await fs.writeFile(
    rulesFile,
    JSON.stringify([
        {
          id: "33333333-3333-4333-8333-333333333333",
        version: 1,
        scope: "identity",
        scopeRef: "user:children:alpha",
        capabilityAxes: {
          identity_linkage: "pseudonymous",
          storage_duration: "time_limited",
          derivative_creation: "aggregation",
          purpose_scope: "related",
          cross_service_sharing: "ecosystem",
          monetisation_use: "prohibited",
          transparency_level: "summary_only"
        },
        allowedPurposes: ["X", "Z"],
        createdBy: "parent:fixture",
        createdAt: new Date().toISOString()
      }
    ], null, 2)
  );

  // Consent: active for the above rule
  await fs.writeFile(
    consentsFile,
    JSON.stringify([
        {
          id: "44444444-4444-4444-8444-444444444444",
          identityId: "user:children:alpha",
          ruleId: "33333333-3333-4333-8333-333333333333",
        state: "active",
        createdAt: new Date().toISOString()
      }
    ], null, 2)
  );

  // Now, simulate the service introducing three new options A,B,C and defaulting them on.
  // NTI should deny activation until explicit review.
  const outcome = await evaluateWithDocuments({
    identityId: "user:children:alpha",
    action: "activate",
    purpose: "X",
    context: {
      requestedCapabilityAxes: {
        A: "enabled" as unknown as string,
        B: "enabled" as unknown as string,
        C: "enabled" as unknown as string
      }
    }
  });

  printSection("Decision");
  console.log(JSON.stringify({ allowed: outcome.decision.allowed, reasons: outcome.decision.reasons }, null, 2));

  // Read audit file and show count
  const auditLines = (await fs.readFile(auditFile, "utf8"))
    .split("\n")
    .filter((line) => line.trim().length > 0);

  printSection("Audit Summary");
  console.log(`Audit events recorded: ${auditLines.length}`);

  // Demonstrate admin review: list pending unknown/unapproved axes via repository helper
  const repo = createPolicyRepository();
  const pending = await repo.listPendingUnknown(50);

  printSection("Pending Unknown/Unapproved Audit Events (admin view)");
  console.log(JSON.stringify(pending.slice(0, 10), null, 2));

  // Basic assertions for demo clarity (throw on unexpected behavior)
  if (outcome.decision.allowed) {
    throw new Error("Prototype scenario 2: expected activation to be denied for unknown default-on options A/B/C");
  }

  if (pending.length === 0) {
    throw new Error("Prototype scenario 2: expected pending unknown/unapproved audit events to be present");
  }

  const axes = new Set<string>();
  for (const ev of pending) {
    const u = (ev as any).unknownRequestedAxes ?? [];
    const ua = (ev as any).unapprovedRequestedAxes ?? [];
    for (const k of u) axes.add(k);
    for (const k of ua) axes.add(k);
  }

  if (!axes.has("A") || !axes.has("B") || !axes.has("C")) {
    throw new Error("Prototype scenario 2: expected A,B,C to appear in unknown/unapproved axes in audit events");
  }

  printSection("Prototype 2: OK");
  console.log("New default-on options are denied and surfaced in audit/admin view for review.");
};

await run();
