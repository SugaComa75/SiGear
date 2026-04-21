CREATE TABLE IF NOT EXISTS policy_rules (
  id UUID PRIMARY KEY,
  version INTEGER NOT NULL DEFAULT 1,
  allowed_purposes TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  retention JSONB,
  derivative_policy TEXT,
  capability_axes JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS policy_consents (
  id UUID PRIMARY KEY,
  identity_id VARCHAR(255) NOT NULL,
  rule_id UUID NOT NULL REFERENCES policy_rules(id) ON DELETE CASCADE,
  state VARCHAR(32) NOT NULL CHECK (state IN ('active', 'reminder', 'dormant', 'recovery', 'archive', 'deleted')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS policy_audit_events (
  id UUID PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  identity_id VARCHAR(255) NOT NULL,
  action VARCHAR(128) NOT NULL,
  purpose VARCHAR(128),
  rule_id UUID,
  rule_version INTEGER,
  consent_id UUID,
  consent_state VARCHAR(32),
  allowed BOOLEAN NOT NULL,
  reasons TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  payload JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_policy_consents_identity_id_created_at
  ON policy_consents(identity_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_policy_audit_events_identity_id_created_at
  ON policy_audit_events(identity_id, created_at DESC);
