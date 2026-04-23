Upgrade notes: audit unknown/unapproved axes

This repository added two audit columns to the `policy_audit_events` table:

- `unknown_requested_axes` (TEXT[])
- `unapproved_requested_axes` (TEXT[])

To migrate an existing Postgres database, run the SQL migration in:

  infrastructure/database/migrations/0004_add_unknown_axes.sql

Example using `psql`:

```bash
psql "$DATABASE_URL" -f infrastructure/database/migrations/0004_add_unknown_axes.sql
```

Once applied, the policy service will write the new columns automatically.

Consider adding a GIN index (migration included) to speed searches for pending
unknown/unapproved axes in admin UIs.
