## Scenario 6 — Acceptance Criteria

## Acceptance Criteria
- Scenario runs to completion with exit code 0.
- Verifies policy denies model-training requests involving NTI-linked protected data.
- Audit events include NTI, request payload, decision, and reason codes.
- Example test: request model training on protected dataset; expect deny and audit.
