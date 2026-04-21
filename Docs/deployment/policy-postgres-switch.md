# Policy Service Postgres Switch Runbook

This runbook switches `policy-service` from file-backed mode to Postgres mode.

## Quick Start (Windows PowerShell)

From repository root, run:

```powershell
npm run policy:postgres:switch
```

The script will:
1. Start postgres with docker compose.
2. Apply migrations `0001`, `0002`, and `0003`.
3. Print env commands to run `policy-service` in Postgres mode.

## Optional Flags

```powershell
./scripts/policy-postgres-switch.ps1 -SeedPolicyFixtures
./scripts/policy-postgres-switch.ps1 -SeedPolicyFixtures -StartPolicyService
./scripts/policy-postgres-switch.ps1 -SkipComposeUp
```

## What The Script Configures

After success, use these variables in your shell:

```powershell
$env:POLICY_STORAGE_BACKEND="postgres"
$env:POLICY_DATABASE_URL="postgresql://sigear:sigear_dev_password@localhost:5432/sigear_dev"
npm run dev --workspace @sigear/policy-service
```

## Notes

- `policy-service` still defaults to file-backed mode unless `POLICY_STORAGE_BACKEND=postgres` is set.
- Migration `0003_policy_engine_tables.sql` must be applied for Postgres-backed policy evaluation and audit writes.
- If your local `.env` differs, pass values directly:

```powershell
./scripts/policy-postgres-switch.ps1 -DbName mydb -DbUser myuser -DbPassword mypass -DbPort 5432
```
