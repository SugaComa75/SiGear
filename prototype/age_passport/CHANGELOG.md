# Changelog — prototype/age_passport

## Unreleased (2026-07-07)

- Added age passport prototype services (minting, control, integration, audit).
- Added `portable_cli.py` for minting, storing (encrypted) and presenting passports.
- Implemented Ed25519 signing/verification and canonical JSON serialization.
- Added runtime data store under `prototype/age_passport/data/`.
- Added `SMOKE_REPORT.md` and `HANDOVER.md` documenting smoke test and next steps.

### Notes
- Prototype: not production-ready. Priorities for next release: unit tests, authentication for control/audit endpoints, secure CLI key derivation, Docker Compose, CI.
