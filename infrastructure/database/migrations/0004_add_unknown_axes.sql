-- Adds missing audit columns for unknown/unapproved requested axes
-- and creates GIN indexes for efficient searching.
BEGIN;

ALTER TABLE IF EXISTS policy_audit_events
  ADD COLUMN IF NOT EXISTS unknown_requested_axes TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS unapproved_requested_axes TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

CREATE INDEX IF NOT EXISTS idx_policy_audit_unknown_axes_gin
  ON policy_audit_events USING GIN (unknown_requested_axes);

CREATE INDEX IF NOT EXISTS idx_policy_audit_unapproved_axes_gin
  ON policy_audit_events USING GIN (unapproved_requested_axes);

COMMIT;
