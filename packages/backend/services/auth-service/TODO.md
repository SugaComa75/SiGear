Alignment TODOs for `auth-service`

- Ensure compliance with NTI identity model (NTI token mapping) (in progress: NTI claims added to access token + verify response)
- Add OpenAPI spec for auth endpoints
- Add integration tests for token issuance/rotation (in progress: token claim test added)
- Add policy evaluation hooks for SiGear runtime
- Add CI checks: lint, test, build

Progress update (2026-04-21)

- Access tokens now carry `ntiIdentityId` and `ntiAssuranceLevel` claims.
- `/auth/token/verify` now returns NTI claims for downstream policy integrations.
- OpenAPI skeleton expanded to include `/auth/token/verify` NTI claim response shape.
- CI quality gates now run lint/test/build for `@sigear/auth-service` on push and PR.
- Remaining: end-to-end auth integration tests (login/refresh/revoke against DB) and explicit policy evaluation hook endpoint/middleware.
