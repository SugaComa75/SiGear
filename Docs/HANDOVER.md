
# SiGear Handover Notes

Current status (2026-04-21): backend foundation is now in place for a working NTI prototype path and a scalable Postgres path. This handover captures completed work, validation, and the highest-priority follow-ups.

Completed artifacts (canonical)
- [packages/backend/services/policy-service/src/evaluate.ts](packages/backend/services/policy-service/src/evaluate.ts) — policy evaluator with lifecycle + capability-axis enforcement, obligations, and audit metadata
- [packages/backend/services/policy-service/src/repository.ts](packages/backend/services/policy-service/src/repository.ts) — repository abstraction (`file` and `postgres`) with schema validation at load time
- [packages/backend/services/policy-service/schemas/rule.schema.json](packages/backend/services/policy-service/schemas/rule.schema.json) — canonical JSON Schema for rules
- [packages/backend/services/policy-service/schemas/consent.schema.json](packages/backend/services/policy-service/schemas/consent.schema.json) — canonical JSON Schema for consent records
- [packages/backend/services/policy-service/test/evaluate.test.ts](packages/backend/services/policy-service/test/evaluate.test.ts) — deterministic evaluator tests, including file-backed audit write path
- [packages/backend/services/policy-service/test/prototype.scenario.ts](packages/backend/services/policy-service/test/prototype.scenario.ts) — one-command stakeholder prototype scenarios
- [packages/backend/services/policy-service/openapi.yaml](packages/backend/services/policy-service/openapi.yaml) — expanded evaluate request context + response obligations/audit shape
- [packages/backend/services/auth-service/src/tokens.ts](packages/backend/services/auth-service/src/tokens.ts) — NTI claims in access token model
- [packages/backend/services/auth-service/src/index.ts](packages/backend/services/auth-service/src/index.ts) — login/refresh/verify now include NTI claim flow
- [packages/backend/services/auth-service/test/tokens.test.ts](packages/backend/services/auth-service/test/tokens.test.ts) — NTI claim token test
- [packages/backend/services/auth-service/openapi.yaml](packages/backend/services/auth-service/openapi.yaml) — token verify response includes NTI claims
- [infrastructure/database/migrations/0003_policy_engine_tables.sql](infrastructure/database/migrations/0003_policy_engine_tables.sql) — policy tables migration
- [infrastructure/database/schema.sql](infrastructure/database/schema.sql) — canonical schema includes policy tables and indexes
- [.github/workflows/ci.yml](.github/workflows/ci.yml) — backend quality gates (lint/test/build matrix for auth and policy)
- [scripts/policy-postgres-switch.ps1](scripts/policy-postgres-switch.ps1) — migration/switch helper for Postgres mode
- [Docs/deployment/policy-postgres-switch.md](Docs/deployment/policy-postgres-switch.md) — Postgres switch runbook
- [Docs/deployment/prototype-demo.md](Docs/deployment/prototype-demo.md) — prototype runbook with technical flow diagram
- [Docs/deployment/prototype-demo-talk-track.md](Docs/deployment/prototype-demo-talk-track.md) — stakeholder narrative + technical flow support

Validation performed (latest)
- Command: `npm run prototype:demo`
- Result: passed; scenarios output expected allow/deny behavior and audit count
- Command: `npm run lint --workspace @sigear/policy-service`
- Result: passed

How to run locally (quick)
1. From repository root, run the minimal demo flow:

```powershell
npm run prototype:demo
```

2. Review stakeholder walkthrough notes:

- [Docs/deployment/prototype-demo.md](Docs/deployment/prototype-demo.md)
- [Docs/deployment/prototype-demo-talk-track.md](Docs/deployment/prototype-demo-talk-track.md)

3. Optional: switch to Postgres-backed policy mode:

```powershell
npm run policy:postgres:switch
```

Immediate next steps (priority order)
1. Add auth integration tests (login/refresh/revoke against DB fixtures) in [packages/backend/services/auth-service](packages/backend/services/auth-service).
2. Add explicit policy evaluation hook/middleware into auth runtime path for end-to-end enforcement.
3. Add optional CI smoke for Postgres-backed policy evaluation after migrations.
4. Apply migration 0003 in all target environments used for backend testing/deploy.
5. Begin SDK/client adapter generation from the updated OpenAPI contracts.

Known constraints and notes
- File-backed mode is intentionally default for rapid demo and local onboarding.
- Postgres mode is ready via env switch and migration helper; it should be treated as source-of-truth path for scaled environments.
- Current prototype demonstrates NTI capability/lifecycle enforcement and auditability; remaining work is integration hardening.

Recent additions (2026-04-22)

- `packages/shared/policy-eval` — browser/node evaluator and demo with optional avatar signature verification for local NTI enforcement (`packages/shared/policy-eval/index.js`, demo assets and `verify.test.js`).
- Policy evaluator updates: `reasonCodes` and unknown/unapproved axis reporting added to obligations and audit events (`packages/backend/services/policy-service/src/evaluate.ts`).
- Repository updates: Postgres persistence for `reason_codes` and audit fields (`packages/backend/services/policy-service/src/repository.ts`).
- Database migrations: `0004_add_unknown_axes.sql` and `0005_add_reason_codes.sql` added to record unknown axes and persist `reason_codes` in `policy_audit_events`.
- Tests and CI: audit `reasonCodes` tests and signature verification tests added; CI workflows updated to provision Postgres, apply migrations, and run Postgres-backed tests.

Where we are now

- Core evaluator enforces NTI policy axes and lifecycle states and emits standardized `reasonCodes` for denials and audit classification.
- Audit persistence is verified end-to-end: file-backed NDJSON for demos and Postgres for CI/production; CI now applies migrations and validates Postgres-backed tests.
- Admin API exists to list pending unknown/unapproved events for review; admin UI is the next logical step.
- Shared evaluator and demo provide a reference for browser-local enforcement and optional avatar signing/verification for offline NTI enforcement.

Updated next steps (short list)

1. Apply DB migrations `0004_add_unknown_axes.sql` and `0005_add_reason_codes.sql` in staging and production as part of the Postgres migration runbook.
2. Add an admin UI or lightweight script to review and approve pending unknown/unapproved audit events exposed by the admin API.
3. Add E2E auth integration tests and a policy-evaluation hook/middleware in the auth runtime path.
4. Optional: publish a Grafana dashboard JSON using queries in `Docs/observability/reason_codes_queries.md` to visualize `reason_codes` trends.
5. Generate SDK/client adapters from updated OpenAPI contracts and publish examples for browser enforcement using `packages/shared/policy-eval`.


Outstanding items moved from `Docs/correction_path.md`
-- The following remaining tasks were moved here from `Docs/correction_path.md` and should be treated as handover action items:
- `Commit changelog update` — Commit and push the one-line changelog entry in `Concept/CHANGELOG.md` (TODO in repo).
- `Review NTI minting draft with user and iterate` — Review the drafted NTI minting bootstrap and iterate on proofing tiers, recovery, and audit requirements; track decisions in `Concept/NTI Clean Model.md`.

Archive note
- `Docs/correction_path.md` has been archived to [Docs/archive/correction_path_archived.md](Docs/archive/correction_path_archived.md). The above outstanding items were moved into this handover document for tracking and completion.

