SiGear Policy Engine — TL;DR

SiGear enforces a "fail-closed" NTI policy model: any new or unknown capability axis is denied by default until explicitly reviewed. Decisions include machine-readable `reasonCodes` for reliable auditing and dashboards. Audit events persist to file for demos and to Postgres (JSONB + TEXT[]) in production; CI runs Postgres-backed tests to validate end-to-end behavior.

The repo also includes a browser-compatible evaluator with optional avatar signing/verification for offline NTI enforcement, and an admin API to list pending unknown/unapproved events for reviewer workflows.
