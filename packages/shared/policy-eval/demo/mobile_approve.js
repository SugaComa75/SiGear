#!/usr/bin/env node
// Simple simulator for the SiGear Mobile App approval flow.
// Usage: node mobile_approve.js <input-avatar.json> <output-avatar.json>

import fs from 'node:fs/promises';

const argv = process.argv.slice(2);
if (argv.length < 2) {
  console.error('Usage: node mobile_approve.js <input-avatar.json> <output-avatar.json>');
  process.exit(2);
}

const [inputPath, outputPath, maybeSignKey] = argv;

const canonicalize = (obj) => {
  const sortKeys = (value) => {
    if (Array.isArray(value)) return value.map(sortKeys);
    if (value && typeof value === 'object') {
      const out = {};
      Object.keys(value).sort().forEach(k => {
        if (k === 'signature' || k === 'publicKey') return; // exclude signature/publicKey
        out[k] = sortKeys(value[k]);
      });
      return out;
    }
    return value;
  };
  return JSON.stringify(sortKeys(obj));
};

const run = async () => {
  const raw = await fs.readFile(inputPath, 'utf8');
  const avatar = JSON.parse(raw);

  // Simulate UI where parent approves A/B/C for the existing rule
  const rule = avatar.rules && avatar.rules[0];
  if (!rule) {
    throw new Error('No rule found in avatar');
  }

  rule.version = (rule.version || 1) + 1;
  rule.metadata = rule.metadata || {};
  // record explicit approvals
  rule.metadata.approvedFeatures = Array.from(new Set([...(rule.metadata.approvedFeatures || []), 'A', 'B', 'C']));

  if (maybeSignKey) {
    // sign the canonicalized avatar using provided PEM private key
    const privatePem = await fs.readFile(maybeSignKey, 'utf8');
    const sign = (await import('node:crypto')).createSign('RSA-SHA256');
    const canon = canonicalize(avatar);
    sign.update(canon);
    sign.end();
    const signature = sign.sign(privatePem, 'base64');

    // include public key material so the website can verify (demo only)
    // derive public key from private key using openssl would be ideal; for simplicity expect user to provide a public key next to private key
    let publicKeyPem = null;
    try {
      const pubPath = maybeSignKey.replace(/\.pem$/, '.pub.pem');
      publicKeyPem = await fs.readFile(pubPath, 'utf8');
    } catch {
      // no public key file — embed nothing
    }

    avatar.signature = signature;
    if (publicKeyPem) avatar.publicKey = publicKeyPem;
    avatar.signedAt = new Date().toISOString();
  }

  await fs.writeFile(outputPath, JSON.stringify(avatar, null, 2), 'utf8');
  console.log(`Wrote approved avatar to ${outputPath}`);
  if (maybeSignKey) console.log('Avatar signed (signature and optional publicKey included).');
};

run().catch(err => { console.error(err); process.exit(1); });
