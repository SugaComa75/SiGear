# SiGear Architecture & Pre-Development Checklist

**Version**: 1.1  
**Date**: April 18, 2026  
**Purpose**: Foundation decisions and infrastructure before coding begins

---

## Phase 0 Alignment

This document is the implementation checklist for **Phase 0: Foundation Lock-In** in the roadmap.

The order matters:

1. Lock stack decisions
2. Create repo structure
3. Freeze schema v1
4. Draft OpenAPI contracts
5. Finalize auth model
6. Make local development reproducible

Application coding should begin only after those items are in place.

---

## 1. Technology Stack Decision ⚠️ **CRITICAL - Do First**

### Backend Services (AuthenticationService, PolicyEngine, etc.)
**Recommendation**: 
- **Runtime**: Node.js 18+ (TypeScript) OR Python 3.11+
- **Framework**: Express.js (Node) OR FastAPI (Python)
- **Database**: PostgreSQL 14+ (relational, strong GDPR support)
- **Cache**: Redis (for tokens, policy cache, rate limiting)
- **Message Queue**: RabbitMQ or Bull (for async notifications, sync jobs)

**Why this stack**:
- PostgreSQL: GDPR audit trail support, row-level security, excellent compliance tooling
- TypeScript: Type safety, catches bugs early (critical for security)
- Express/FastAPI: Lightweight, well-documented, good for microservices
- Redis: Essential for token validation performance (< 10ms auth checks)

**Decision Needed**: Node.js or Python? (I can code both, your preference?)

---

### Hub Device (HomeHubApp - SBC Firmware)
**Recommendation**:
- **Base OS**: Debian 12 (Bookworm) or Ubuntu 22.04 LTS (arm64)
- **DNS Service**: Unbound (lightweight, policy-driven)
- **VPN**: WireGuard (fast, modern, auditable)
- **Management Service**: Python FastAPI or Rust (lightweight)
- **Hardware**: Raspberry Pi 4B (2GB RAM minimum, 32GB SD card)

**Alternative Hardware**:
- Orange Pi 5 (faster CPU, better performance)
- x86 mini-PC (for testing/school deployments)

**Decision Needed**: Primary hardware platform (RPi4 recommended, cheaper and sufficient)?

---

### Mobile App (MobileApp - iOS first)
**Recommendation**:
- **iOS**: Swift + SwiftUI (native, 2024+ best practice)
- **VPN**: WireGuard SDK (open-source, auditable)
- **Local Storage**: Keychain (secure credential storage)
- **Networking**: URLSession + async/await
- **Minimum iOS**: 13.0 (covers 95%+ of App Store users)

**Decision Needed**: Confirmed iOS-first, defer Android?

---

### Desktop App (ControlApp - macOS first)
**Recommendation**:
- **macOS**: SwiftUI + AppKit (native)
- **Windows**: Electron (TypeScript/React) - defer to Phase 5
- **Local Storage**: Keychain (macOS), Credential Manager (Windows)
- **Code Signing**: macOS notarization, Windows code signing

**Decision Needed**: Confirmed macOS-first, defer Windows?

---

### Web Dashboards (ParentDashboard, AdminPortal)
**Recommendation**:
- **Framework**: React 18+ (TypeScript) or Vue 3 (Vite)
- **Component Library**: MUI (Material-UI) or shadcn/ui
- **State Management**: TanStack Query (React Query) for server state
- **Styling**: Tailwind CSS
- **Build**: Vite (fast development, optimized builds)

**Decision Needed**: React or Vue preference?

---

## 2. Repository Structure ⚠️ **CRITICAL - Do Early**

### Recommended Monorepo Structure
```
SiGear/
├── packages/
│   ├── backend/
│   │   ├── services/
│   │   │   ├── auth-service/
│   │   │   ├── policy-service/
│   │   │   ├── sync-service/
│   │   │   └── ...
│   │   ├── shared/
│   │   │   ├── types/
│   │   │   ├── utils/
│   │   │   └── constants/
│   │   └── tests/
│   │
│   ├── hub/
│   │   ├── firmware/
│   │   │   ├── dns-service/
│   │   │   ├── vpn-service/
│   │   │   └── management-api/
│   │   └── build/
│   │
│   ├── mobile/
│   │   ├── ios-app/
│   │   └── android-app/ (Phase 5)
│   │
│   ├── desktop/
│   │   ├── control-app-macos/
│   │   └── control-app-windows/ (Phase 5)
│   │
│   ├── web/
│   │   ├── parent-dashboard/
│   │   ├── admin-portal/
│   │   └── shared-ui/
│   │
│   └── docs/
│       ├── api/
│       ├── architecture/
│       └── deployment/
│
├── infrastructure/
│   ├── docker/
│   ├── kubernetes/ (Phase 5)
│   └── terraform/ (Phase 5)
│
├── docker-compose.yml (local dev)
├── package.json (monorepo root)
└── README.md
```

