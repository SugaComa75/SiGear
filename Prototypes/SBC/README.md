SiGear SBC Prototype (Flask)

This prototype simulates SBC behaviour: a policy-backed DNS check endpoint, local logs, SOS event, and a minimal UI.

Quick start
1. Create a venv and install:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

2. Run the app:

```powershell
python app.py
```

3. Open http://localhost:5000 to view the SBC UI.

Notes
- This is a mock for development and demo only — not for production use.
- Policy is loaded from `policy.json`. Update it to change allow/block rules.
API key usage
- The prototype supports simple API-key auth for push/sync endpoints.
- Default test key is in `keys.json`. Replace it for any real testing.

Example push with `curl`:

```powershell
curl -X POST http://localhost:5000/api/policy/push -H "Content-Type: application/json" -H "X-API-Key: test-api-key-CHANGE-THIS-abc123" -d @payload.json
```

Example device POST:

```powershell
curl -X POST http://localhost:5000/api/devices -H "Content-Type: application/json" -H "X-API-Key: test-api-key-CHANGE-THIS-abc123" -d '{"id":"dev-100","name":"Demo","blocked_domains":["x.example"]}'
```

Device registration (HMAC bootstrap)

For mass provisioning devices we support a bootstrap registration flow:

- Each device is preloaded with a bootstrap secret (example stored in `bootstrap_keys.json` for the prototype).
- Device computes signature: `sig = HMAC-SHA256(bootstrap_secret, "{id}|{ts}")`, where `ts` is current unix timestamp.
- POST `{id, ts, sig}` to `/api/register` to receive a device-scoped API key.

Example (PowerShell):

```powershell
$id = 'device-1'
$ts = [int][double]::Parse((Get-Date -UFormat %s))
$secret = 'bootstrap-secret-abc123'
$msg = "$id|$ts"
$sig = (New-Object System.Security.Cryptography.HMACSHA256 ([Text.Encoding]::UTF8.GetBytes($secret))).ComputeHash([Text.Encoding]::UTF8.GetBytes($msg)) -join ''
# Hex output may need formatting — use your environment's HMAC helper to produce hex
curl -X POST http://localhost:5000/api/register -H "Content-Type: application/json" -d "{\"id\":\"$id\",\"ts\":$ts,\"sig\":\"<hex-sig>\"}"
```

The response will contain `api_key` which the device should store and use in `X-API-Key` for future sync and DNS requests.

Note: This is a prototype flow. For production use you should use stronger provisioning (signed device certificates or secure hardware-backed keys) and avoid storing plaintext API keys.

Note on VPN provisioning
- The VPN provisioning endpoint in this prototype returns mock, synthetic WireGuard-like values (keys, preshared keys, public/private values) purely for demonstration. They are not valid WireGuard keys and should never be used in production environments.

For a production implementation generate proper WireGuard keypairs, protect private keys with secure hardware, and use authenticated, encrypted channels for provisioning.

Download source and license
- Admins can download a zip of core project folders from the running SBC at `/download/source` after logging in to the admin UI.
- The full AGPLv3 license is available at `/license` on the SBC when running.