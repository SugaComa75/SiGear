# Prototype Minting Demo — Talk Track

Use this script while running the minting demo to explain the flow and key assurances.

Opening (20s)
- "This demo shows how a Neutral Trusted Identity (NTI) is minted in a sandbox: a privacy-preserving, auditable identity object that's cryptographically bound to a device/user and includes a recovery plan."

What to show (30s)
- Point out the CLI output: `nti_id`, `policy_seed_hash`, and `audit_event_id`.
- Emphasize that the demo uses a local sandbox mock server — this is not a production identity and cannot be used as an authoritative ID.
 - Point out the CLI output: `nti_id`, `policy_seed_hash`, `audit_event_id`, `non_transferable`, and `avatar_claim`.
 - Emphasize that the demo uses a local sandbox mock server — this is not a production identity and cannot be used as an authoritative ID.

Security and privacy notes (30s)
- Keys are generated on the client and only the public key is sent to the mint service.
- Audit events are emitted for every step of the minting flow; in production these audits exclude PII and use hashed references.
- Recovery options are set but encrypted backups must be client-side encrypted before upload in production.

Why this matters (20s)
- Minting establishes a portable, auditable identity with policy defaults and recovery options. The prototype shows how proofing tiers and recovery choices map to capabilities.

Demo steps narration (live)
- "I'll start the local mint mock server. Then I'll run the CLI which generates a keypair and requests minting at the sandbox endpoint. The server returns the NTI id and audit event id, which proves the operation completed."

Closing (10s)
- "This is a simple sandbox demonstration of minting. Post‑MVP, production NTIs will be created only after appropriate proofing and via trusted issuer integration — the onboarding checklist documents those requirements."
