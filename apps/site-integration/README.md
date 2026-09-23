# Site integration

This element is the installable SiGear integration for websites and online services, from community club hubs to large social platforms.

## Owns

- a future browser/server SDK for requesting a policy decision;
- adapters for site login, content access, messaging, uploads, purchases, and other protected actions;
- fail-closed enforcement and standard reason codes;
- site-side audit events without collecting unnecessary identity data.

## Current implementation

- `policy-service/` evaluates consent and capability rules.
- `admin-portal/` reserves the operator UI boundary.
- Shared browser/Node evaluation logic is in `../../shared/policy-eval/`.
- The canonical API is `../../contracts/policy-service-openapi.yaml`.
- The static public demonstration is `../../../Website-Files/sigear.sprint-family/public_html/SiGear-Social/`.

The next implementation should add a versioned site SDK inside this folder rather than embedding one-off logic in individual websites.
