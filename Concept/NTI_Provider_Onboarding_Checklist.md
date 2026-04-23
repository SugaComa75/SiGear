# NTI Provider Onboarding Checklist

Purpose: a concise checklist for onboarding identity providers and attestors that will supply authoritative proofs for production NTIs.

1) Eligibility & Legal
- Verify provider legal standing and jurisdictional limits.
- Confirm data processing agreements (DPA), terms, and breach notification SLAs.
- Ensure provider meets applicable identity-proofing standards (e.g., NIST SP 800-63A/B, eIDAS, local KYC regs) as required.

2) Trust Anchor Registration
- Add provider public keys / root certificates to the Trust Anchor Registry.
- Record issuer metadata: `issuer_id`, `display_name`, `jwks_uri`, `revocation_endpoint`, `contact`.
- Define allowed proof types and acceptable signature algorithms.

3) Proof Formats & Claims
- Supported proof formats: Verifiable Credentials (VC, JSON-LD or JWT), JOSE-signed assertions, attestation bundles.
- Canonical claim names to support: `verified_age_range`, `legal_name_hash`, `issuer_id`, `issued_at`, `expiry`.
- Require hashed identifiers or minimal claims when full PII isn't necessary.

4) Signature & Crypto Requirements
- Supported signature algorithms: `ES256`, `ES384`, `RS256` (prefer EC for size/perf); require minimum key lengths for RSA.
- JWKs must be published at `jwks_uri` and support key rotation.
- Timestamping and replay protection: proofs must include `iat` and `nonce` where applicable.

5) Attestation Formats
- Device attestation: accept WebAuthn attestation (packed/android-key/fido-u2f) or TPM/TEE attestation blobs.
- Define canonical attestation verification steps and required metadata (attestor, device_model, confidence_score).

6) Verification & Acceptance Criteria
- Provider must pass a test-suite: signature validation, claim mapping, revocation handling, expiry behavior.
- Provide sample signed proofs and test credentials for staging.
- Define acceptable confidence thresholds per proofing tier.

7) Revocation & Lifecycle
- Provider must publish revocation info (CRL/OCSP-like or revocation webhook/event stream).
- Define reproof cadence and renewal requirements per proofing tier.

8) Logging, Auditability & Privacy
- Agree on audit event formats and fields (avoid PII in logs; use hashes/refs).
- Define retention windows for proof artifacts and hashed records.

9) Operational Onboarding Steps
- Exchange test credentials and JWKS; run integration tests in sandbox.
- Run a staged pilot: limited user population, monitor failures and false positives.
- Complete security review and sign DPA and SLA.

10) Monitoring & Incident Response
- Onboarded providers must supply contact points and incident response procedures.
- Set up automated monitoring for proof validation errors and unusual revocation patterns.

11) Acceptance Checklist (final)
- Signed DPA in place.
- Successful sandbox integration tests (signature validation, revocation handling).
- Production Trust Anchor added and verified.
- Monitoring + SLAs configured.

Next: convert these onboarding points into a machine-readable checklist and add to the provider onboarding docs.
