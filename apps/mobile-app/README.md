# Mobile app

The mobile app is the user-held authenticator and activity viewer.

## Owns

- device enrolment and secure authentication;
- biometric/PIN-backed approval prompts;
- readable site request, allow, deny, and attempted-violation logs;
- urgent alerts, revocation, and lost-device recovery;
- offline-safe behaviour and later reconciliation.

## Current implementation

- `ios-app/` reserves the native iOS client boundary.
- The current interactive mock is isolated in `../../proof-of-concept/mobile-ui/`.
- Approval/evaluator demo code is in `../../shared/policy-eval/demo/`.

The client must distinguish a blocked request from a site attempting to bypass a decision, and show the site, action, time, decision, and reason in plain language.
