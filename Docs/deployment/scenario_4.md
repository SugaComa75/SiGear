## Scenario 4 — Acceptance Criteria

## Acceptance Criteria
- Scenario runs to completion with exit code 0.
- Validates admin review workflow: pending unknown events can be listed and approved via admin endpoint.
- After admin approval, previously denied requests are accepted and corresponding audit events reflect the approval.
- Example test: list pending events, approve one, re-run request, expect allow.
