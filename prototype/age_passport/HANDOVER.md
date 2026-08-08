# Handover — Next Steps for SiGear Age Passport Prototype

What I did:
- Scaffolding for Minting, Control, Integration, Audit services (Starlette ASGI apps).
- Simple portable CLI that mints, stores encrypted Avatar+Passport, and presents to Integration API.
- Implemented file-backed storage under `prototype/age_passport/data/` and Ed25519 signing with `PyNaCl`.
- Performed end-to-end smoke test: mint → present → audit logged.

Immediate next tasks (prioritized):
1. Add unit tests for:
   - `age_passport.crypto` sign/verify roundtrip
   - Integration `/enforce` decisions for allowed/denied scenarios
2. Add authentication for Control and Audit endpoints (simple API key for prototype).
3. Replace CLI symmetric derivation with proper KDF (scrypt/argon2) and per-file salt.
4. Add Docker Compose to run services together and an automated smoke test script.
5. Prepare PR with changelog and include `SMOKE_REPORT.md` and `HANDOVER.md`.

Where to find things:
- Code: `prototype/age_passport/` (services and CLI)
- Runtime data: `prototype/age_passport/data/` (policies.json, audit.json, signing_key.hex, verify_key.hex)
- Reports: `prototype/age_passport/SMOKE_REPORT.md`
- Handover notes: `prototype/age_passport/HANDOVER.md`

How to reproduce quickly:
1. Create venv and install deps:
```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r prototype/age_passport/requirements.txt
```
2. Start services (four terminals):
```powershell
uvicorn prototype.age_passport.minting_service:app --port 8000
uvicorn prototype.age_passport.control_service:app --port 8001
uvicorn prototype.age_passport.integration_service:app --port 8002
uvicorn prototype.age_passport.audit_service:app --port 8003
```
3. Mint and present:
```powershell
python prototype/age_passport/portable_cli.py mint --dob 2000-01-01 --out avatar.enc --passphrase <pass>
python prototype/age_passport/portable_cli.py present --file avatar.enc --passphrase <pass> --required_age_band 18+
```

Questions / decisions for next session:
- Do we want a single process dev mode (all services in one process) or keep separate services?
- Which authentication method should prototype use (API key, JWT, mTLS)?
- Scope for adding basic unit tests and CI in this repo.