**Why Monorepo**:
- Shared types between backend and clients
- Single CI/CD pipeline
- Easier refactoring across services
- Simpler dependency management

**Tool**: Nx or Turborepo (both excellent for monorepos)

---

## 3. API Architecture & Standards ⚠️ **CRITICAL - Define Now**

### API Design Principles
```
RESTful APIs with these standards:

Base URL: https://api.sigear.dev/v1

Authentication: 
  Authorization: Bearer {JWT_TOKEN}
  X-API-Key: {SERVICE_KEY} (for service-to-service)

Versioning: /v1/, /v2/ in URL path

Response Format (JSON):
{
  "success": true,
  "data": { ... },
  "error": null,
  "timestamp": "2026-04-18T10:30:00Z"
}

Error Format:
{
  "success": false,
  "data": null,
  "error": {
    "code": "AUTH_INVALID_TOKEN",
    "message": "Token expired or invalid",
    "details": { ... }
  },
  "timestamp": "2026-04-18T10:30:00Z"
}

Status Codes:
  200 OK - Success
  201 Created - Resource created
  400 Bad Request - Invalid input
  401 Unauthorized - Auth required
  403 Forbidden - Insufficient permissions
  404 Not Found - Resource not found
  429 Too Many Requests - Rate limited
  500 Internal Server Error
```

### Documentation: OpenAPI (Swagger)
- Every API endpoint documented in OpenAPI 3.0 spec
- Auto-generate client SDKs from spec
- Interactive API explorer (Swagger UI)

**File**: `packages/backend/openapi.yaml`

---

## 4. Data Models & Database Schema ⚠️ **CRITICAL - Design Early**

### Core Entities (PostgreSQL)

```sql
-- Users Table
CREATE TABLE users (
  id UUID PRIMARY KEY,
  nti_identity_id UUID NOT NULL UNIQUE,
  parent_email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  deleted_at TIMESTAMP (soft delete)
);

-- Identities Table (Non-Transferable Identities)
CREATE TABLE identities (
  id UUID PRIMARY KEY,
  child_name VARCHAR(255),
  nti_token_hash VARCHAR(255) NOT NULL UNIQUE,
  device_fingerprint VARCHAR(255) NOT NULL,
  verified_at TIMESTAMP,
  verified_by_user_id UUID,
  backup_key_encrypted BYTEA,
  created_at TIMESTAMP,
  expires_at TIMESTAMP
);

-- Avatars Table
CREATE TABLE avatars (
  id UUID PRIMARY KEY,
  identity_id UUID NOT NULL FOREIGN KEY,
  name VARCHAR(255),
  appearance_config JSONB,
  behavior_config JSONB,
  created_at TIMESTAMP,
  deleted_at TIMESTAMP
);

-- Policies Table
CREATE TABLE policies (
  id UUID PRIMARY KEY,
  identity_id UUID NOT NULL FOREIGN KEY,
  policy_type VARCHAR(50),
  rules JSONB,
  version INT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  deployed_at TIMESTAMP
);

-- Devices Table
CREATE TABLE devices (
  id UUID PRIMARY KEY,
  identity_id UUID NOT NULL FOREIGN KEY,
  device_type VARCHAR(50), -- 'hub', 'ios', 'android', 'macos'
  device_name VARCHAR(255),
  device_key_encrypted BYTEA,
  last_sync_at TIMESTAMP,
  last_seen_at TIMESTAMP,
  created_at TIMESTAMP
);

-- Audit Logs Table
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY,
  action VARCHAR(255),
  user_id UUID,
  identity_id UUID,
  resource_type VARCHAR(50),
  resource_id UUID,
  changes JSONB,
  created_at TIMESTAMP,
  INDEX audit_logs_user_id_created_at
);
```

**Decision Needed**: Confirm schema makes sense for your privacy model?

---

## 5. Authentication & Authorization Framework ⚠️ **CRITICAL**

### Token Strategy
```
Access Token (JWT):
  - Expiry: 15 minutes
  - Payload: user_id, identity_id, roles, permissions
  - Signing: RS256 (RSA public/private key)

Refresh Token:
  - Expiry: 7 days
  - Stored: Secure httpOnly cookie
  - Rotation: New refresh token on each use

MFA Tokens (optional):
  - TOTP codes
  - Yubikey OTP
  - Backup codes
```

