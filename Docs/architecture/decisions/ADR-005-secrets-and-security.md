# ADR-005: Keep MVP Secrets Handling Simple

## Context

The project needs safe local development without letting infrastructure work block product progress.

## Decision

Use `.env` files for local development in MVP Phase 0 and plan managed secrets for later environments.

## Consequences

- Fast setup for the current two-person team.
- Lower operational overhead during foundation work.
- Production secret management still needs a later ADR or extension of this one.