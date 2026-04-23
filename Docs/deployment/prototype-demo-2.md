# SiGear Prototype Demo 2 — New Default-On Options (A/B/C)

This demo demonstrates NTI's resistance to silent platform drift: when a service introduces new capabilities and defaults them to "on" while a parent is offline, NTI treats those features as unknown and denies them until explicit review.

## Goal

- Show that NTI denies newly introduced default-on options (A,B,C) even when other purposes are approved.
- Show audit classification and admin review workflow for pending unknown/unapproved axes.

## One Command (service-local)

From repository root:

```powershell
cd packages/backend/services/policy-service
npm run prototype:demo2
```

## What It Runs

- `packages/backend/services/policy-service/test/prototype.scenario.2.ts`

This script uses file-backed policy documents to avoid DB setup.

## Scenario

1. Parent previously approved purposes `X` and `Z` (consent is `active`).
2. Parent denied `Y` (or did not approve it).
3. While the parent is offline, the app introduces three new options `A`, `B`, `C` and enables them by default.
4. The service attempts to `activate` these options for purpose `X`.

Expected NTI behavior:

- Treat A/B/C as unknown/unapproved (not part of existing consent/rule).
- Deny activation (least privilege) until explicit parent review.
- Record audit events with `unknownRequestedAxes`/`unapprovedRequestedAxes` populated.
- Make events discoverable via admin review endpoint `/v1/admin/pending-unknown`.

## Output

The script prints:

- Decision outcome and reasons
- Audit events count
- A sample of pending unknown/unapproved audit events (admin view)

## Avatar-based website demo

This demo also includes a browser-local enforcement path that runs entirely from an NTI avatar file embedded in a website. Steps:

1. Start with an avatar: `packages/shared/policy-eval/demo/avatars/initial_avatar.json` (parent has approved `X` and `Z`, `A/B/C` are not approved).
2. Open `packages/shared/policy-eval/demo/index.html` in a browser and upload `initial_avatar.json`.
3. Run the sample request that asks to activate `A/B/C`; the local evaluator will deny and show reasons.
4. Simulate parent approval with the mobile approval simulator:

```bash
node packages/shared/policy-eval/demo/mobile_approve.js packages/shared/policy-eval/demo/avatars/initial_avatar.json /tmp/approved_avatar.json
```

5. Upload `/tmp/approved_avatar.json` to the demo page and rerun the same request — the local evaluator will now allow activation because the avatar records explicit approvals in `rule.metadata.approvedFeatures`.

6. This demonstrates a website with no link back to SiGear (avatar file is the only source of truth) upholding the NTI rule set derived from the parental approval.

## Why This Helps

- Demonstrates that consent is explicit, bounded, and resistant to silent drift.
- Shows audit evidence parents/operators can use to review and approve or deny new capabilities.

***
For a guided talk script, see [prototype-demo-talk-track-2.md](prototype-demo-talk-track-2.md).

## Acceptance Criteria

- Describe acceptance criteria for this prototype demo here.
- NTI denies unknown default-on options and emits pending unknown audit events.
- Admin pending endpoint exposes discoverable events for review.
- Demo scripts run without DB and exit cleanly.

