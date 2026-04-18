# Development Setup

This guide describes the Phase 0 local development workflow.

## Requirements

- Node.js 18.12+
- Docker Desktop
- npm 10+

## First-Time Setup

1. Copy `.env.example` to `.env` and adjust values only if needed.
2. Run `npm install` from the repository root.
3. Start local infrastructure with `docker compose up --build`.

## Available Services

- `auth-service` on port `3001`
- `policy-service` on port `3002`
- `sync-service` on port `3003`
- PostgreSQL on port `5432`
- Redis on port `6379`

## Health Checks

- `GET /health` on each service returns a basic status response.

## Current Phase 0 Purpose

The current service placeholders only prove the local environment, build scripts, and deployment flow.
Business logic belongs to Phase 1 and later.