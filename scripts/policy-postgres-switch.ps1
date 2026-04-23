param(
  [string]$DbName = $(if ($env:POSTGRES_DB) { $env:POSTGRES_DB } else { "sigear_dev" }),
  [string]$DbUser = $(if ($env:POSTGRES_USER) { $env:POSTGRES_USER } else { "sigear" }),
  [string]$DbPassword = $(if ($env:POSTGRES_PASSWORD) { $env:POSTGRES_PASSWORD } else { "sigear_dev_password" }),
  [int]$DbPort = $(if ($env:POSTGRES_PORT) { [int]$env:POSTGRES_PORT } else { 5432 }),
  [switch]$SkipComposeUp,
  [switch]$SeedPolicyFixtures,
  [switch]$StartPolicyService
)

$ErrorActionPreference = "Stop"

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
Set-Location $repoRoot

$migrations = @(
  "infrastructure/database/migrations/0001_initial_schema.sql",
  "infrastructure/database/migrations/0002_auth_refresh_tokens.sql",
  "infrastructure/database/migrations/0003_policy_engine_tables.sql"
)

if (-not $SkipComposeUp) {
  Write-Host "Starting postgres service via docker compose..."
  docker compose up -d postgres | Out-Null
}

Write-Host "Waiting for postgres readiness..."
$ready = $false
for ($attempt = 1; $attempt -le 30; $attempt++) {
  docker compose exec -T postgres pg_isready -U $DbUser -d $DbName | Out-Null
  if ($LASTEXITCODE -eq 0) {
    $ready = $true
    break
  }

  Start-Sleep -Seconds 1
}

if (-not $ready) {
  throw "Postgres did not become ready in time."
}

foreach ($migration in $migrations) {
  if (-not (Test-Path $migration)) {
    throw "Migration file not found: $migration"
  }

  Write-Host "Applying migration: $migration"
  Get-Content -Raw $migration | docker compose exec -T postgres psql -v ON_ERROR_STOP=1 -U $DbUser -d $DbName | Out-Null
  if ($LASTEXITCODE -ne 0) {
    throw "Failed to apply migration: $migration"
  }
}

if ($SeedPolicyFixtures) {
  Write-Host "Seeding minimal policy fixtures..."
  $seedSql = @"
INSERT INTO policy_rules (id, version, allowed_purposes, capability_axes)
VALUES (
  '11111111-1111-4111-8111-111111111111',
  1,
  ARRAY['safety_moderation'],
  '{"identity_linkage":"pseudonymous","storage_duration":"time_limited","derivative_creation":"aggregation","purpose_scope":"related","cross_service_sharing":"ecosystem","monetisation_use":"prohibited","transparency_level":"full_audit"}'::jsonb
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO policy_consents (id, identity_id, rule_id, state)
VALUES (
  '22222222-2222-4222-8222-222222222222',
  'user:999',
  '11111111-1111-4111-8111-111111111111',
  'active'
)
ON CONFLICT (id) DO NOTHING;
"@

  $seedSql | docker compose exec -T postgres psql -v ON_ERROR_STOP=1 -U $DbUser -d $DbName | Out-Null
  if ($LASTEXITCODE -ne 0) {
    throw "Failed to seed policy fixtures."
  }
}

$databaseUrl = "postgresql://$DbUser`:$DbPassword@localhost`:$DbPort/$DbName"
Write-Host ""
Write-Host "Postgres mode is ready. Use these commands in your shell:"
Write-Host "`$env:POLICY_STORAGE_BACKEND=\"postgres\""
Write-Host "`$env:POLICY_DATABASE_URL=\"$databaseUrl\""
Write-Host "npm run dev --workspace @sigear/policy-service"

if ($StartPolicyService) {
  Write-Host ""
  Write-Host "Starting policy-service in postgres mode..."
  $env:POLICY_STORAGE_BACKEND = "postgres"
  $env:POLICY_DATABASE_URL = $databaseUrl
  npm run dev --workspace @sigear/policy-service
}
