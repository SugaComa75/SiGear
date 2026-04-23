## Scenario 3 — Acceptance Criteria

## Acceptance Criteria
- Scenario runs to completion with exit code 0.
- Verifies that consent change requests are logged as pending until explicit user approval.
- Audit events include NTI, request payload, decision, and reason codes.
- Example test: request a high-risk derivative; expect deny and a pending review event.
