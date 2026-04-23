# SiGear Prototype Minting Demo (Sandbox)

Purpose: a minimal end-to-end demo that shows NTI minting in a sandbox using the local mock server and test CLI.

Goal
- Demonstrate creation of a test NTI, show returned ID and policy seed hash, and verify audit event id is produced.

One Command (Windows PowerShell)

From repository root:

```powershell
.\scripts\demo\run-mint-demo.ps1
```

What it runs
- Starts the local mock mint server (`scripts/mint-mock-server`) on port 4000
- Runs the `mint-test-nti` CLI to create a sandbox NTI pointing at the local mock
- Prints the CLI output (response + generated keypair) and stops the mock server

A cceptance criteria
- The CLI prints HTTP 201 and a JSON payload containing `nti_id`, `policy_seed_hash`, `audit_event_id`, `non_transferable`, and `avatar_claim` with `avatar_id`.
- The mock server returns predictable, non-empty values for those fields.
- The runner cleans up (stops the mock server) after the demo finishes.

Notes
- This demo is intentionally sandbox-only and stores nothing persistently.
- Use this flow for stakeholder demos where you want to show minting without external dependencies.

See also: [Concept/NTI_Minting_API_Spec.md](Concept/NTI_Minting_API_Spec.md), [Concept/NTI_Minting_OpenAPI.yaml](Concept/NTI_Minting_OpenAPI.yaml)
