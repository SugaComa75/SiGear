# Demo: File-backed persistence and revocation flow

Purpose: provide a portable demo showing consent grant → allowed action → revoke → same action denied, with audit events persisted to `logs/` in the repo.

How to run (from repo root):

```powershell
npm --workspace @sigear/policy-service run prototype # optional baseline
node --loader ts-node/esm ./packages/backend/services/policy-service/test/demo.replay.ts
```

Outputs:
- `logs/demo-audit-<ts>.ndjson` — raw NDJSON audit events
- `logs/demo-audit-summary-<ts>.md` — markdown summary for sharing

This demo uses file-backed persistence to avoid needing Postgres and is safe to show on laptops.
