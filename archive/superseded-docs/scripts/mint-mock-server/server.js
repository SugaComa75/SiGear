const express = require('express');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');

const app = express();
app.use(express.json());

// In-memory store for mock NTIs
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
  console.log('Endpoints: POST /v1/mint, GET /v1/mint/:nti_id, POST /v1/mint/:nti_id/reproof');
});
