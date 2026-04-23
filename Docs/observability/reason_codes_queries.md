# Reason Codes — Dashboard & SQL Examples

This document provides example SQL queries and dashboard patterns to surface and trend denial reason codes recorded in `policy_audit_events.reason_codes`.

Postgres connection: set `POLICY_DATABASE_URL` to your DB (CI uses `postgres://postgres:postgres@localhost:5432/postgres`).

1) Top denial reason codes (count)

```sql
SELECT unnest(reason_codes) AS reason_code, count(*) AS cnt
FROM policy_audit_events
GROUP BY reason_code
ORDER BY cnt DESC
LIMIT 50;
```

2) Denials over time for a specific reason

```sql
SELECT date_trunc('hour', created_at) AS bucket, count(*) AS cnt
FROM policy_audit_events
WHERE reason_codes @> ARRAY['UNKNOWN_CAPABILITY_AXIS']
GROUP BY bucket
ORDER BY bucket DESC
LIMIT 168;
```

3) Recent pending unknown/unapproved events with reason codes

```sql
SELECT id, created_at, identity_id, action, reason_codes, unknown_requested_axes, unapproved_requested_axes
FROM policy_audit_events
WHERE (COALESCE(array_length(unknown_requested_axes,1),0) > 0)
   OR (COALESCE(array_length(unapproved_requested_axes,1),0) > 0)
ORDER BY created_at DESC
LIMIT 200;
```

4) Most common unknown axes attempted

```sql
SELECT unnest(unknown_requested_axes) AS axis, count(*) AS cnt
FROM policy_audit_events
GROUP BY axis
ORDER BY cnt DESC
LIMIT 50;
```

5) Dashboard filters / alerts
- Filter by `reason_codes` contains `UNKNOWN_CAPABILITY_AXIS` to show emerging feature attempts.
- Filter by `CONSENT_DORMANT_READ_ONLY` to find apps attempting write operations when consent is dormant.
- Create a threshold alert when a given `reason_code` count spikes (e.g., +200% week-over-week).

6) Notes
- `reason_codes` are stable, short codes intended for machine consumption (dashboards, filters, regulatory export).
- Audit payload (`payload`) contains the full JSON audit event for deeper inspection.

Use these queries in Grafana (Postgres datasource), Metabase, or any BI tool. Adjust time bucketing and limits to match dashboard needs.
