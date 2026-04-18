# ADR-003: Use Node.js and TypeScript for Core Services

## Context

Phase 0 needs a backend stack that is fast to scaffold, strongly typed, and contributor-friendly.

## Decision

Use Node.js 20, TypeScript, and Express for the first backend services.

## Consequences

- Shared language across services and web tooling.
- Type safety improves API contract consistency.
- Express is deliberately simple and easy to replace later if needed.