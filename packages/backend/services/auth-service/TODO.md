Alignment TODOs for `auth-service`

- Ensure compliance with NTI identity model (NTI token mapping) (done: NTI claims added)
- Add OpenAPI spec for auth endpoints (skeleton done)
- Add integration tests for token issuance/rotation (token claim test added; E2E pending)
- Add policy evaluation hooks for SiGear runtime (pending)
- Add CI checks: lint, test, build (done)

Progress update (2026-04-22)

- Access tokens include NTI claims (`ntiIdentityId`, `ntiAssuranceLevel`) and the token verify flow returns NTI shape used by policy evaluation.
- Unit test coverage added for token claim embedding.
- Remaining: add end-to-end auth tests against DB fixtures and a runtime policy-evaluation hook in the auth path to enforce decisions during token-protected operations.

