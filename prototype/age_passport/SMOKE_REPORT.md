# Smoke Test Report — SiGear Age Passport Prototype

Date: 2026-07-07

Summary:
- Environment: Windows, Python 3.14 used (system). Virtualenv created at `prototype/age_passport/.venv`.
- Services started: Minting Service (port 8000), Control Service (8001), Integration Service (8002), Audit Service (8003).
- Result: End-to-end smoke test passed after fixes. `present` returned `allowed: true` and an audit event was recorded.

Key actions performed:
- Created venv and installed dependencies: `pip install -r prototype/age_passport/requirements.txt`.
- Started services (one terminal each):
  - `uvicorn prototype.age_passport.minting_service:app --port 8000`
  - `uvicorn prototype.age_passport.control_service:app --port 8001`
  - `uvicorn prototype.age_passport.integration_service:app --port 8002`
  - `uvicorn prototype.age_passport.audit_service:app --port 8003`
- Minted a passport via CLI and stored encrypted file `avatar2.enc`:
  - `python prototype/age_passport/portable_cli.py mint --dob 2000-01-01 --out avatar2.enc --passphrase testpass`
- Presented the passport to Integration API (enforce) and received allow:
  - `python prototype/age_passport/portable_cli.py present --file avatar2.enc --passphrase testpass --required_age_band 18+ --site example.com --resource /video/adult-content --action view`

Artifacts created at runtime:
- `prototype/age_passport/data/` contains generated keys and JSON stores: `policies.json`, `audit.json`, `signing_key.hex`, `verify_key.hex`.
- Encrypted portable wallet: `avatar2.enc` (in repo root during test run).

Notes on fixes applied:
- Replaced Pydantic models with `dataclasses` to avoid native `pydantic-core` builds on this environment.
- Switched services from FastAPI to Starlette to maintain lightweight ASGI apps.
- Ensured canonical JSON signing: ISO timestamps and deterministic `json.dumps(..., sort_keys=True, separators=(",", ":"))` for both signing and verification.
- Replaced `httpx` with `requests` + `run_in_threadpool` for sync calls compatible with Python 3.14.

Known limitations / next risks:
- Current CLI encryption uses a simple symmetric derivation (prototype-only). Replace with secure key management.
- Age verification logic is stubbed; raw identity deletion is implemented by never writing inputs, but real verification will need secure handling.
- No authentication on control/audit endpoints (prototype).
