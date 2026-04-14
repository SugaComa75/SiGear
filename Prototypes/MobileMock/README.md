SiGear Mobile Mock (Web)

This simple web mock simulates a device that:
- Registers with the SBC using the HMAC bootstrap flow
- Receives a device-scoped `api_key`
- Uses the `api_key` to perform device-sync operations (update device rules)
- Simulates a VPN connection by periodically sending DNS checks and keepalives

Quick start
1. From the workspace open the `MobileMock` folder and open `index.html` in a browser.
2. For registration, provide the device id and the bootstrap secret (for prototype only). The page will compute the HMAC and call `/api/register`.
3. After registration the returned `api_key` will be used for sync operations.

Notes
- This mock expects the SBC prototype to be running at `http://localhost:5000`.
- For production, the bootstrap secret should never be present on the client and secure provisioning (certs/HSM) should be used.
 
Note on VPN keys
- The VPN provisioning in this prototype returns synthetic, mock WireGuard-like tokens for demo purposes only. These are NOT real WireGuard keys and must not be used in production.

Use real key generation and secure provisioning for any production work.

Download source and license
- When the SBC prototype is running, the admin UI exposes `/license` and `/download/source` (admin only) endpoints. Use `/license` to view the AGPLv3 text and `/download/source` to get a zip of the demo code.
