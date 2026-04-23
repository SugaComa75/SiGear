Running Postgres-backed tests locally

Quick steps to run the Postgres-backed audit tests locally (Windows / PowerShell + Docker):

1) Start a Postgres container (Docker):

```powershell
# starts Postgres on localhost:5432 with user/password postgres
docker run --rm --name sigear-pg -e POSTGRES_PASSWORD=postgres -e POSTGRES_USER=postgres -e POSTGRES_DB=postgres -p 5432:5432 -d postgres:15
```

2) Wait for Postgres to be ready (or use pg_isready):

```powershell
for ($i=0; $i -lt 30; $i++) { docker exec sigear-pg pg_isready -U postgres && break; Start-Sleep -Seconds 1 }
```

3) Apply schema and migrations (requires `psql` client). From repo root run:

```powershell
$env:PGPASSWORD = 'postgres'
psql -h localhost -U postgres -d postgres -c "CREATE EXTENSION IF NOT EXISTS pgcrypto;"
psql -h localhost -U postgres -d postgres -f infrastructure/database/schema.sql
psql -h localhost -U postgres -d postgres -f infrastructure/database/migrations/0004_add_unknown_axes.sql || Write-Host 'migration 0004 may already be applied'
psql -h localhost -U postgres -d postgres -f infrastructure/database/migrations/0005_add_reason_codes.sql || Write-Host 'migration 0005 may already be applied'
```

4) Export DB URL and run tests from the package folder:

```powershell
setx POLICY_DATABASE_URL "postgres://postgres:postgres@localhost:5432/postgres"
# open a new PowerShell or set env for current session
$env:POLICY_DATABASE_URL = 'postgres://postgres:postgres@localhost:5432/postgres'
cd packages/backend/services/policy-service
npm test
```

5) Stop the container when done:

```powershell
docker stop sigear-pg
```

Notes
- The CI uses a similar approach (service container + `psql` to apply schema). If you prefer, use a local Postgres installation instead of Docker.
- Migrations include `0004_add_unknown_axes.sql` and `0005_add_reason_codes.sql`; the `psql` commands use fallbacks because re-applying migrations is harmless in local test runs.
