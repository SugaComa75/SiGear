Project: SiGear — UK Digital Safety System

## 1. Goals & Scope
- Primary goal: build a demonstrable digital-safety platform that reduces harms to children and vulnerable users while preserving lawful social media use, using identity-led safety (NTI + Avatar) to guide behaviour rather than rely solely on network restrictions.
- Scope (MVP): SBC Hub (home gateway), Mobile App (safe social client + VPN), Parent/School Dashboard, Cloud moderation & reporting services.
- See: Identity and Avatar System.md for identity-layer design

## 2. Key Assumptions
- Data storage and processing must comply with UK law (UK GDPR, DPA 2018) and prefer UK/EU data residency.
- Platform must provide clear audit logs and explainability for automated moderation decisions.
- Integration with third-party social platforms will initially be via safe-view client, DNS filtering, and user-side relay, not full platform integration.

## 3. Identity-Led Safety Requirement (NTI System)

***The system must implement a Non-Transferable Identity (NTI) framework as a core component.

Requirements:

- Each user must have a secure, non-transferable identity bound to their device
- Identity must enable verification of permissions (e.g. age, access level) without exposing personal data
- Identity must support context-aware behaviour across applications and network environments
- Identity must integrate with an adaptive avatar interface to provide user-facing guidance
- Identity must be recoverable and governed via parent or institutional controls

***This identity layer must operate alongside network-level protections to ensure both user-aware and environment-aware safety enforcement.


## 4. Suggested timeline
- Prototype (3 months): architecture, privacy/legal review, basic Hub firmware + mobile app skeleton + parent dashboard mock.
- Pilot (3 months): limited households + schools, monitoring and metrics.

## 5. Stakeholders
- Core team: product lead, backend engineer, embedded systems engineer, mobile dev (iOS/Android), security/privacy engineer, legal/policy advisor.
- External: schools, parent groups, ICO (Information Commissioner), Dept for Digital, Culture, Media & Sport (DCMS).

## 6. Hard constraints / requirements
- Data residency: UK region for personal data.
- Minimal PII retention and strong encryption at rest and in transit.
- Transparent appeals process for moderation.
- Ability to operate with intermittent cloud connectivity (Hub fallback rules).

## 7. Priority Features (MVP)
- Identity-based safety layer (NTI + Avatar) providing passkey authentication, guided interaction, and cross-platform safety enforcement
- Child-safe SBC Hub with DNS-gated firewall and identity-aware profiles (linked to NTI)
- Safe social feed / walled-view in Mobile App guided by avatar interaction layer
- On-device VPN to protect network traffic and enforce safe routes.
- SOS/emergency location and alert button with consented sharing.
- Parent Dashboard: profile monitoring, usage reports, block lists, alerts.
- Automated content flagging pipeline with human review queue.

## 8. Success Metrics
- Reduction in user friction (e.g. fewer repeated access attempts to restricted content due to guided redirection)
- Parent satisfaction with ease of use and reduced need for manual intervention
- Successful cross-platform identity enforcement without additional configuration
- False positive rate of content blocks under X% (define exact target during requirements phase).
- Time-to-review for flagged content < 24 hours.
- Pilot adoption: N households / school groups onboarded.
- Number of prevented or mitigated safety incidents (qualitative reports).

## 9. High-level Architecture
Components:
- Identity Layer (NTI + Avatar): defines user permissions, authentication, and interaction model
- Hub (SBC): local gateway, enforces DNS and firewall policies, local logs, SOS button relay.
- Device clients: Mobile App (safe-view, VPN client), optional desktop clients.
- Edge services: relay/VPN endpoints in UK region, DNS resolver with policy engine.
- Cloud moderation service: queue, automated classifiers (ML), human review UI, audit logs.
- Parent/Admin Dashboard: reports, policy controls, incident management.
- Data stores: encrypted, UK-region, separated PII from analytics.

## 10. Data Flow (MVP)
1. User selects avatar on device
2. Device authenticates using NTI (passkey model)
3. Identity layer determines allowed context (permissions, mode, time)
4. Device traffic routes through Hub or Mobile VPN
5. DNS queries checked against policy store and identity context
6. If content is restricted:
   - system redirects via avatar guidance instead of hard blocking
7. User-generated content (if shared) enters moderation pipeline (classifier -> human review -> publish/blocked)
8. Alerts and safety events forwarded to Parent Dashboard and emergency contacts if SOS triggered
9. Logs & metrics (pseudonymised) stored for analytics and regulator reporting

## 11. Privacy & Compliance Notes
- Identity system ensures minimal disclosure via NTI framework, avoiding transmission of raw personal data wherever possible
- Privacy by design: minimize collection, perform DPIA early, encrypt keys under HSM or KMS with UK tenancy.
- Retention policy: personal logs retained only as long as necessary; analytics aggregated and pseudonymised.
- User rights: export/delete data flows supported.

## 12. Security
- Secure storage of NTI within device secure enclave or equivalent trusted environment
- Secure boot and signed firmware for Hub.
- Mutual TLS for all service endpoints.
- Role-based access for admin/human reviewers and immutable audit trails.

## 13. Pilot plan
- Select volunteer households and one partner school; run 4–6 week staged pilot to gather metrics and feedback.
- Provide clear opt-in consent flows and teacher/parent training.

## 14. Next immediate steps (short term)
- Complete stakeholder & legal review (DPIA, ICO engagement).
- Define concrete success metrics and KPIs.
- Produce detailed system architecture diagram and API spec for moderation pipeline.
- Begin Hub prototype board selection and mobile app skeleton.

## 15. Questions / placeholders
- How will NTI be provisioned and recovered (USB, device binding, parent identity)?- How will NTI be provisioned and recovered (USB, device binding, parent identity)?
- Target pilot size (households/schools)?
- Preferred timeline and budget constraints?
- Any required integrations (specific social platforms, MDM for schools)?
- See: Identity and Avatar System.md for identity-layer design
---

