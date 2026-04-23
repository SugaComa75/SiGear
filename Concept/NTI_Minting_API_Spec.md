# NTI Minting API - Concise Spec

Purpose: provide a minimal, testable REST API for creating NTIs in sandbox and production with clear differences in trust, anchors, and allowed capabilities.

Overview
- Hosting: sandbox and production use distinct hosts or a distinguishing header: `Host: mint.sandbox.nti.example` or `Host: mint.nti.example`.
- Environments differ by accepted trust anchors, allowed proofing tiers, expiry defaults, and audit/log segregation.

Endpoints

1) POST /v1/mint
- Purpose: request creation of a new NTI.
- Auth:
  - Sandbox: API key or test bearer token allowed.
  - Production: OAuth2 client_credentials + mTLS or JWS-signed request by a registered client; optionally require issuer-signed verifiable credential as proof.
- Request JSON (application/json):
  - `proofing_tier` (string): one of `low|medium|high`.
  - `public_key_jwk` (object): JWK for the NTI public key.
  - `device_attestation` (object, optional): attestation blob or reference (format depends on attestor).
  - `proof_documents` (array of objects, optional): [{"type":"gov_id|email_otp|vc","hash":"sha256...","meta":{}}]
  - `recovery_options` (object): describes chosen recovery flows (e.g., `backup_encrypted=true`, `guardian_ids=[...]`).
  - `environment` (string, optional): `sandbox|production` (prefer host separation).

- Response 201 (created):
  - `nti_id` (string)
  - `public_key_jwk` (object)
  - `proofing_tier` (string)
  - `policy_seed_hash` (string)
  - `capabilities` (object): default capability axes attached
  - `audit_event_id` (string)

- Errors:
  - 400: invalid payload
  - 401: unauthorized
  - 403: forbidden (e.g., attempting high-tier minting from sandbox)
  - 409: conflict (e.g., duplicate key)

2) GET /v1/mint/{nti_id}
- Purpose: retrieve non-sensitive NTI metadata (public key, proofing_tier, capabilities, creation timestamp).
- Auth: read-protected; sandbox vs prod rules apply.

3) POST /v1/mint/{nti_id}/reproof
- Purpose: trigger reproof flow (upgrade proofing tier or refresh proofs).
- Auth: user-authorized action required; emits `reproof_requested` and `reproof_completed` events.

Audit & Events (required minimal fields)
- Each minting-related event must emit: `event_type`, `timestamp`, `nti_id` (if available), `actor` (client_id or user_id hash), `proofing_tier`, `outcome` (`success|failure`), and `event_ref` (opaque id).
- Logs must avoid storing raw PII: store hashes or references to encrypted artifacts only.

Auth & Trust
- Sandbox: accept test trust anchors; allow API key auth. Test anchors must be rejected by production systems.
- Production: require registered clients and trusted issuer credentials. Accept verifiable credentials (VC) signed by registered issuers; validate against trust anchor registry.

Differences: Sandbox vs Production
- Sandbox:
  - Allows deterministic test seeds, shorter expiries, relaxed attestation
  - Emits `mint_test_created` event and stores logs in separate index
  - Rejects requests that request authoritative capabilities (unless explicitly allowed by a staging policy)
- Production:
  - Requires production trust anchors, stronger auth (mTLS/OAuth/JWS)
  - Does not accept deterministic test seeds
  - Enforces stricter PII handling and proof retention policies

Security & Privacy Notes
- Never accept or store private keys server-side.
- Require client-side encryption for any backup seed uploads; store ciphertext only.
- Prefer hashed identifiers and zero-knowledge proofs for sensitive claims when feasible.

Example (sandbox) curl

```bash
curl -X POST "https://mint.sandbox.nti.example/v1/mint" \
  -H "Authorization: ApiKey test-abc123" \
  -H "Content-Type: application/json" \
  -d '{
    "proofing_tier":"low",
    "public_key_jwk":{...},
    "recovery_options":{"backup_encrypted":true}
  }'
```

Example (production) curl (concept)

```bash
curl -X POST "https://mint.nti.example/v1/mint" \
  --cert client.pem --key client.key \
  -H "Authorization: Bearer <oauth2-token>" \
  -H "Content-Type: application/json" \
  -d '{ ... production payload including VC proof ... }'
```

Next steps: convert this concise spec into a small OpenAPI document and add a provider onboarding checklist (proof formats, signature algorithms, attestation formats).
