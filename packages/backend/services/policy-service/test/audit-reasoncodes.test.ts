import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import crypto from "node:crypto";

import { FilePolicyRepository, PostgresPolicyRepository } from "../src/repository.js";

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

t("file-backed audit persists reasonCodes", async () => {
  const tmp = await fs.mkdtemp(path.join(os.tmpdir(), "sigear-audit-test-"));
  const auditFile = path.join(tmp, "audit.ndjson");

  const repo = new FilePolicyRepository({ auditLogPath: auditFile });

  const event = {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    identityId: "user:test:file",
    action: "activate",
    purpose: null,
    ruleId: null,
    ruleVersion: null,
    consentId: null,
    consentState: null,
    allowed: false,
    reasons: ["requested unknown capability axis 'A'"],
    reasonCodes: ["UNKNOWN_CAPABILITY_AXIS"]
  } as any;

  await repo.appendAuditEvent(event);

  const content = await fs.readFile(auditFile, "utf8");
  const lines = content.split("\n").map((l) => l.trim()).filter(Boolean);
  const parsed = JSON.parse(lines[lines.length - 1]);
  if (!Array.isArray(parsed.reasonCodes) || !parsed.reasonCodes.includes("UNKNOWN_CAPABILITY_AXIS")) {
    throw new Error(`expected reasonCodes to include UNKNOWN_CAPABILITY_AXIS, got ${JSON.stringify(parsed.reasonCodes)}`);
  }
});

t("postgres-backed audit persists reasonCodes (requires POLICY_DATABASE_URL)", async () => {
  if (!process.env.POLICY_DATABASE_URL) {
    console.log("skip - POLICY_DATABASE_URL not set");
    return;
  }

  const repo = new PostgresPolicyRepository(process.env.POLICY_DATABASE_URL);

  const id = crypto.randomUUID();
  const event = {
    id,
    timestamp: new Date().toISOString(),
    identityId: "user:test:pg",
    action: "activate",
    purpose: null,
    ruleId: null,
    ruleVersion: null,
    consentId: null,
    consentState: null,
    allowed: false,
    reasons: ["requested unknown capability axis 'B'"],
    reasonCodes: ["UNKNOWN_CAPABILITY_AXIS"]
  } as any;

  await repo.appendAuditEvent(event);

  const rows = await repo.listPendingUnknown(50);
  const found = rows.find((r) => r.id === id);
  if (!found) throw new Error("expected to find appended audit event in Postgres listPendingUnknown");
  if (!Array.isArray((found as any).reasonCodes) || !(found as any).reasonCodes.includes("UNKNOWN_CAPABILITY_AXIS")) {
    throw new Error(`expected reasonCodes in Postgres event to include UNKNOWN_CAPABILITY_AXIS, got ${JSON.stringify((found as any).reasonCodes)}`);
  }
});

await runAllTests();
