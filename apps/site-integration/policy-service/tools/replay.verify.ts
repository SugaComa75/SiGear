import fs from "node:fs/promises";
import path from "node:path";

type AuditEvent = {
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
  reasonCodes?: string[];
  unknownRequestedAxes?: string[];
  unapprovedRequestedAxes?: string[];
};

const REQUIRED_KEYS = [
  "id",
  "timestamp",
  "identityId",
  "action",
  "purpose",
  "ruleId",
  "ruleVersion",
  "consentId",
  "consentState",
  "allowed",
  "reasons",
  "reasonCodes",
  "unknownRequestedAxes",
  "unapprovedRequestedAxes"
];

const repoRoot = path.join(process.cwd(), "..", "..", "..", "..");
const logsDir = path.join(repoRoot, "logs");

const error = (msg: string) => {
  console.error("ERROR:", msg);
};

const findLatestDemoLog = async (): Promise<string | null> => {
  try {
    const files = await fs.readdir(logsDir);
    const demoFiles = files.filter((f) => f.startsWith("demo-audit-") && f.endsWith(".ndjson"));
    if (demoFiles.length === 0) return null;
    demoFiles.sort();
    return path.join(logsDir, demoFiles[demoFiles.length - 1]);
  } catch {
    return null;
  }
};

const validate = (lines: string[]): { events: AuditEvent[]; errors: string[] } => {
  const errors: string[] = [];
  const events: AuditEvent[] = [];
  const ids = new Set<string>();

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineno = i + 1;

    // Check for multiple JSON objects in single line by counting braces
    const openBraces = (line.match(/{/g) || []).length;
    const closeBraces = (line.match(/}/g) || []).length;
    if (openBraces !== 1 || closeBraces !== 1) {
      errors.push(`Line ${lineno}: expected one JSON object per line (found {=${openBraces}, }=${closeBraces})`);
      continue;
    }

    let parsed: any;
    try {
      parsed = JSON.parse(line);
    } catch (e) {
      errors.push(`Line ${lineno}: invalid JSON (${(e as Error).message})`);
      continue;
    }

    // Required fields
    for (const key of REQUIRED_KEYS) {
      if (!(key in parsed)) {
        errors.push(`Line ${lineno}: missing required field '${key}'`);
      }
    }

    if (typeof parsed.id !== "string") {
      errors.push(`Line ${lineno}: 'id' must be a string`);
    } else {
      if (ids.has(parsed.id)) {
        errors.push(`Line ${lineno}: duplicate id '${parsed.id}'`);
      }
      ids.add(parsed.id);
    }

    // Push valid-ish event
    events.push(parsed as AuditEvent);
  }

  return { events, errors };
};

const run = async () => {
  const fileArg = process.argv[2];
  const targetFile = fileArg ?? (await findLatestDemoLog());
  if (!targetFile) {
    error(`No log file specified and no demo-audit-*.ndjson found in ${logsDir}`);
    process.exit(2);
  }

  console.log(`Verifying audit file: ${targetFile}`);

  const raw = await fs.readFile(targetFile, "utf8");
  const lines = raw.split("\n").map((l) => l.trim()).filter((l) => l.length > 0);

  const { events, errors } = validate(lines);
  if (errors.length > 0) {
    console.error("\nValidation errors:");
    for (const e of errors) console.error(" -", e);
    process.exit(3);
  }

  // Group by consentId
  const byConsent = new Map<string, AuditEvent[]>();
  for (const ev of events) {
    const cid = ev.consentId ?? "<null>";
    if (!byConsent.has(cid)) byConsent.set(cid, []);
    byConsent.get(cid)!.push(ev);
  }

  let overallErrors: string[] = [];

  for (const [cid, evs] of byConsent.entries()) {
    if (cid === "<null>") continue;
    // sort by timestamp
    evs.sort((a, b) => a.timestamp.localeCompare(b.timestamp));

    const hasActive = evs.find((e) => e.consentState === "active");
    const hasDeleted = evs.find((e) => e.consentState === "deleted");

    if (!hasActive || !hasDeleted) continue; // only validate consentIds that have both

    if (!hasActive.allowed) {
      overallErrors.push(`consentId ${cid}: active consent event must be allowed=true`);
    }

    if (hasDeleted.allowed) {
      overallErrors.push(`consentId ${cid}: deleted consent event must be allowed=false`);
    }

    const deletedEvent = evs.find((e) => e.consentState === "deleted");
    const reasonCodes = deletedEvent?.reasonCodes ?? [];
    if (!reasonCodes.includes("CONSENT_DELETED")) {
      overallErrors.push(`consentId ${cid}: deleted consent event must include reason code CONSENT_DELETED`);
    }
  }

  if (overallErrors.length > 0) {
    console.error("\nReplay verification failed:");
    for (const e of overallErrors) console.error(" -", e);
    process.exit(4);
  }

  console.log("\nReplay verification succeeded: all checks passed.");
  process.exit(0);
};

await run();
