import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import crypto from "node:crypto";

import { evaluateWithDocuments } from "../src/evaluate.js";

const print = (s: string) => console.log(s);

const run = async () => {
  print("\n=== SiGear File-backed Persistence Demo ===\n");

  const repoRoot = path.join(process.cwd(), "..", "..", "..", "..");
  const logsDir = path.join(repoRoot, "logs");
  await fs.mkdir(logsDir, { recursive: true });

  const auditFile = path.join(logsDir, `demo-audit-${Date.now()}.ndjson`);

  // Use dedicated consent file so demo is self-contained
  const serviceExamples = path.join(process.cwd(), "examples");
  await fs.mkdir(serviceExamples, { recursive: true });

  const consentFile = path.join(serviceExamples, "demo-consent.json");

  process.env.POLICY_STORAGE_BACKEND = "file";
  process.env.POLICY_CONSENTS_FILE = consentFile;
  process.env.POLICY_AUDIT_LOG_FILE = auditFile;

  // Step 1: write an active consent (grant)
  const activeConsent = {
    id: crypto.randomUUID(),
    identityId: "user:1234",
    ruleId: "8a7f9f2c-3b6f-4c1e-9a2f-0f1d2c3b4e5f",
    state: "active",
    provenance: { method: "demo", via: "script" },
    createdAt: new Date().toISOString()
  };

  await fs.writeFile(consentFile, JSON.stringify(activeConsent, null, 2), "utf8");
  print(`Wrote consent file: ${consentFile}`);

  // Step 2: perform allowed action
  print("\n-- Performing allowed action (should be ALLOWED)");
  const before = await evaluateWithDocuments({ identityId: "user:1234", action: "read", purpose: "social_connection" });
  console.log(JSON.stringify(before.decision, null, 2));

  // Step 3: revoke consent (set to deleted)
  const revokedConsent = { ...activeConsent, state: "deleted", updatedAt: new Date().toISOString() };
  await fs.writeFile(consentFile, JSON.stringify(revokedConsent, null, 2), "utf8");
  print(`\nConsent revoked (file updated): ${consentFile}`);

  // Step 4: perform same action again (should be DENIED)
  print("\n-- Performing same action after revoke (should be DENIED)");
  const after = await evaluateWithDocuments({ identityId: "user:1234", action: "read", purpose: "social_connection" });
  console.log(JSON.stringify(after.decision, null, 2));

  // Summary: read audit file
  const raw = await fs.readFile(auditFile, "utf8");
  const lines = raw.split('\n').filter((l) => l.trim().length > 0);
  print("\n--- Audit events recorded (file-backed):");
  for (const l of lines) print(l);

  // Write a human-friendly summary for sharing
  const summaryFile = path.join(logsDir, `demo-audit-summary-${Date.now()}.md`);
  const summary = [`# Demo Audit Summary`, ``, `Audit file: ${auditFile}`, ``, `Events:`, ...lines, ``].join("\n");
  await fs.writeFile(summaryFile, summary, "utf8");
  print(`\nWrote summary: ${summaryFile}`);
  print("\nDemo complete.");
};

await run();
