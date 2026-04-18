# SiGear Architecture Overview

This document records the Phase 0 architecture choices that the initial build will use.

## Locked Defaults for Phase 0

- Backend runtime: Node.js 18.12+ + TypeScript
- Backend HTTP framework: Express
- Database: PostgreSQL 15
- Cache: Redis 7
- Dashboard frontend: React + TypeScript
- Hub target: Raspberry Pi 4
- Local secrets: `.env`
- Mobile MVP: iOS first
- Desktop MVP: macOS first

## Why These Defaults

- TypeScript reduces contract drift while the service boundaries are still forming.
- PostgreSQL gives a clean relational model for identity, policy, devices, and audit logs.
- Redis covers rate limiting, token support, and short-lived sync state without adding early complexity.
- React keeps the dashboard path conventional and contributor-friendly.
- Raspberry Pi 4 is adequate for a first enforcement hub and easy to source.

## First Critical Path

1. AuthenticationService
2. PolicyEngine
3. HomeHubApp
4. SyncService
5. MobileApp

Everything in Phase 0 is intended to stabilize that path.