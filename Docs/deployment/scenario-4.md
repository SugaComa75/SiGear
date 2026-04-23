## Scenario 4 — Acceptance Criteria

## Acceptance Criteria
- Scenario runs to completion with exit code 0.
- Verifies that recovery flows require re-authentication where policy mandates.
- Audit events include NTI, request payload, decision, and reason codes.
- Example test: trigger a recovery attempt without re-authentication; expect deny.
