Alignment TODOs for `sync-service`

- Confirm intended sync semantics with NTI lifecycle (reminder/dormant/recovery) (in progress)
- Add idempotent sync endpoints and conflict resolution strategy (pending)
- Add tests for offline/latency scenarios and data reconciliation (pending)
- Add CI checks: lint, test, build (pending)

Progress update (2026-04-22)

- Sync semantics review: note that policy lifecycle states (`dormant`, `recovery`) should enforce read-only or reauth flows — sync endpoints must respect policy decisions returned by the policy-service.
- Next: add integration tests that assert sync behavior under `dormant` and `recovery` lifecycle responses from the policy-service.

