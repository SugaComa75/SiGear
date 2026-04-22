# Prototype Demo 2 — Talk Track (New Default-On Options)

Use this script while running `packages/backend/services/policy-service/test/prototype.scenario.2.ts` to explain the scenario to stakeholders.

1. Intro (15s)
   - "This short demo shows how SiGear's NTI prevents platforms from silently enabling new capabilities on a child's account while the parent is away."

2. Setup summary (20s)
   - "We have a parent who approved two purposes (X and Z) and actively denied or didn't approve Y. The child's consent is active for the existing rule."
   - Reference the rule JSON and consent fixture in the temporary file used by the demo.

3. The problem (20s)
   - "A service updated and introduced three new features A, B, and C, and turned them on by default. If you relied solely on platform defaults, this would silently expand the child's permissions."

4. The NTI response (30s)
   - "NTI treats unknown features as unapproved. The policy engine denies activation of A/B/C because they're not part of the existing consent map — least privilege by default."
   - Show the printed decision and reasons from the demo: `allowed: false` and reasons listing unknown/unapproved axes.

5. Audit and admin review (40s)
   - "Every evaluation attempt is recorded in an append-only audit. The audit now contains `unknownRequestedAxes`/`unapprovedRequestedAxes` fields for these events."
   - Show the admin view output (sample of pending events) printed by the script.
   - "Audits now include stable denial reason codes (field `reasonCodes`) so reviewers and dashboards can reliably filter and trend denials. Example codes: `UNKNOWN_CAPABILITY_AXIS`, `UNAPPROVED_CAPABILITY_AXIS`, `PURPOSE_NOT_ALLOWED`, `CONSENT_DORMANT_READ_ONLY`, `RECOVERY_REAUTH_REQUIRED`."
   - Optionally, start the service (`npm run dev`) and show the same events via the admin endpoint:

```bash
export POLICY_ADMIN_TOKEN="s3cret"
npm run dev
curl -H "Authorization: Bearer s3cret" http://localhost:3002/v1/admin/pending-unknown
```

6. The safe paths forward (30s)
   - "Operators or parents can review the reported unknown axes and either:
     - Explicitly approve them by updating the policy rule and consent; or
     - Keep them disabled or sandboxed until a formal review."

7. Key takeaway (10s)
   - "Consent must be explicit and bounded. NTI enforces that principle and prevents silent platform drift."

8. Q&A / Next steps
   - Offer to demonstrate approval flow: update rule, re-run the evaluation to show activation allowed, and demonstrate audit history showing the change.

