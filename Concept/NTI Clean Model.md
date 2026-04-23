# NTI SYSTEM — CORE FEATURE SET (CLEAN MODEL)

This document captures the converged, canonical NTI model and constraints to guide implementation across the SiGear project.

## 1. Identity Layer (NTI Core)

NTI (Neutral Trusted Identity)

Purpose
- A persistent, user-owned identity authority that defines:
  - what data can be used
  - how it can be processed
  - how long it can exist
  - what transformations are allowed

Key properties
- cryptographically bound to user (key pair or equivalent)
- portable across services
- independent of any single app
- versioned policy state (not static settings)

## 2. Capability-Based Consent Model (Global Rules)

Seven universal permission axes (capability axes):
1. Identity linkage — anonymous / pseudonymous / fully identifiable
2. Storage duration — session-only / time-limited retention / long-term storage allowed
3. Derivative creation — none / aggregation only / AI/model training allowed / synthetic derivative reuse allowed
4. Purpose scope — single purpose / related purposes / general system improvement allowed
5. Cross-service sharing — isolated / ecosystem-limited / unrestricted transfer
6. Monetisation use — prohibited / indirect optimisation only / full commercial targeting allowed
7. Transparency level — full audit visibility / summary-only visibility / system-only logging

## 3. Enforcement Layer (SiGear Runtime)

SiGear — policy enforcement engine between apps and NTI.

Responsibilities
- evaluate every data-use request from apps
- check against NTI capability constraints
- allow / deny / constrain execution
- log all access attempts

Rule: Apps never interpret consent. They only request permission execution.

## 4. Avatar Layer (Identity Proxy)

Purpose
- A user-bound “execution proxy” of NTI identity state.

Function
- carries session identity into apps
- provides authentication binding (public/private key handshake)
- ensures requests are tied to verified user identity state

Constraint
- Avatar does NOT create or modify permissions — it reflects NTI state only.

## 5. Consent Lifecycle System

State model (non-destructive by default):
- Active: full permissions active
- Reminder: triggered by inactivity threshold or sensitive permission change request; notifications only
- Dormant: triggered after extended inactivity; no new data processing; existing data frozen (read-only for system use); no new derivative creation or monetisation use
- Recovery: triggered by user re-authentication; full restoration
- Archive: optional, long-term storage only; no processing/sharing/derivation
- Hard deletion: explicit only; requires confirmed user intent

## 6. Decay / Inactivity Logic (Safe Version)

Inactivity triggers (examples):
- 30–90 days: Reminder state
- 3–6 months: Dormant state
- 6–12 months: Archive recommendation

Key rule: Inactivity never creates new permission; it only reduces system activity.

## 7. Consent Change Control

Rules
- only user can escalate permissions
- apps can request changes, never enforce them
- NTI validates all changes
- time-delayed high-risk changes: 72-hour review window for sensitive permission expansion
- immediate revocation always allowed
- no silent upgrades of consent scope

## 8. Cryptographic Trust Model

- public/private key identity binding
- periodic re-authentication required for sensitive scopes
- revocation if trust link breaks

Important: keys authenticate identity, they do not grant authority over consent rules.

## 9. App Interaction Model

Apps can only:
- request capability use
- receive allowed/denied responses
- operate within constrained scope

Apps cannot:
- redefine consent
- infer expanded permission
- override NTI policy state

## 10. Global vs Per-App Model

- Global NTI layer defines universal permission boundaries.
- Per-app layer provides contextual interpretation only and may be stricter but never looser.

## Core Design Principles
1. Consent is structural, not UI-based
2. Identity is persistent and portable
3. Apps are constrained executors, not interpreters
4. Inactivity reduces exposure, never expands permission
5. Destructive actions are always explicit and user-confirmed

## Project Role & Roadmap Note

This NTI system is a personal data governance layer intended to act as infrastructure across social and non-social apps. The `Social Hub` will be the first deployment target (schools and clubs) to validate avatar and NTI flows; the NTI/Avatar API will be the template for other social apps and websites to integrate.

