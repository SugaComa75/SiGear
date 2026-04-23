## Scenario 6 — Acceptance Criteria

## Acceptance Criteria
- Scenario runs to completion with exit code 0.
- Validates migration path: file-backed policies can be migrated to Postgres-backed mode and produce equivalent decisions.
- Migrations preserve audit event integrity and do not lose decision metadata.
- Example test: run file-backed scenario, switch to Postgres mode, re-run and compare decisions/audit counts.
