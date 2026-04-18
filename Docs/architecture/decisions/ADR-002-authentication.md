# ADR-002: Use JWT Access Tokens With Refresh Tokens

## Context

The system needs a simple, inspectable auth model for MVP that can support parent, child, admin, and moderator roles.

## Decision

Use short-lived JWT access tokens with refresh tokens and a documented claim set.

## Consequences

- Easy to integrate across services.
- Clear contract for clients during early development.
- Requires careful key handling before production.
- Good enough for MVP without introducing a full identity platform.