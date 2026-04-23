import assert from 'assert';
import { generateKeyPairSync, createSign } from 'crypto';
import { fileURLToPath } from 'url';
import path from 'path';
import { verifySignedAvatar } from '../index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function canonicalize(obj) {
  const sortKeys = (value) => {
    if (Array.isArray(value)) return value.map(sortKeys);
    if (value && typeof value === 'object') {
      const out = {};
      Object.keys(value).sort().forEach(k => {
        if (k === 'signature' || k === 'publicKey' || k === 'signedAt') return;
        out[k] = sortKeys(value[k]);
      });
      return out;
    }
    return value;
  };
  return JSON.stringify(sortKeys(obj));
}

const run = async () => {
  // generate keypair
  const { publicKey, privateKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
  const pubPem = publicKey.export({ type: 'spki', format: 'pem' });
  const privPem = privateKey.export({ type: 'pkcs1', format: 'pem' });

  const avatar = {
    rules: [
      {
        id: '33333333-3333-4333-8333-333333333333',
        version: 1,
        capabilityAxes: {},
        allowedPurposes: ['X','Z']
      }
    ],
    consents: [
      {
        id: '44444444-4444-4444-8444-444444444444',
        identityId: 'user:children:alpha',
        ruleId: '33333333-3333-4333-8333-333333333333',
        state: 'active'
      }
    ]
  };

  const canon = canonicalize(avatar);
  const sign = createSign('RSA-SHA256');
  sign.update(canon);
  sign.end();
  const signature = sign.sign(privPem, 'base64');

  avatar.signature = signature;
  avatar.publicKey = pubPem;
  avatar.signedAt = new Date().toISOString();

  const res = await verifySignedAvatar(avatar);
  console.log('verifySignedAvatar ->', res);
  assert.strictEqual(res.valid, true, `expected signature to verify; got ${res.reason}`);

  console.log('Signature verification unit test passed');
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