Keep enforcement boundaries and simplicity as primary design constraints to avoid permission explosion and silent consent drift.

## Additional Operational Sections

### NTI Minting Proofing Bootstrap
Describe the minimal secure bootstrap flow for creating an NTI. The goal is a minimal, auditable, and privacy-preserving minting flow that provides sufficient proofing for the chosen risk tier while keeping the user in control.

Minimal bootstrap flow (recommended):
- 1) Initiate mint request: app asks NTI service to begin minting and records a `mint_requested` audit event.
- 2) Choose proofing tier: user/app selects a proofing level (low/medium/high) appropriate to requested capabilities. Record `proofing_tier_selected`.
- 3) Device & entropy binding:
  - Generate a new key-pair inside a device-backed secure enclave or browser WebCrypto (prefer enclave when available).
  - Collect device attestation (TPM/TEE attestation or WebAuthn attestation) when available.
  - Seed additional entropy from user action (e.g., passphrase) or OS crypto; never transmit raw seed to third parties.
  - Record `keypair_generated` and `device_attestation_collected` audit events.
- 4) Proofing checks (tier-dependent):
  - Low: confirm a reachable contact (email or OTP phone) and device attestation.
  - Medium: add stronger identity checks (government ID verification via vetted provider OR cross-reference with existing verified account) and time-limited biometric check if available.
  - High: require authoritative proof (third-party KYC) and multi-factor device binding.
  - Always prefer age-range verification over storing full DOB when only age matters.
  - Record `proofing_started`, `proofing_step_completed` and final `proofing_completed` events with non-sensitive metadata (no PII in logs).
- 5) Mint creation and policy seed:
  - Create the NTI object containing public key, chosen capability defaults, proofing tier, and policy seed (hash-only references to proofs).
  - Emit `mint_created` and `policy_seed_attached` audit events.
- 6) Recovery setup (required):
  - Offer at least one recovery mechanism: encrypted backup to user-controlled cloud, recoverable hardware key (YubiKey), or social/recovery recovery guardian flows.
  - If using passphrase-seed backup, require client-side encryption before upload; store only ciphertext and metadata.
  - Record `recovery_setup_completed`.
- 7) Finalize and display UID/Avatar claim:
  - Return a stable identifier (NTI id) and an avatar claim for UI; record `mint_finalized`.

Required checks and obligations (summary):
- Proofing level must match requested capability sensitivity; conservative defaults are recommended.
- Keep audit logs PII-free: store event types, timestamps, non-identifying verification outcomes, and hashes/references to proof artifacts.
- Never store private keys on server side; retain only public keys and encrypted recovery artifacts.
- Explicit user consent required before attaching high-sensitivity capabilities (e.g., monetisation, cross-service sharing).

Entropy & cryptography notes:
- Prefer hardware-backed key generation (TEE/TPM/WebAuthn) where possible.
- Use platform-provided CSPRNG; additionally allow user-seeded entropy as an option (never as sole entropy source).

Recovery & reproofing:
- Define reproof cadence based on proofing tier and life-stage rules (e.g., medium-tier reproof every 18 months).
- Support cryptographic backup rotation: allow user to rotate keys while keeping link to original NTI via signed delegation records.

Audit events (recommended list):
- `mint_requested`, `proofing_tier_selected`, `keypair_generated`, `device_attestation_collected`, `proofing_started`, `proofing_step_completed`, `proofing_completed`, `mint_created`, `policy_seed_attached`, `recovery_setup_completed`, `mint_finalized`.

Privacy & minimal data retention:
- Retain only what is needed for audit and policy enforcement; remove or hash proof artifacts after a retention window unless the user explicitly opts-in to longer storage.

Next steps: formalize proofing tiers, map each NTI capability axis to required proofing level, and create a short API spec for the minting endpoints and audit payloads.

#### Test NTI (development / sandbox mode)

Purpose:
- Allow developers, QA, and automated tests to create NTI objects in a controlled sandbox without granting real-world identity authority.

