# SiGear

SiGear is a safety-first identity and consent system. This repository is organised around the four product elements, with shared contracts and proof-of-concept demonstrations kept separate from production-facing code.

## Product elements

| Element | Folder | Responsibility |
| --- | --- | --- |
| Identity and minting | [`apps/identity-and-minting`](apps/identity-and-minting) | Authorise a person or guardian, mint an ID/Avatar, bind it to trusted devices, and support recovery/revocation. |
| Site integration | [`apps/site-integration`](apps/site-integration) | The program/SDK installed by participating sites, from small club hubs to large social platforms, to request and enforce SiGear decisions. |
| Home app | [`apps/home-app`](apps/home-app) | User and family preferences, consent, child profiles, parental controls, device membership, and household synchronisation. |
| Mobile app | [`apps/mobile-app`](apps/mobile-app) | Authentication, approval prompts, and a readable audit log when a site requests or attempts disallowed actions. |

Each folder has its own README describing its boundary and the code currently present.

## Supporting areas

- [`contracts`](contracts) contains the canonical OpenAPI contracts. Product code must not invent a separate identity, consent, capability, lifecycle, or audit model.
- [`shared`](shared) contains reusable enforcement logic.
- [`infrastructure`](infrastructure) contains database schema and migrations.
- [`proof-of-concept`](proof-of-concept) contains demonstrations and test harnesses. These prove behaviour but are not production applications.
- [`Docs`](Docs) contains architecture, concept, deployment, governance, and project material.
- [`../Website-Files`](../Website-Files) contains the deployable static website export. See its README for the product-to-page map.

## Quick start

Requirements: Node.js 18.12 or later, npm, and Docker when running the service stack.

```text
npm install
npm test
npm run typecheck
```

Run the preserved minting CLI demonstration:

```text
npm run poc:install
npm run poc:cli
```

Start the service stack:

```text
docker compose up --build
```

## Repository policy

Generated dependencies, virtual environments, compiled output, runtime logs, local keys, and minted Avatar files are ignored. Install or generate them locally rather than committing them.

SiGear is currently a prototype. Nothing in `proof-of-concept` should be treated as production identity proofing, parental control, or security enforcement.

## Licence and contribution

The project is licensed under AGPLv3. Security reporting is described in [`SECURITY.md`](SECURITY.md), and contributor guidance is in [`Docs/Project_Contributers_Info`](Docs/Project_Contributers_Info).
