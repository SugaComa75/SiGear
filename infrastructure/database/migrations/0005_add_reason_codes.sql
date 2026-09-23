-- Add reason_codes column to policy_audit_events
ALTER TABLE policy_audit_events
  ADD COLUMN IF NOT EXISTS reason_codes TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

-- Optional: index for quick checks
CREATE INDEX IF NOT EXISTS idx_policy_audit_events_reason_codes_len ON policy_audit_events USING gin (reason_codes);
