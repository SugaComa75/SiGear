CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  role VARCHAR(32) NOT NULL CHECK (role IN ('parent', 'child', 'admin', 'moderator')),
  password_hash VARCHAR(255),
  status VARCHAR(32) NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE identities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_user_id UUID NOT NULL REFERENCES users(id),
  parent_user_id UUID NOT NULL REFERENCES users(id),
  nti_token_hash VARCHAR(255) NOT NULL UNIQUE,
  device_fingerprint VARCHAR(255),
  verification_status VARCHAR(32) NOT NULL DEFAULT 'pending',
  verified_at TIMESTAMPTZ,
  verification_source VARCHAR(128),
  backup_reference VARCHAR(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

CREATE TABLE avatars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identity_id UUID NOT NULL REFERENCES identities(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  appearance_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  behavior_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  status VARCHAR(32) NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identity_id UUID NOT NULL REFERENCES identities(id) ON DELETE CASCADE,
  policy_type VARCHAR(64) NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  status VARCHAR(32) NOT NULL DEFAULT 'draft',
  rules JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deployed_at TIMESTAMPTZ
);

CREATE TABLE devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identity_id UUID REFERENCES identities(id) ON DELETE SET NULL,
  device_type VARCHAR(32) NOT NULL CHECK (device_type IN ('hub', 'ios', 'android', 'macos', 'school-hub')),
  device_name VARCHAR(255) NOT NULL,
  device_key_hash VARCHAR(255),
  bootstrap_id VARCHAR(255) UNIQUE,
  bootstrap_status VARCHAR(32) NOT NULL DEFAULT 'pending',
  last_sync_at TIMESTAMPTZ,
  last_seen_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) NOT NULL UNIQUE,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  created_by_ip VARCHAR(64),
  user_agent VARCHAR(512)
);

CREATE TABLE policy_rules (
  id UUID PRIMARY KEY,
  version INTEGER NOT NULL DEFAULT 1,
  allowed_purposes TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  retention JSONB,
  derivative_policy TEXT,
  capability_axes JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE policy_consents (
  id UUID PRIMARY KEY,
  identity_id VARCHAR(255) NOT NULL,
  rule_id UUID NOT NULL REFERENCES policy_rules(id) ON DELETE CASCADE,
  state VARCHAR(32) NOT NULL CHECK (state IN ('active', 'reminder', 'dormant', 'recovery', 'archive', 'deleted')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

CREATE TABLE policy_audit_events (
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
  reason_codes TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  unknown_requested_axes TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  unapproved_requested_axes TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  payload JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action VARCHAR(255) NOT NULL,
  actor_user_id UUID REFERENCES users(id),
  identity_id UUID REFERENCES identities(id),
  resource_type VARCHAR(64) NOT NULL,
  resource_id UUID,
  request_id VARCHAR(128),
  changes JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_identities_child_user_id ON identities(child_user_id);
CREATE INDEX idx_policies_identity_id ON policies(identity_id);
CREATE INDEX idx_devices_identity_id ON devices(identity_id);
CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_policy_consents_identity_id_created_at ON policy_consents(identity_id, created_at DESC);
CREATE INDEX idx_policy_audit_events_identity_id_created_at ON policy_audit_events(identity_id, created_at DESC);
CREATE INDEX idx_audit_logs_actor_user_id_created_at ON audit_logs(actor_user_id, created_at DESC);