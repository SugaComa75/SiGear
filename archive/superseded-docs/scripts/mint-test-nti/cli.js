#!/usr/bin/env node
const { generateKeyPairSync } = require('crypto');
const https = require('https');
const http = require('http');
const { URL } = require('url');

function parseArgs() {
  const args = process.argv.slice(2);
  const out = {};
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--endpoint' || a === '-e') out.endpoint = args[++i];
    else if (a === '--apikey' || a === '-k') out.apikey = args[++i];
    else if (a === '--tier' || a === '-t') out.tier = args[++i];
    else if (a === '--help' || a === '-h') out.help = true;
  }
  return out;
}

function showHelp() {
  console.log(`Usage: mint-test-nti [--endpoint URL] [--apikey KEY] [--tier low|medium|high]

Environment variables:
  MINT_ENDPOINT   default: http://localhost:4000/v1/mint
  MINT_API_KEY    optional API key for sandbox

Example:
  # point at local mock server (default)
  node cli.js --tier low

  # or point to sandbox service
  MINT_ENDPOINT=https://mint.sandbox.nti.example/v1/mint MINT_API_KEY=test-abc123 node cli.js --tier low
`);
}

async function main() {
  const args = parseArgs();
  if (args.help) return showHelp();

  const endpoint = args.endpoint || process.env.MINT_ENDPOINT || 'http://localhost:4000/v1/mint';
  const apikey = args.apikey || process.env.MINT_API_KEY || null;
  const tier = args.tier || 'low';

  // generate EC P-256 keypair
  const { publicKey, privateKey } = generateKeyPairSync('ec', { namedCurve: 'P-256' });
  const public_jwk = publicKey.export({ format: 'jwk' });
  const private_jwk = privateKey.export({ format: 'jwk' });

  const payload = {
    proofing_tier: tier,
    public_key_jwk: public_jwk,
    recovery_options: { backup_encrypted: false },
    environment: 'sandbox'
  };

  const url = new URL(endpoint);

  const lib = url.protocol === 'https:' ? https : http;
  const port = url.port || (url.protocol === 'https:' ? 443 : 80);

  const req = lib.request(
    {
      hostname: url.hostname,
      path: url.pathname + (url.search || ''),
      port: port,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(JSON.stringify(payload))
      }
    },
    (res) => {
      let body = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        console.log('HTTP', res.statusCode);
        try {
          const json = JSON.parse(body || '{}');
          const out = { response: json, public_jwk: public_jwk, private_jwk: private_jwk };
          console.log(JSON.stringify(out, null, 2));

          // Validate required fields for expanded test coverage
          const resp = json || {};
          const missing = [];
          if (!resp.nti_id) missing.push('nti_id');
          if (!resp.policy_seed_hash) missing.push('policy_seed_hash');
          if (!resp.audit_event_id) missing.push('audit_event_id');
          if (resp.non_transferable !== true) missing.push('non_transferable');
          if (!resp.avatar_claim || !resp.avatar_claim.avatar_id) missing.push('avatar_claim.avatar_id');

          if (missing.length === 0 && res.statusCode === 201) {
            console.log('TEST: PASS — all expected fields present');
            process.exit(0);
          } else {
            console.error('TEST: FAIL — missing or invalid fields:', missing.join(', '));
            process.exit(2);
          }
        } catch (e) {
          console.log('Non-JSON response:', body);
          process.exit(3);
        }
      });
    }
  );

  if (apikey) req.setHeader('Authorization', `ApiKey ${apikey}`);

  req.on('error', (err) => {
    console.error('Request error', err.message);
    process.exit(4);
  });

  req.write(JSON.stringify(payload));
  req.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
