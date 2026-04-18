# ADR-001: Use PostgreSQL for Persistent Storage

## Context

SiGear needs a relational data model for users, identities, policies, devices, and audit logs.

## Decision

Use PostgreSQL 15 as the primary system of record.

## Consequences

- Strong fit for relational integrity and audit-heavy data.
- Good support for JSONB where flexible policy rules are needed.
- Straightforward local development with Docker.
- Requires schema discipline early.