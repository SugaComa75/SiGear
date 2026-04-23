## Terminology

Canonical Terms

- Neutral Trusted Identity (NTI): a neutral, trusted, cryptographically-bound digital identity that is non-transferable and treated as a governed asset for consent, audit, and lifecycle management. "Non-transferable" is an explicit property of an NTI, not part of the primary name.

Notes

- Use the full phrase `Neutral Trusted Identity (NTI)` on first mention, then `NTI` thereafter.
- The project previously used the phrasing "Non-Transferable Identity"; that wording has been deprecated in favor of the canonical term above.
- In governance or legal contexts it is acceptable to describe an NTI as a "non-transferable asset" to emphasize control and auditability, but do not use that as the primary name in technical docs.

If you want additional terms added here (e.g., `Avatar`, `Consent Anchor`, `Lifecycle`), tell me which ones and I will add concise definitions.

Defined Terms

- Avatar: the user-visible, session-bound representation of an NTI used as an interaction proxy. An avatar carries non-authoritative session claims and UI/UX state tied to an NTI but does not have the authority to change consent or policy. Avatars assist with authentication, child-friendly guidance, and contextual presentation of safety signals.

- Consent Anchor: a logical record (and stored reference) within an NTI that binds a user's consent decisions to a timestamped, versioned policy statement. Consent Anchors are immutable audit points used to validate allowed data uses and to support reviews, revocations, and governance checks.

- Lifecycle (NTI Consent Lifecycle): the canonical set of NTI states governing permission and data-use behaviour (e.g., Active, Reminder, Dormant, Recovery, Archive, Hard deletion). Lifecycle rules define allowed processing, derivative creation, and archival constraints and are enforced by policy evaluation at request time.

