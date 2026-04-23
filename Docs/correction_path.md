# Step-by-Step Instructions for GitHub Copilot in VS Code

1. **Canonicalize the Digital Safety Concept File**  
   - Move the file *Concept/Digital Safety Concept.md* to ensure it exists as the canonical name:  
     - (Already canonicalized to `Concept/Digital Safety Concept.md`)

2. **Archive Duplicate Concept Files**  
   - Identify any duplicates and create stub pointer headers. For each duplicate:  
     - Create a new file in `Concept/archive/` with a pointer to the canonical file:
      - `echo 'This file is archived and points to Concept/Digital Safety Concept.md' > Concept/archive/<duplicate_file_name>_archived.md`

3. **Update NTI-Clean-Model**  
   - Add sections for the following topics in *Concept/NTI-Clean-Model.md*:  
     - **NTI Minting Proofing Bootstrap**  
     - **Non-Transferable Operational Definition**  
     - **Avatar As Visual Identifier (Not Enforcement Authority)**  
     - **Life-Stage Evolution**  
     - **Post-MVP Platform Integration**  
   - Use the following commands to edit:  
     - `code Concept/NTI-Clean-Model.md`

4. **Update Index File**  
   - Ensure that *Concept/00_INDEX.md* points to the canonical file:  
    - `echo 'See Concept/Digital Safety Concept.md' >> Concept/00_INDEX.md`
   - Include placeholders for invariants/glossary:  
     - `echo '## Invariants

## Glossary' >> Concept/00_INDEX.md`

5. **Create Missing Files**  
   - Check and create **if missing**:  
     - `touch Concept/CHANGELOG.md`  
     - `touch Concept/archive/README.md`

6. **Explicit Acceptance Criteria**  
   - Update *Docs/deployment/prototype-demo.md* and *prototype-demo-2.md* to include explicit Acceptance Criteria sections:  
     - `echo '## Acceptance Criteria
   - Describe acceptance criteria here.' >> Docs/deployment/prototype-demo.md`
     - `echo '## Acceptance Criteria
   - Describe acceptance criteria here.' >> Docs/deployment/prototype-demo-2.md`

7. **Create Scenario Docs**  
  - Create *Docs/deployment/scenario-3.md*, *scenario-4.md*, *scenario-5.md*, and *scenario-6.md* containing the acceptance criteria:
     - `echo '## Acceptance Criteria
  - Describe acceptance criteria here.' > Docs/deployment/scenario-3.md`  
     - Repeat for scenarios 4 to 6.

---

### Suggested Commit Message:
"Updated concept files, archived duplicates, and added acceptance criteria in deployment docs."

## Completed (2026-04-23)

- Imported and merged changes from external pull copy into `main`.
- Added a local type shim `packages/backend/services/policy-service/src/jwks-rsa.d.ts` and removed the unavailable devDependency `@types/jwks-rsa` to fix install failures; updated `package-lock.json` and verified `npm ci` completes locally.
- Canonicalized the Digital Safety Concept file and archived duplicates under `Concept/archive/`.
- Inserted a canonical definition for Neutral Trusted Identity (NTI) and normalized usages across the repository to `Neutral Trusted Identity (NTI)`.
- Removed legacy synonym phrasing and added `Concept/TERMINOLOGY.md` with the canonical definition; linked it from `Concept/00_INDEX.md`.

If you want a one-line changelog entry for release notes, I can add it to `Concept/CHANGELOG.md`.