### Authorization Model
```
Role-Based Access Control (RBAC):
  - parent: can manage own children, avatars, policies
  - child: limited access, can't modify identity or policies
  - admin: full system access
  - moderator: can review content and appeals

Policies:
  - parent can read own_child_data
  - moderator can read flagged_content
  - admin can manage users and policies
```

**Decision Needed**: JWT secret rotation strategy? (monthly, on compromise)?

---

## 6. Security Architecture ⚠️ **CRITICAL**

### MVP Security Guardrails

For MVP, avoid building a heavyweight security platform before the core product path works.

- Use `.env` files for local development
- Use simple, well-scoped JWT auth first
- Implement structured basic audit logs before advanced security analytics
- Defer Vault/KMS integration until core auth and identity flows are stable
- Keep production-grade secret management as a planned upgrade, not a week-1 blocker

### Encryption Standards
```
Data at Rest:
  - Database: Column-level encryption for PII (AES-256-GCM)
  - Identity backup: AES-256 encrypted files/QR codes
  - Keys stored: AWS KMS or HashiCorp Vault

Data in Transit:
  - All APIs: TLS 1.3 minimum
  - Mobile-to-Hub: WireGuard VPN
  - Mobile-to-Cloud: TLS 1.3

Key Management:
  - Master key: AWS KMS or Vault (never in code)
  - Database encryption key: Rotated quarterly
  - API signing keys: Rotated annually
  - Device keys: Unique per device, HMAC-SHA256
```

### Secrets Management
```
Never commit secrets to git:
  - Use .env files (git-ignored)
  - Use AWS Secrets Manager or HashiCorp Vault for production
  - Environment variables for local development

Secrets to manage:
  - Database connection string
  - JWT signing keys
  - API third-party keys (Firebase, etc.)
  - Encryption master key
```

**Decision Needed**: AWS KMS, HashiCorp Vault, or self-managed?

---

## 7. Development Environment Setup ⚠️ **CRITICAL**

### Docker Compose for Local Development
```yaml
# docker-compose.yml
version: '3.9'
services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_PASSWORD: dev_password
      POSTGRES_DB: sigear_dev
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  auth-service:
    build: ./packages/backend/services/auth-service
    environment:
      DATABASE_URL: postgresql://postgres:dev_password@postgres:5432/sigear_dev
      REDIS_URL: redis://redis:6379
      JWT_SECRET: dev_secret_key
    ports:
      - "3001:3000"
    depends_on:
      - postgres
      - redis

  policy-service:
    # Similar structure
```

**Setup Instruction File**: `DEVELOPMENT.md` (quick start for new developers)

---

## 8. CI/CD Pipeline ⚠️ **IMPORTANT**

### GitHub Actions Workflow
```yaml
name: Build & Test

on: [push, pull_request]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Lint code
        run: npm run lint
      
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: test_password
    steps:
      - uses: actions/checkout@v3
      - name: Run tests
        run: npm run test -- --coverage
      - name: Upload coverage
        uses: codecov/codecov-action@v3

  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build Docker images
        run: docker compose build
```

**Minimum Requirements**:
- ✅ Linting (ESLint/Pylint)
- ✅ Unit tests (Jest/Pytest)
- ✅ Test coverage reporting (>80%)
- ✅ Docker build validation
- ✅ Security scanning (Trivy, SonarQube)

---

## 9. Logging & Monitoring Strategy

### Structured Logging
```javascript
// Every log must include:
{
  timestamp: "2026-04-18T10:30:00Z",
  level: "info" | "warn" | "error",
  service: "auth-service",
  user_id: "uuid",
  identity_id: "uuid",
  request_id: "correlation-id",
  message: "User authenticated successfully",
  metadata: { ... }
}
```

### Centralized Logging
- **Local Dev**: Stdout (console logs)
- **Staging/Prod**: ELK Stack (Elasticsearch, Logstash, Kibana) or CloudWatch

### Metrics
- API latency (p50, p95, p99)
- Error rates by service
- Request volume
- Database query performance
- Cache hit rate

---

## 10. Git Workflow & Code Standards

### Branching Strategy (Git Flow)
```
main          - Production-ready code (tagged with versions)
├── develop   - Integration branch (what goes into main next)
│   └── feature/auth-service - Individual feature branches
│   └── feature/policy-engine
│   └── bugfix/token-expiry
└── hotfix    - Emergency production fixes
```

