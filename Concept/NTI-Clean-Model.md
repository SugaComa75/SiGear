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

Describe the minimal secure bootstrap flow for creating an NTI. Include obligations for proofing (age, device binding), entropy sources, and recovery mechanisms. This section should list required checks and the expected audit events emitted during minting.

### Non-Transferable Operational Definition

Define operational rules that ensure NTIs remain non-transferable. Include cryptographic binding details, account recovery policies, and explicit checks preventing credential export/import flows.

### Avatar As Visual Identifier (Not Enforcement Authority)

Clarify that avatars are the UI/UX representation of NTI state only; they are not authority components that can change permission or consent. Provide examples of acceptable avatar actions (display, limited session claims) and prohibited actions (escalation of permissions).

### Life-Stage Evolution

Outline how NTI consent and capability axes evolve across user life-stages (e.g., toddler → child → adolescent). Define migration paths, required reproofing, and rules for automatic decay or escalation tied to verified life-stage changes.

### Post-MVP Platform Integration

Roadmap notes for integrating NTI into larger platforms post-MVP. Include compatibility notes (APIs, data contracts), required migrations, and suggested governance patterns for platform partners.

