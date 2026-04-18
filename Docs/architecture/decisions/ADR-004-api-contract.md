# ADR-004: Define Service Contracts in OpenAPI First

## Context

The roadmap depends on multiple services and clients evolving together without constant interface drift.

## Decision

Create and maintain an OpenAPI skeleton before implementing service logic.

## Consequences

- UI and backend can iterate against stable contracts.
- Refactoring becomes intentional instead of accidental.
- The contract document must be maintained as part of implementation.