### Commit Standards
```
Format: [TYPE] Brief description (< 50 chars)

Types:
  feat:  New feature
  fix:   Bug fix
  refactor: Code refactoring
  test:  Adding/updating tests
  docs:  Documentation
  chore: Maintenance

Example:
  feat: add TOTP MFA support to AuthenticationService
  fix: correct token expiry calculation in JWT validation
```

### Code Review Requirements
- Minimum 1 approval before merge
- All CI checks passing
- >80% test coverage maintained
- Architecture decisions documented

---

## 11. Architectural Decision Records (ADRs)

Create a `docs/architecture/decisions/` folder documenting all major decisions:

```markdown
# ADR-001: Use PostgreSQL for Persistent Storage

## Context
Need GDPR-compliant relational database with row-level security.

## Decision
Use PostgreSQL 14+ with encrypted columns for PII.

## Consequences
+ Strong ACID guarantees
+ Excellent audit trail support
- Requires managed service (AWS RDS) for production
```

**Create these ADRs before coding**:
- ADR-001: Database choice
- ADR-002: Authentication model
- ADR-003: Backend framework
- ADR-004: API design
- ADR-005: Encryption strategy

---

## 12. Documentation Structure

```
docs/
├── architecture/
│   ├── overview.md
│   ├── system-design.md
│   ├── decisions/
│   │   ├── ADR-001-database.md
│   │   ├── ADR-002-auth.md
│   │   └── ...
│   └── diagrams/
│
├── api/
│   ├── openapi.yaml
│   ├── README.md
│   ├── auth-api.md
│   ├── policy-api.md
│   └── ...
│
├── deployment/
│   ├── docker-setup.md
│   ├── aws-setup.md
│   └── hub-firmware.md
│
└── contributing/
    └── DEVELOPMENT.md (quick start for devs)
```

---

## Pre-Coding Checklist

### Must Complete Before Week 1
- [ ] **Tech stack decided** (backend: Node or Python?)
- [ ] **Hardware locked in** (Raspberry Pi 4?)
- [ ] **Monorepo structure created** (folders set up in GitHub)
- [ ] **Database schema designed** (PostgreSQL script ready)
- [ ] **API spec started** (OpenAPI stubs for each service)
- [ ] **Auth model finalized** (JWT, MFA strategy clear)
- [ ] **Docker Compose working** (local dev environment)
- [ ] **GitHub Actions CI/CD configured** (lint, test, build)
- [ ] **Code style standards set** (ESLint/Pylint configs)

### Must Be True Before Coding AuthenticationService
- [ ] Phase 0 decisions are written down in repo docs
- [ ] Schema v1 is frozen enough to build against
- [ ] OpenAPI auth contract exists, even if incomplete
- [ ] Docker-based local development starts reliably
- [ ] Auth token payload and role model are agreed

### Good to Have Before Week 1
- [ ] ADRs drafted (ADR-001 through ADR-005)
- [ ] Git workflow documented
- [ ] DEVELOPMENT.md quick start guide
- [ ] Initial data schema in PostgreSQL
- [ ] Logging/monitoring strategy decided

### Can Do in Week 1 Parallel with Coding
- [ ] Full OpenAPI documentation
- [ ] Deployment infrastructure planning
- [ ] Security audit checklist
- [ ] Monitoring dashboards

---

## Next Steps (This Week)

1. **Make tech stack decisions** (Node vs Python? React vs Vue?)
2. **Set up monorepo structure** in GitHub
3. **Create docker-compose.yml** for local development
4. **Draft data schema** for PostgreSQL
5. **Create OpenAPI spec skeleton** for first services
6. **Set up GitHub Actions** for CI/CD

## Practical Sequencing Note

Once this document is complete enough for Phase 0, the correct implementation order is:

1. AuthenticationService
2. DigitalID
3. VerificationApp
4. PolicyEngine
5. HomeHubApp
6. SyncService
7. UI prototypes and core clients
8. Cloud support services

**I can help implement all of these.** Which would you like to tackle first?

---

## Questions for You

1. **Backend**: Prefer Node.js/TypeScript or Python/FastAPI?
2. **Frontend**: React or Vue for dashboards?
3. **Cloud**: AWS, Google Cloud, or self-hosted?
4. **Database**: PostgreSQL (recommended) or open to alternatives?
5. **Secrets**: AWS Secrets Manager, HashiCorp Vault, or .env files for now?
6. **Hardware**: Raspberry Pi 4 confirmed for Hub?

Once you answer these, I can set up the complete foundation architecture.
