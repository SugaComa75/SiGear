Prototype: command-line proof-of-enforcement

Purpose: Minimal CLI proof that an NTI + policy can be loaded, evaluated, and produce an audit record.

Structure:
- `cli/` : CLI demos and mock servers
- `data/`: sample policy/NTI/test data
- `audits/`: produced audit records

Run locally (node required):

  node prototype/cli/mint-test-nti/cli.js --tier low
