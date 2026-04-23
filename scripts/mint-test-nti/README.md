# mint-test-nti

Simple prototype CLI to create a sandbox NTI for testing.

Requirements
- Node.js >= 18 (uses KeyObject JWK export and built-in https).

Usage

Install locally (optional):

```bash
cd scripts/mint-test-nti
npm install
node cli.js --tier low
```

Or run with environment variables:

```bash
MINT_API_KEY=test-abc123 node cli.js --tier low
```

Options
- `--endpoint` or `-e`: full mint endpoint URL (default: `https://mint.sandbox.nti.example/v1/mint`)
- `--endpoint` or `-e`: full mint endpoint URL (default: `http://localhost:4000/v1/mint`)
- `--apikey` or `-k`: sandbox API key
- `--tier` or `-t`: proofing tier `low|medium|high` (default `low`)

Notes
- The CLI prints the server response and the generated public/private JWK pair. Keep private keys secure — this is intended only for sandbox use.
- Production minting should use stronger authentication (mTLS / OAuth) and never accept deterministic test seeds.
 - The CLI validates the server response for required demo fields (`nti_id`, `policy_seed_hash`, `audit_event_id`, `non_transferable`, `avatar_claim.avatar_id`) and exits with non-zero code if validation fails. This allows the demo runner to detect pass/fail.