Requirements and constraints:
- Test NTIs must be explicitly marked as test-only (e.g., `environment: sandbox` or `test=true`) and emit `mint_test_created` audit events.
- Test NTIs must default to the lowest capability settings and should be denied high-sensitivity capabilities (monetisation, cross-service sharing) by default.
- Test keys and attestations used in sandbox must be issued by test trust anchors; production services must reject these anchors.
- Test NTIs should have short, configurable expirations (e.g., 24–90 hours) and an automated garbage-collection policy.
- Recovery flows in test mode may be simplified but must remain segregated from production recovery stores.
- Logs for test minting should be stored in a separate audit index and clearly labelled to avoid accidental mixing with production logs.

Implementation notes:
- Provide a dedicated sandbox endpoint (e.g., `mint.sandbox.nti.example`) and a feature-flag to allow test minting in staging environments.
- Offer test fixtures and CLI helpers to generate reproducible test NTIs for automated tests; include a deterministic test seed option guarded behind dev-only flags.
- Ensure UI and API surfaces present a visible warning when operating with a test NTI: "This is a test identity — not valid for real-world verification."

Migration caution:
- Do NOT allow implicit promotion of a test NTI to production. Any migration must require full reproofing under production proofing rules and explicit user re-consent.

#### Post‑MVP: Authorized Identity Integration (real‑world use)

Goal:
- Define how NTIs become recognized, authoritative identities for real‑world use by integrating with reputable identity providers and trust anchors.

High-level requirements:
- Trusted issuers: production NTIs that assert real-world identity attributes must be backed by accredited identity providers (government ID providers, accredited KYC vendors, universities, employers) or trusted federation anchors.
- Legal & compliance: integrations must meet applicable regulatory requirements (data protection, identity-proofing standards) and contractual SLAs with identity providers.
- Trust anchors & verification: maintain a registry of approved trust anchors and document verification/attestation formats (e.g., signed claims, verifiable credentials). Production services should validate signatures against this registry.
- Revocation & lifecycle: support a revocation mechanism (CRL/OCSP-like or hashed revocation events) and clear lifecycle policies for reproofing, suspension, and revocation.
- Minimal claims & mapping: define a canonical claim set for authorized attributes (e.g., `verified_age_range`, `legal_name_hash`, `issuer_id`) and map these to NTI capability axes to determine which capabilities are permitted.

Migration and user experience:
- Provide a clear upgrade/reproof path for existing NTIs: record `reproof_requested` and `reproof_completed` events and require user confirmation before binding authoritative attributes.
- Keep privacy-preserving defaults: prefer storing hashed identifiers or zero-knowledge proofs where feasible rather than raw PII.

Operational governance:
- Establish partner onboarding, audit, and monitoring criteria for identity providers supplying authoritative proofs.
- Require periodic attestation renewals from providers and automated monitoring for issuer compromise.

Developer and API notes:
- Define production minting endpoints that only accept proofs from registered issuers and reject test anchors.
- Document required request/response schemas, required audit fields, and the expected cryptographic formats (e.g., JSON-LD verifiable credentials, JOSE signatures).

Next step: produce a concise API spec and provider onboarding checklist for production-authoritative NTIs.

### Non-Transferable Operational Definition

Define operational rules that ensure NTIs remain non-transferable. Include cryptographic binding details, account recovery policies, and explicit checks preventing credential export/import flows.

### Avatar As Visual Identifier (Not Enforcement Authority)

Clarify that avatars are the UI/UX representation of NTI state only; they are not authority components that can change permission or consent. Provide examples of acceptable avatar actions (display, limited session claims) and prohibited actions (escalation of permissions).

### Life-Stage Evolution

Outline how NTI consent and capability axes evolve across user life-stages (e.g., toddler → child → adolescent). Define migration paths, required reproofing, and rules for automatic decay or escalation tied to verified life-stage changes.

### Post-MVP Platform Integration

Roadmap notes for integrating NTI into larger platforms post-MVP. Include compatibility notes (APIs, data contracts), required migrations, and suggested governance patterns for platform partners.
