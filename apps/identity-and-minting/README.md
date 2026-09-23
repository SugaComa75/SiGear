# Identity and minting

This element authorises an adult, guardian, or child enrolment and mints the SiGear ID/Avatar used by the rest of the system.

## Owns

- identity proofing and guardian authorisation;
- Avatar minting, signing, device binding, recovery, expiry, and revocation;
- the minimum claims required by relying sites, without exposing raw identity evidence;
- auditable mint and recovery events.

## Current implementation

- `service/` is the TypeScript authentication/token service.
- The canonical API definitions are `../../contracts/auth-service-openapi.yaml` and `../../contracts/NTI_Minting_OpenAPI.yaml`.
- The runnable minting and age-passport experiments are isolated in `../../proof-of-concept/cli/`.
- The static public demonstration is `../../../Website-Files/sigear.sprint-family/public_html/SiGear-Mint/`.

The proof-of-concept keys and proofing tiers are test material only and must not be reused in production.
