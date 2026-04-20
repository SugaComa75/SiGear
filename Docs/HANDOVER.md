
# SiGear Handover Notes

Current status (2026-04-20): this document captures what has been implemented, how to validate it locally, and the immediate next steps so engineers can continue work while preserving NTI design intent.

Completed artifacts (canonical)
- [packages/backend/services/policy-service/schemas/rule.schema.json](packages/backend/services/policy-service/schemas/rule.schema.json) — JSON Schema for NTI policy rules
- [packages/backend/services/policy-service/schemas/consent.schema.json](packages/backend/services/policy-service/schemas/consent.schema.json) — JSON Schema for consent records
- [packages/backend/services/policy-service/examples/example-rule.json](packages/backend/services/policy-service/examples/example-rule.json) — Example rule
- [packages/backend/services/policy-service/examples/example-consent.json](packages/backend/services/policy-service/examples/example-consent.json) — Example consent record
- [packages/backend/services/policy-service/src/evaluate.ts](packages/backend/services/policy-service/src/evaluate.ts) — Minimal deterministic evaluator and HTTP handler
- [packages/backend/services/policy-service/src/index.ts](packages/backend/services/policy-service/src/index.ts) — Health endpoint + `/v1/evaluate` wiring
- [packages/backend/services/policy-service/test/evaluate.test.ts](packages/backend/services/policy-service/test/evaluate.test.ts) — Small smoke tests (run locally)
- [packages/backend/services/policy-service/openapi.yaml](packages/backend/services/policy-service/openapi.yaml) — Policy service OpenAPI skeleton
- [packages/backend/services/auth-service/openapi.yaml](packages/backend/services/auth-service/openapi.yaml) — Auth service OpenAPI skeleton

Validation performed
- Ran the policy-service evaluator tests locally:
	- Command: `node --loader ts-node/esm ./test/evaluate.test.ts` (from the service directory)
	- Result: tests passed (basic allow/deny cases for model-training).

How to validate locally (quick)
1. Open a terminal and change to the policy-service folder:

```powershell
cd packages/backend/services/policy-service
```

2. Run the evaluator smoke tests:

```powershell
node --loader ts-node/esm ./test/evaluate.test.ts
```

3. Start the service and POST a request to evaluate (optional):

```powershell
node --loader ts-node/esm ./src/index.ts
curl -X POST http://localhost:3002/v1/evaluate -H "Content-Type: application/json" -d '{"identityId":"user:123","action":"derive","purpose":"model_training"}'
```

Immediate next steps (priority order)
1. Wire evaluator to load real rule and consent documents (DB or file store) and implement full axis evaluation logic. (blocks enforcement correctness.)
2. Add audit logging and obligations to evaluation responses (append-only audit events). (legal/compliance requirement.)
3. Integrate `auth-service` to propagate NTI identity claims and generate short-lived evaluation tokens for SiGear adapters.
4. Add CI job to run policy-service tests and fail the build on regressions.
5. Generate client SDKs from the OpenAPI specs and add lightweight enforcement middleware to key services.

Assigned owner suggestions
- Policy evaluation core: backend team (PolicyEngine / `policy-service`)
- Auth ↔ NTI mapping: `auth-service` maintainers
- Enforcement adapters + clients: web/mobile/hub teams

If you want, I can start with step 1 and wire the evaluator to load the example documents and apply the full axis checks. Otherwise I will wait for your go-ahead before making further changes.

