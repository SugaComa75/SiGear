Alignment TODOs for `policy-service`

- Define rule document JSON Schema and storage model
- Implement evaluation API `/v1/evaluate` (request/response contract)
- Add unit tests for rule evaluation logic
- Integrate audit logging for decisions (done: file-backed append-only audit log)
- Add CI checks: lint, test, build

Progress update (2026-04-21)

- Evaluator now loads rule/consent documents from file-backed persistence (`POLICY_RULES_FILE`, `POLICY_CONSENTS_FILE`) instead of hardcoded-only logic.
- Added pluggable repository backend with `POLICY_STORAGE_BACKEND=postgres` support for DB-backed rule/consent lookup and audit writes.
- `/v1/evaluate` response now includes obligations + audit metadata.
- Evaluator now enforces all seven NTI capability axes plus consent lifecycle controls (`active`, `reminder`, `dormant`, `recovery`, `archive`, `deleted`).
- Rule and consent documents are now validated against canonical JSON Schemas during repository load (file and postgres paths).
- Added test coverage for file-backed evaluation and audit log write path.
- CI quality gates now run lint/test/build for `@sigear/policy-service` on push and PR.
- Remaining: apply DB migration in environments.
