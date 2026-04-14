# Privacy & Safety by Design — SiGear

## Overview

SiGear is designed as a **privacy-first digital safety system**, where protection is achieved through **minimal data exposure**, **identity-led verification**, and **guided interaction**, rather than surveillance or extensive data collection.

The system uses a **Non-Transferable Identity (NTI)** framework and adaptive avatar interface to ensure that safety decisions can be made **without sharing raw personal data**.

---

## Core Principles

* **Data minimisation by design**
  Only necessary data is collected, with preference for identity-based verification over personal data storage.

* **Privacy-preserving defaults**
  All features default to minimal data sharing, with explicit opt-in for any additional exposure.

* **Selective disclosure**
  Systems verify eligibility (e.g. age, permissions) without transmitting full identity data.

* **Encryption-first architecture**
  Strong encryption in transit and at rest, with UK-region KMS-backed key management.

* **Auditability and explainability**
  All automated moderation and enforcement actions are traceable and explainable.

---

## Identity-Driven Privacy Model (NTI)

The NTI system is a core privacy mechanism.

### Key Characteristics

* No raw personal identity data is required for most system operations
* Identity is used to verify permissions, not expose attributes
* Context-specific identity representations prevent cross-service tracking
* Identity is bound to device and recoverable through governance controls

---

## Avatar as a Privacy Interface

The adaptive avatar contributes to privacy by:

* Acting as a **proxy identity**, avoiding exposure of real-world identifiers
* Translating system behaviour without revealing underlying rules or data
* Reducing need for intrusive prompts or repeated data collection

This ensures children interact with the system in a **safe and non-invasive way**.

---

## Design Actions

* Conduct DPIA and publish summary
* Pseudonymise analytics and separate from PII storage
* Implement consent flows and data export/delete APIs
* Enforce short retention windows for sensitive logs
* Maintain long-term analytics only in aggregated, anonymised form

---

## Security Controls

* Secure boot and signed firmware for Hub
* Mutual TLS for all service communications
* RBAC and MFA for reviewer/admin access
* Immutable audit logs (append-only, tamper-evident storage)
* Secure storage of NTI within trusted device environments

---

## Data Handling Model

* **PII and analytics are physically and logically separated**
* **Identity-based verification reduces need for stored personal data**
* **Logs are minimised and scoped to safety events only**
* **No persistent cross-service identifiers are exposed externally**

---

## Compliance Checklist (Pilot Phase)

* DPIA completed and reviewed
* ICO engagement initiated
* Data Processing Agreements in place with all providers
* Record of Processing Activities (RoPA) maintained
* Identity system reviewed against UK GDPR principles (data minimisation, purpose limitation)

---

## Strategic Positioning

SiGear demonstrates a shift from:

> data-driven safety (monitoring, tracking, logging)

to:

> identity-driven safety (verification, guidance, minimal disclosure)

This aligns with UK and EU regulatory direction toward:

* reduced data collection
* stronger user privacy
* transparent and accountable systems

---

## Summary

SiGear achieves privacy and safety by:

* Minimising personal data collection
* Using identity to verify rather than expose
* Providing guidance instead of surveillance
* Maintaining transparency and user control

The NTI and Avatar framework ensures that **children can be protected without being tracked**.
