# Mint Mock Server (sandbox)

Lightweight Express mock server to simulate NTI minting for local testing.

Requirements
- Node.js >= 18

Install & run

```bash
cd scripts/mint-mock-server
npm install
npm start
```

By default the server listens on port 4000. Example requests:

Create (mint) a test NTI:

```bash
curl -X POST http://localhost:4000/v1/mint \
  -H "Content-Type: application/json" \
  -d '{"proofing_tier":"low","public_key_jwk":{"kty":"EC","crv":"P-256","x":"..","y":".."}}'
```

Retrieve NTI metadata:

```bash
curl http://localhost:4000/v1/mint/<nti_id>
```

Trigger reproof:

```bash
curl -X POST http://localhost:4000/v1/mint/<nti_id>/reproof \
  -H "Content-Type: application/json" \
  -d '{"requested_tier":"medium"}'
```

Notes
- This server is for sandbox/testing only. It stores NTIs in-memory and is not persistent.
- Do not use this mock for production or with real PII/private keys.
