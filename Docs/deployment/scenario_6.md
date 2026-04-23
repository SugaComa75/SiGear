## Scenario 6 — Acceptance Criteria

## Acceptance Criteria
- Scenario runs to completion with exit code 0.
- Verifies policy denies model-training requests involving NTI-linked protected data.
- Audit events include NTI, request payload, decision, and reason codes.
- Example test: request model training on protected dataset; expect deny and audit.
## Scenario 6 — Acceptance Criteria

## Acceptance Criteria
- Scenario runs to completion with exit code 0.
- Validates migration path: file-backed policies can be migrated to Postgres-backed mode and produce equivalent decisions.
- Migrations preserve audit event integrity and do not lose decision metadata.
- Example test: run file-backed scenario, switch to Postgres mode, re-run and compare decisions/audit counts.
