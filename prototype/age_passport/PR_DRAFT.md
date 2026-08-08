# PR Draft — prototype/age_passport: Age Passport prototype

Branch: feature/age-passport-prototype

Summary
- This PR adds a working prototype for the SiGear Age Passport system under `prototype/age_passport/`.

What changed
- New Starlette ASGI services: `minting_service`, `control_service`, `integration_service`, `audit_service`.
- Crypto utilities using PyNaCl Ed25519 for signing and verification.
- File-backed storage and simple CLI (`portable_cli.py`) to mint, store (encrypted), and present Age Passports.
- Canonical JSON signing/verification to ensure deterministic signatures across services.
- Runtime data folder: `prototype/age_passport/data/` (keys and JSON stores generated at runtime).
- Documentation: `SMOKE_REPORT.md`, `HANDOVER.md`, `PR_DRAFT.md`, `CHANGELOG.md`.

Files of interest
- `prototype/age_passport/minting_service.py`
- `prototype/age_passport/integration_service.py`
- `prototype/age_passport/control_service.py`
- `prototype/age_passport/audit_service.py`
- `prototype/age_passport/age_passport/` (models, crypto, storage)
- `prototype/age_passport/portable_cli.py`

Testing performed
- Manual end-to-end smoke test: created venv, started four services, minted an encrypted avatar file (`avatar2.enc`) via CLI, presented passport to Integration API — returned `allowed: true`. Audit event appended to `data/audit.json`.
- Fixed canonicalization and datetime serialization issues to ensure signature verification succeeds.

Known limitations (prototype)
- No authentication on control/audit endpoints.
- CLI uses simple symmetric key derivation (improve with scrypt/argon2 and per-file salt).
- No unit tests or CI in this PR — recommended as follow-up tasks.

Suggested reviewers
- @sigear-core or engineers familiar with `prototype/*` folder

Suggested commit message
- feat(prototype/age_passport): add age-passport prototype services, CLI, and docs

Merge notes
- This prototype adds new files only under `prototype/age_passport/`. It is safe to merge to a feature branch for further iteration.
