# SiGear Core Model

SiGear is a four-layer system for identity and consent governance.

## Core Components
1. Governance Module – service-side enforcement
2. NTI + Avatar – policy-carrying identity
![License: AGPL v3](https://img.shields.io/badge/License-AGPL_v3-blue.svg)
![Open Source](https://img.shields.io/badge/Open%20Source-Yes-brightgreen)
![Docs](https://img.shields.io/badge/Documentation-Complete-blue)
![Contributions Welcome](https://img.shields.io/badge/Contributions-Welcome-brightgreen)
![Code of Conduct](https://img.shields.io/badge/Code%20of%20Conduct-Active-purple)
![Security Policy](https://img.shields.io/badge/Security-Responsible%20Disclosure-orange)
![Status](https://img.shields.io/badge/Status-Prototype-yellow)

## SiGear — Proof-of-Enforcement Prototype

SiGear is currently a proof-of-enforcement prototype for identity and consent governance.

It is organised around four components:
1. Governance Module
2. NTI + Avatar
3. SiGear App
4. HomeHub / SocialHub

The current build target is a Docker-hosted command-line prototype, not a full product implementation.

Warning: No component may define its own identity, consent, capability, lifecycle, or audit model. All implementations must use the shared contracts in `/contracts`.

## Repository Structure (focused)
- `docs/core-model/` — simplified core model documentation
- `contracts/` — canonical schemas and OpenAPI specs
- `prototype/` — CLI demos and the minimal proof-of-enforcement demo
- `archive/` — superseded components and experimental materials (preserved)

See `prototype/README.md`, `contracts/README.md`, and `archive/README.md` for details.