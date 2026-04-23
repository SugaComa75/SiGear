Alignment TODOs for `policy-service`

- Define rule document JSON Schema and storage model (done)
- Implement evaluation API `/v1/evaluate` (request/response contract) (done)
- Add unit tests for rule evaluation logic (done)
- Integrate audit logging for decisions (file-backed + Postgres) (done)
- Add CI checks: lint, test, build (done)

Progress update (2026-04-22)

- Evaluator now loads rule/consent documents from file-backed persistence and supports Postgres via `POLICY_STORAGE_BACKEND`.
- `/v1/evaluate` returns obligations, `reasonCodes`, and audit metadata; evaluator enforces NTI capability axes and lifecycle states.
- Added stable denial reason codes (e.g., `UNKNOWN_CAPABILITY_AXIS`, `UNAPPROVED_CAPABILITY_AXIS`, `PURPOSE_NOT_ALLOWED`, `CONSENT_DORMANT_READ_ONLY`, `RECOVERY_REAUTH_REQUIRED`, `AXIS_EXCEEDS_ALLOWED`) and persisted them in audits (`reason_codes`).
- Audit persistence: file-backed NDJSON and Postgres (`policy_audit_events`) with migrations `0004_add_unknown_axes.sql` and `0005_add_reason_codes.sql`.
- Admin API: `GET /v1/admin/pending-unknown` lists pending unknown/unapproved events; supports token/JWT/JWKS auth.
- Shared browser evaluator and demo (avatar-based enforcement) added under `packages/shared/policy-eval` with signature verification and a mobile approval simulator.
- Unit tests added: evaluator tests, signature verification test, and audit reasonCodes tests (file-backed + conditional Postgres).
- CI: workflows added to run policy-eval and policy-service tests; Postgres service and migrations are applied in CI so Postgres-backed tests run.

Remaining / next

- Roll out DB migration `0004`/`0005` in staging/production as part of deployment runbook.
- Optional: formalize reason code registry (docs + stable enum) and expose in API docs.
- Add admin UI for reviewing pending unknown/unapproved audit events and bulk approval workflow.

