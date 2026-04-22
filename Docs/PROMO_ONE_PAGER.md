SiGear Policy Engine — One Page Summary

Overview
- Enforces NTI policy axes and consent lifecycle with a conservative, "unknown = denied" default for new capabilities.

Key Features
- Fail-closed enforcement for unknown/unapproved capability axes
- Machine-readable `reasonCodes` in every denial for analytics and dashboards
- Audit persistence: file-backed NDJSON for demos, Postgres (JSONB + TEXT[]) for production
- Browser/node shared evaluator with optional avatar signature verification for offline enforcement
- Admin API to surface pending unknown/unapproved events for human review

How it works (brief)
- Requests to `/v1/evaluate` return allow/deny, obligations, and `reasonCodes`.
- Audit events include `unknownRequestedAxes`, `unapprovedRequestedAxes`, and `reasonCodes`; Postgres migrations (0004/0005) add columns and indexes.
- Admin reviewers use the admin API to list and approve events; approvals update rules/consents and future evaluations.

Getting started (quick)
1. Run prototype demo:

```powershell
npm run prototype:demo
```

2. Switch to Postgres-backed mode (optional):

```powershell
npm run policy:postgres:switch
```

Contact / Next steps
- Open a PR for the admin UI and docs, or ask for a marketing-ready slide/deck.
