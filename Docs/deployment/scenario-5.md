## Scenario 5 — Acceptance Criteria

## Acceptance Criteria
- Scenario runs to completion with exit code 0.
- Verifies archival lifecycle prevents writes after archive state.
- Audit events include NTI, request payload, decision, and reason codes.
- Example test: attempt a write in `archive` state; expect deny and audit event.
