# Home app

The home app is the user-controlled centre for personal and family settings.

## Owns

- personal privacy, consent, and notification preferences;
- child profiles and age-appropriate parental controls;
- guardian relationships, delegated carers, and approval rules;
- trusted devices, household membership, recovery, and synchronisation;
- a clear history of preference changes.

## Current implementation

- `web/parent-dashboard/` reserves the browser UI.
- `web/shared-ui/` reserves reusable home-app components.
- `desktop/` reserves packaged desktop clients.
- `sync-service/` is the TypeScript synchronisation service.
- The static public demonstration is `../../../Website-Files/sigear.sprint-family/public_html/SiGear-Personal/`.

Parental controls must remain explainable to both guardian and child, support more than one guardian where required, and never silently broaden permissions.
