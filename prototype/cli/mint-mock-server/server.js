// copied mock server for NTI minting demo
const express = require('express');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');
const path = require('path');

const app = express();
app.use(express.json());

const fs = require('fs');
const policies = (() => {
  try {
    const p = require(path.join(__dirname, '..', '..', 'data', 'policy-examples', 'example-rule.json'));
    return [p];
  } catch (e) {
    return [];
  }
})();

const store = new Map();

function makePolicySeedHash() {
  return crypto.createHash('sha256').update(crypto.randomBytes(32)).digest('hex');
}

function makeAuditId() {
  return uuidv4();
}

app.post('/v1/mint', (req, res) => {
  const body = req.body || {};
  const auth = req.header('authorization') || '';
  if (!body.proofing_tier || !body.public_key_jwk) {
    return res.status(400).json({ error: 'proofing_tier and public_key_jwk are required' });
  }
  const nti_id = `nti_${uuidv4()}`;
  const policy_seed_hash = makePolicySeedHash();
  const audit_event_id = makeAuditId();
  const avatar_claim = { avatar_id: `avatar_${uuidv4()}`, display_name: 'Test Avatar' };

  const record = {
    nti_id,
    public_key_jwk: body.public_key_jwk,
    proofing_tier: body.proofing_tier,
    recovery_options: body.recovery_options || {},
    environment: body.environment || 'sandbox',
    policy_seed_hash,
    audit_event_id,
    non_transferable: true,
    avatar_claim,
    created_at: new Date().toISOString()
  };

  store.set(nti_id, record);

  return res.status(201).json({
    nti_id,
    public_key_jwk: record.public_key_jwk,
    proofing_tier: record.proofing_tier,
    policy_seed_hash,
    non_transferable: record.non_transferable,
    avatar_claim: record.avatar_claim,
    capabilities: {
      identity_linkage: 'pseudonymous',
      storage_duration: 'time-limited'
    },
    audit_event_id
  });
});

// Simple policy enforcement endpoint for prototype demos
app.post('/v1/enforce', (req, res) => {
  const body = req.body || {};
  const audit_event_id = uuidv4();
  const now = new Date().toISOString();

  try {
    // Basic request fields
    const identity = body.identityId || 'unknown';
    const action = (body.action || '').toString();
    const purpose = (body.purpose || '').toString();

    // Find matching policy — naive match by scopeRef includes identity
    let policy = null;
    for (const p of policies) {
      if (!p) continue;
      if ((p.scopeRef && p.scopeRef.includes(identity)) || p.scope === 'identity') {
        policy = p;
        break;
      }
    }

    // If no policy found, fail-closed
    if (!policy) {
      return res.status(200).json({
        allowed: false,
        reasons: ['no_applicable_policy — fail-closed'],
        audit: { id: audit_event_id, timestamp: now }
      });
    }

    // Check purpose
    if (policy.allowedPurposes && !policy.allowedPurposes.includes(purpose)) {
      return res.status(200).json({
        allowed: false,
        reasons: ['purpose_not_allowed'],
        audit: { id: audit_event_id, timestamp: now }
      });
    }

    // Simple action block: block actions containing 'delete' as example
    if (action.includes('delete') || action.includes('remove')) {
      return res.status(200).json({
        allowed: false,
        reasons: ['action_disallowed_by_policy'],
        audit: { id: audit_event_id, timestamp: now }
      });
    }

    // Otherwise allow
    return res.status(200).json({
      allowed: true,
      reasons: [],
      obligations: { retentionDays: policy.retention && policy.retention.maxDays },
      audit: { id: audit_event_id, timestamp: now }
    });
  } catch (err) {
    // On error, fail-closed
    return res.status(500).json({
      allowed: false,
      reasons: ['internal_error_fail_closed'],
      audit: { id: audit_event_id, timestamp: now }
    });
  }
});

app.get('/v1/mint/:nti_id', (req, res) => {
  const id = req.params.nti_id;
  const rec = store.get(id);
  if (!rec) return res.status(404).json({ error: 'not_found' });
  return res.json({
    nti_id: rec.nti_id,
    public_key_jwk: rec.public_key_jwk,
    proofing_tier: rec.proofing_tier,
    policy_seed_hash: rec.policy_seed_hash,
    capabilities: {
      identity_linkage: 'pseudonymous',
      storage_duration: 'time-limited'
    },
    created_at: rec.created_at
  });
});

app.post('/v1/mint/:nti_id/reproof', (req, res) => {
  const id = req.params.nti_id;
  const rec = store.get(id);
  if (!rec) return res.status(404).json({ error: 'not_found' });
  const requested_tier = (req.body && req.body.requested_tier) || rec.proofing_tier;
  rec.proofing_tier = requested_tier;
  rec.last_reproof = new Date().toISOString();
  const audit_event = makeAuditId();
  rec.last_reproof_event = audit_event;
  store.set(id, rec);
  return res.status(202).json({ nti_id: id, requested_tier, audit_event });
});

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Mint mock server running on http://localhost:${port}`);
  console.log('Endpoints: POST /v1/mint, GET /v1/mint/:nti_id, POST /v1/mint/:nti_id/reproof, POST /v1/enforce');
});
