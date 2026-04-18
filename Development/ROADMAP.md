# SiGear Development Roadmap

**Version**: 2.0  
**Last Updated**: April 18, 2026  
**Status**: Active Development  
**Planning Model**: 2-person core team, contributor-friendly

---

## Executive Summary

SiGear is an identity-led digital safety system for children built around NTI, adaptive avatars, policy enforcement, and a home hub.

The roadmap now starts with a short **Phase 0**. That phase exists to lock the foundation before code begins, so authentication, identity, policy, and client work do not drift into incompatible implementations.

**Planning assumptions**:
- Current team: you + AI assistant
- Base MVP timeline: 28-32 weeks
- Accelerated timeline with contributors: 18-22 weeks
- MVP discipline: iOS first, macOS first, hub first, automation later where sensible

**Real critical path**:
- AuthenticationService -> PolicyEngine -> HomeHubApp -> SyncService -> MobileApp

If that path slips, the MVP slips.

---

## Delivery Principles

- Foundation before features. Stack, schema, API contracts, auth model, and dev environment come first.
- Build the enforcement path before peripheral services.
- Prototype UI early enough to expose bad API design before it hardens.
- Prefer working, auditable MVP implementations over heavyweight platform engineering.
- Leave room to accelerate when contributors join, but do not depend on that to make progress.

---

## Phase 0: Foundation Lock-In (3-5 days)

This phase must be completed before application coding starts.

### Objectives

- Lock the core technology stack
- Create the monorepo structure
- Freeze database schema v1
- Draft the OpenAPI contract skeleton
- Finalize the auth model
- Make local development reproducible with one command

### Deliverables

- Tech stack decision recorded
- Repo structure created and committed
- Database schema v1 draft committed
- OpenAPI stub for core services committed
- Authentication model documented
- `docker-compose.yml` working for local development
- Base lint/test/build workflow defined

### Required Decisions

1. Backend: Node.js/TypeScript or Python/FastAPI
2. Dashboard frontend: React or Vue
3. Database: PostgreSQL
4. Hub hardware target: Raspberry Pi 4 or equivalent
5. Auth format: JWT claims, refresh flow, roles, expiry
6. Secrets approach for MVP: `.env` locally, managed secrets later

### Success Criteria

- A new development environment can be started with one documented setup flow
- API shapes exist before business logic starts
- Schema changes are intentional rather than reactive
- Authentication work can begin without redesigning the foundation

---

## Phase 1: Identity Foundation (Weeks 1-4)

With the foundation locked, build the identity path.

### 1. AuthenticationService (Weeks 1-2)

**Objectives**:
- NTI token generation and validation
- Session lifecycle and refresh flow
- Device bootstrap authentication
- Basic MFA support for parent/admin flows

**Deliverables**:
- Login endpoint
- Token verification endpoint
- Refresh endpoint
- Device registration/auth endpoint
- Basic audit logging
- Rate limiting for auth endpoints

**Dependencies**:
- Phase 0 complete

**MVP guardrails**:
- Use simple JWT + refresh model
- Keep logging structured but basic
- Do not overbuild KMS/Vault workflows in MVP week 1

### 2. DigitalID (Weeks 2-3)

**Objectives**:
- Identity creation and storage
- Identity binding rules
- Backup and recovery model
- Verification state tracking

**Deliverables**:
- Identity creation flow
- Encrypted storage for identity material
- Backup export/import support
- Identity metadata and lifecycle handling

**Dependencies**:
- AuthenticationService

### 3. VerificationApp (Weeks 3-4)

**Objectives**:
- Trusted-source verification flow
- Connect verification to identity issuance
- Record verification status and audit trail

**Deliverables**:
- Verification UI or workflow stub
- Verification processing logic
- Identity issuance after successful verification
- Audit records for verification events

**Dependencies**:
- DigitalID
- AuthenticationService

### Phase 1 Checkpoint

- Users can authenticate
- Devices can bootstrap with known rules
- Identities can be created, stored, and recovered
- Verification can issue trusted identity state

---

## Phase 2: Policy and Hub Infrastructure (Weeks 4-8)

This is where the system becomes real. Policy and hub are the backbone of enforcement.

### 1. PolicyEngine (Start end of Week 4, continue through Week 5)

Start this slightly earlier than originally planned.

**Why**:
- Hub depends on it
- Sync depends on it
- UI prototypes will expose whether the policy model is usable

**Objectives**:
- Define policy data model and templates
- Validate and version policies
- Evaluate actions against policies
- Record policy audit events

**Deliverables**:
- Policy CRUD endpoints
- Policy validation endpoint
- Policy evaluation endpoint
- Policy versioning rules
- First policy templates for identity, content, and time restrictions

**Dependencies**:
- AuthenticationService
- Phase 0 API/schema decisions

### 2. HomeHubApp (Weeks 5-8)

This is the longest and hardest part of the MVP.

**Objectives**:
- Evolve the current prototype into a real enforcement hub
- DNS policy enforcement
- VPN routing
- Local caching and fallback behavior
- Device registration and telemetry

**Deliverables**:
- Bootable hub image or reproducible hub runtime
- DNS filtering service
- VPN service integration
- Policy pull/apply flow
- Local logs and health reporting

**Dependencies**:
- PolicyEngine
- AuthenticationService

**MVP guardrails**:
- Working but ugly beats elegant but unfinished
- Prioritize reliable policy enforcement over a polished admin UI
- Avoid turning the hub into a full platform before enforcement works

### 3. SyncService (Weeks 6-8)

**Objectives**:
- Synchronize policies, avatar config, and identity state
- Support offline recovery and retries
- Track sync confirmation and conflicts

**Deliverables**:
- Policy sync endpoints
- Identity/avatar sync endpoints
- Sync confirmation flow
- Retry/rollback behavior for failed syncs

**Dependencies**:
- PolicyEngine
- HomeHubApp as first real client

### Phase 2 Checkpoint

- Policies can be created and evaluated
- Hub can enforce them locally
- Sync can distribute policy and identity changes to devices

---

## Phase 3: UI Prototypes and Core Clients (Weeks 6-12, overlapping)

UI work starts before the backend is fully complete. That is intentional.

### Why start UI early?

- UI prototypes reveal broken API assumptions quickly
- It prevents backend-only thinking from shaping unusable interfaces
- It allows contract adjustments before implementation hardens

### 1. UI Prototype Pass (Weeks 6-7)

**Objectives**:
- Sketch login, identity, policy, hub status, and mobile flows
- Validate API usefulness against real screens

**Deliverables**:
- ControlApp wireframes or simple prototypes
- MobileApp screen flow prototype
- API feedback list from UI integration

### 2. ControlApp (Weeks 7-10)

**Scope**:
- macOS first
- Parent login
- Identity setup
- Avatar creation basics
- Policy editing basics
- Device/sync visibility

**Dependencies**:
- AuthenticationService
- DigitalID
- PolicyEngine
- SyncService

### 3. MobileApp (Weeks 8-12)

**Scope**:
- iOS first
- NTI-based login
- Basic safe-view client shell
- VPN connection status
- SOS flow
- Policy feedback and avatar guidance placeholders

**Dependencies**:
- AuthenticationService
- PolicyEngine
- HomeHubApp
- SyncService

**MVP guardrails**:
- iOS only for MVP
- No advanced avatar AI yet
- No Android in initial critical path
- Keep UI intentionally small and testable

### Phase 3 Checkpoint

- Parent-facing setup flow exists
- Child-facing mobile flow exists
- UI has validated the backend contracts
- Enforcement path can be exercised end-to-end

---

## Phase 4: Cloud Services, Monitoring, and Testing (Weeks 12-16)

These services matter, but they are not the first build priority.

### 1. Content Moderation

**Objectives**:
- Accept flagged content and reports
- Support human review queue
- Track decisions and appeals

**MVP stance**:
- Manual queue is acceptable early
- Full automation can wait

### 2. Parent Dashboard

**Objectives**:
- Display activity, alerts, and device state
- Provide read-heavy visibility into the child environment

**MVP stance**:
- Read-only first is acceptable

### 3. Notifications

**Objectives**:
- Deliver priority alerts and user notifications

**MVP stance**:
- Use a simple provider-backed implementation first
- Do not build a full custom notification platform before core flows work

### 4. Integration Testing

**Objectives**:
- Validate end-to-end identity -> policy -> enforcement -> sync -> mobile flow
- Lock in regression coverage on critical services

### Phase 4 Checkpoint

- Operational support services exist for pilot use
- Testing covers the critical path
- MVP is coherent enough for controlled pilot preparation

---

## Timeline Summary

### Phase 0
- 3-5 days

### Phase 1
- Weeks 1-4
- AuthenticationService -> DigitalID -> VerificationApp

### Phase 2
- Weeks 4-8
- PolicyEngine starts earlier
- Hub becomes primary workload
- Sync follows hub and policy integration

### Phase 3
- Weeks 6-12, overlaps with Phase 2
- UI prototypes start before backend completion
- ControlApp and iOS MobileApp develop against real contracts

### Phase 4
- Weeks 12-16
- Moderation, dashboard, notifications, testing

---

## Critical Path

This is the build order that matters most:

1. AuthenticationService
2. PolicyEngine
3. HomeHubApp
4. SyncService
5. MobileApp

Everything else is important, but not as schedule-critical.

---

## Explicit MVP Scope Limits

To prevent self-inflicted delays:

- No Android in MVP critical path
- No full custom notification platform in MVP phase 1
- No overbuilt secrets platform before basic login exists
- No advanced avatar intelligence before core enforcement works
- No attempt to perfect the hub OS before basic enforcement is stable

---

## Contributor Acceleration Points

When contributors join, these are the best insertion points:

### Contributor 1: Mobile Developer
- Accelerates iOS polish and unlocks Android earlier

### Contributor 2: UI/Frontend
- Helps with ControlApp, dashboard, and admin flows

### Contributor 3: Infrastructure/DevOps
- Speeds local/staging environments, CI/CD, and deployment repeatability

### Good Open-Source Starter Areas
- Documentation polish
- UI wireframes and prototypes
- Test automation
- Verification flow integration stubs
- ControlApp non-sensitive interface work

---

## Immediate Next Steps

1. Complete Phase 0 and record the decisions
2. Freeze schema v1 and API contract stubs
3. Start AuthenticationService only after Phase 0 is done
4. Begin UI wireframes during Phase 2, not after it
5. Treat the hub as the primary engineering risk from the start

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Apr 18, 2026 | AI Assistant | Initial roadmap draft |
| 2.0 | Apr 18, 2026 | AI Assistant | Reordered around Phase 0, earlier PolicyEngine start, explicit critical path, earlier UI prototyping, tighter MVP scope |

---

## Executive Summary

SiGear is an identity-led digital safety system for children. This roadmap outlines the development plan for a 2-person core team (you + AI assistant), with the ability to accelerate as contributors join.

**Team Structure**: 
- **Founder/Lead**: You (architectural decisions, community, deployment)
- **AI Assistant**: Code generation, testing, documentation, architecture support
- **Contributors** (as they join): Mobile devs, UI designers, infrastructure, community

**Timeline**: 
- **Base plan (2 people)**: 28-32 weeks to MVP
- **Accelerated (with 2-3 contributors)**: 18-22 weeks to MVP
- **Full team (4+ people)**: 14-16 weeks to MVP

**Core Innovation**: Non-Transferable Identity (NTI) + Adaptive Avatar model shifts from network-only restriction to guidance-based safety.

**Success Criteria**: 
- Identity-based safety enforcement across Hub, Mobile App, and ControlApp
- < 24 hour content moderation SLA
- 99.5% policy sync success rate
- Pilot deployment with 50+ households/schools

---

## Development Phases

### **PHASE 1: Identity Foundation (Weeks 1-4)**

Build the security and identity backbone that all other services depend on.

#### Week 1-2: AuthenticationService
**Objectives**:
- NTI token generation, validation, and lifecycle
- HMAC-SHA256 device bootstrap verification
- Session management with appropriate timeouts
- Multi-factor authentication framework (TOTP, Yubikey)

**Deliverables**:
- `POST /api/v1/auth/login` - User authentication
- `POST /api/v1/auth/token/verify` - Token validation
- `POST /api/v1/auth/device/register` - Device bootstrap registration
- `POST /api/v1/auth/mfa/setup` and `verify` - MFA endpoints
- Rate limiting and brute-force protection

**Key Decisions**:
- Token expiry: 15 min access, 7 day refresh tokens
- Session timeout: 30 min mobile, 60 min web
- Password requirements: minimum 12 chars + complexity
- MFA: mandatory for admins, optional for parents

**2-Person Team Assignment**: You (primary) + AI (code generation, testing)
- Estimated effort: 200-250 hours (4-5 weeks for 2 people working together)

**Dependencies**: None (foundation service)

---

#### Week 2-3: DigitalID Component
**Objectives**:
- NTI identity creation and storage
- Identity encryption at rest
- Backup to Yubikey/USB support
- Identity recovery workflows

**Deliverables**:
- Identity creation API
- Encrypted identity storage mechanism
- Backup export/import functionality
- Recovery from backup with parental override
- Identity metadata (created date, last verification, expiry)

**Key Decisions**:
- Encryption: AES-256 for identity data
- Backup: QR code + encrypted file export for Yubikey
- Verification: 1-week to 1-month intervals (configurable)
- Non-transferability: tied to device fingerprint + parent token
2-Person Team Assignment**: You (design) + AI (implementation)
- Estimated effort: 150-200 hours (3-4 weeks for 2 people working together)

**Dependencies**: AuthenticationService

**Contributor Opportunity**: Identity backup/recovery can be outsourced to community (good starter issue)
**Dependencies**: AuthenticationService

---

#### Week 3-4: VerificationApp
**Objectives**:
- Age verification from trusted sources (e.g., government ID, school)
- One-time verification flow
- Encrypted identity storage post-verification
- Integration with DigitalID

**Deliverables**:
- Verification UI (age confirmation, ID submission)
- Backend verification processing
- Identity issuance post-verification
- Audit trail of verification events

**Key Decisions**:
- 2-Person Team Assignment**: You (backend) + AI (UI/integration)
- Estimated effort: 120-150 hours (2-3 weeks for 2 people working together)

**Dependencies**: DigitalID, AuthenticationService

**Contributor Opportunity**: This component works well for open-source contributors (separate UI and backend logic)compliance, identity token retained long-term

**Team**: 1 Full-stack Developer (UI + backend integration)

**Dependencies**: DigitalID, AuthenticationService

---

**Phase 1 Checkpoint** (End of Week 4):
- ✅ Identity tokens can be generated and validated
- ✅ Users can be verified and identities created
### Phase 2: Policy & Hub Infrastructure (Weeks 5-18 for 2-person team)

Build policy engine and the physical Hub device that enforces safety rules.

**2-Person Team Note**: HomeHubApp is longest component. Run PolicyEngine in parallel (Weeks 5-7) while Hub firmware work continues. Hub development is the critical path.

---

### **PHASE 2: Policy & Hub Infrastructure (Weeks 5-8)**

Build policy engine and the physical Hub device that enforces safety rules.

#### Week 5-6: PolicyEngine
**Objectives**:
- Policy template definition and validation
- Real-time policy evaluation
- Policy versioning and rollback
- Exception handling and conflict resolution

**Deliverables**:
- `POST /api/v1/policies` - Create policy template
- `POST /api/v1/enforce` - Real-time policy evaluation
- `PUT /api/v1/policies/{policyId}` - Update policy
- `GET /api/v1/policies/{childId}/active` - Get active policies
- Policy conflict detection and resolution
- Audit logging of all policy decisions

**Policy Types**:
1. Identity policies (avatar usage, verification frequency)
2. Content policies (age-appropriate filtering, blocked domains)
3. Temporal policies (screen time, quiet hours, access schedules)
4. Social policies (messaging permissions, group access)
5. Location policies (geo-fencing, location-based access)

**Key Decisions**:
- 2-Person Team Assignment**: You (primary) + AI (code generation, testing)
- Estimated effort: 150-180 hours (2-3 weeks for 2 people working together)

**Dependencies**: AuthenticationService

**Note**: Start this while finishing VerificationApp (Week 5) to keep momentum with timestamp
- Rollback: Can revert to any previous policy within 30-day window

**Team**: 1 Backend Engineer (specializing in rules engines)

**Dependencies**: AuthenticationService

---

#### Week 6-8: HomeHubApp (SBC Firmware)
**Objectives**:
- Evolve existing Flask prototype to production firmware
- DNS policy enforcement (block/allow domains)
- VPN gateway and routing
- Local policy caching and fallback
- Integration with cloud services

**Deliverables**:
- Production Hub OS image (based on Raspberry Pi or similar SBC)
- DNS service with policy enforcement
- VPN gateway (WireGuard or similar)
- Device registration via bootstrap HMAC
- Policy sync from cloud
- Local logging and crash reporting
- Admin web UI for Hub management

**Hardware Target**:
- Single-board computer (Raspberry Pi 4/5, Orange Pi, or similar)
- 2GB+ RAM, 16GB+ storage
- Dual Ethernet (WAN/LAN) or WiFi
- USB for recovery/provisioning

**Key Deliverables**:
- Bootable Hub OS image
- DNS filtering service
- VPN gateway service
- Web management UI (basic)
- Policy enforcement logs
- Device telemetry collection
2-Person Team Assignment**: You (firmware, networking) + AI (implementation, testing)
- Estimated effort: 400-500 hours (8-10 weeks for 2 people working together)
- **CRITICAL PATH**: Longest component in MVP development

**Scaling Note**: This is ideal for bringing on first contributor - a device/embedded engineer can parallelize work (device drivers, VPN integration, etc.
**Key Decisions**:
- Base OS: Debian/Ubuntu or custom Linux (for security hardening)
- DNS: Unbound or Pi-hole based engine
- VPN: WireGuard (lightweight, secure)
- Local storage: Policy cache + last 7 days of logs
- Fallback: If cloud unreachable, enforce last known policies for 24 hours

**Team**: 2 Backend/Embedded Engineers (firmware, networking)

**Dependencies**: PolicyEngine, AuthenticationService

---

#### Week 7-8: SyncService
**Objectives**:
- Distribute policies to all child devices
- Synchronize avatars and identity status
- Handle offline queuing and sync confirmation
- Conflict resolution for simultaneous updates

**Deliverables**:
- `POST /api/v1/sync/policy` - Push policy updates
- `GET /api/v1/sync/policy/{childId}` - Poll for policy changes
- `POST /api/v1/sync/avatar` - Push avatar updates
- `POST /api/v1/sync/confirm` - Device confirmation of successful sync
- Offline queue management
- Rollback mechanism for sync failures

**Sync Strategy**:
- Hub sync: Push within 5 minutes + confirmation
- Mobile sync: Pull on app launch + background refresh
- 2-Person Team Assignment**: You (design) + AI (implementation)
- Estimated effort: 180-220 hours (3-4 weeks for 2 people working together)

**Dependencies**: PolicyEngine, HomeHubApp (as client), AuthenticationService

**Scaling Note**: Can be parallelized with HomeHubApp if contributor joins (one person does Hub client integration, another does core sync logic)
**Key Decisions**:18 for 2-person team
- Latency target: < 5 minutes policy deployment to all devices
- Offline handling: Queue changes, sync when connectivity restored
- Conflict resolution: Parent authority > School > System defaults
- Retry: Exponential backoff with max 3 retries

**Team**: 1 Backend Engineer (distributed systems)

**Dependencies**: PolicyEngine, HomeHubApp (as client), AuthenticationService

---

**Phase 2 Checkpoint** (End of Week 8):
- ✅ Policies can be defined, validated, and evaluated in real-time
- ✅ Hub device can enforce DNS policies and VPN routing
- ✅ Policies sync to devices within 5 minutes
- ✅ System works offline with local fallback
- 🎯 **Deliverable**: Functional Hub device with policy enforcement + policy sync working

---

### **PHASE 3: User Interfaces (Weeks 9-12)**

Build the applications parents and children use daily.

#### Week 9-10: ControlApp (Desktop)
**Objectives**:
- Parent identity setup and Yubikey backup
- Avatar creation and customization
- Policy configuration and management
- Identity verification scheduling
- Device management

**Platforms**: macOS + Windows (Desktop priority)

**Deliverables**:
- Parent login and authentication
- Identity creation workflow with backup to Yubikey
- Avatar designer (appearance, personality, messaging templates)
- Policy builder UI (visual policy configuration)
- 2-Person Team Assignment**: You (primary) + AI (implementation)
- Estimated effort: 280-320 hours (5-6 weeks for 2 people)

**Scaling Note**: Desktop app is good for junior developer or open-source contributor

**Dependencies**: AuthenticationService, AvatarService, PolicyEngine

**MVP Simplification**: Skip Windows initially, focus on macOS (can add Windows later when contributors join)

**Key Decisions**:
- Framework: Electron (cross-platform) or native (macOS/Windows)
- Backup: Encrypted QR code + USB export
- Avatar customization: 20+ appearance options, personality preset + custom
- Policy UI: Visual builder with templates for common scenarios

**Team**: 1-2 Full-stack Developers (Desktop UI, secure storage)

**Dependencies**: AuthenticationService, AvatarService, PolicyEngine

---

#### Week 10-12: MobileApp (iOS + Android)
**Objectives**:
- Child authentication via NTI + Avatar
- Safe social feed (walled-view)
- VPN connection to Hub
- SOS emergency button with location sharing
- Avatar guidance interface
- Policy enforcement feedback

**Platforms**: iOS 13+ (native Swift) + Android 9+ (native Kotlin)

**Deliverables**:
- NTI + Avatar login screen
- Safe social feed with content filtering
- VPN connection manager (status indicator, connection logs)
- 2-Person Team Assignment**: You (iOS lead) + AI (Android) OR defer Android
- Estimated effort: 500-600 hours for iOS only (10+ weeks for 2 people)
- Android adds another 400+ hours (8-10 weeks)

**For 2-Person MVP**: Build iOS only (10 weeks), defer Android to Phase 5
- iOS: 95% of revenue initially (Apple ecosystem adoption higher for kids' safety apps)
- Android: Add when mobile contribut28 for 2-person team joins

**Scaling Note**: First mobile contributor priority - brings iOS/Android to 6-8 week timeline with trusted contacts)
- Avatar guidance messages and responses
- Activity logs and usage statistics
- Settings (notifications, quiet hours, profile management)

**Key Decisions**:
- VPN: WireGuard SDK or similar
- Content filtering: Client-side filtering + server-side policy enforcement
- SOS: One-tap trigger, location sharing with parental consent
- Avatar: Animated character with voice guidance (optional)
- Offline: Core features work offline, sync when connectivity restored

**Team**: 2 Mobile Engineers (1 iOS, 1 Android)

**Dependencies**: AuthenticationService, AvatarService, SyncService, PolicyEngine

---

**Phase 3 Checkpoint** (End of Week 12):
- ✅ Parents can create identities, customize avatars, configure policies
- ✅ Children can authenticate with NTI + Avatar
- ✅ Mobile app enforces policies and shows avatar guidance
- ✅ SOS button and emergency alerts work end-to-end
- 🎯 **Deliverable**: Functional end-to-end system (identity → policy → enforcement)

---

### **PHASE 4: Cloud Services (Weeks 13-16)**

Build moderation, monitoring, and admin infrastructure.

#### Week 13: ContentModerationService + AdminPortal
**Objectives**:
- Content ingestion from Mobile App
- Automated content classification (rule-based + ML placeholder)
- Human review queue management
- Appeal handling
- 2-Person Team Assignment**: You (backend) + AI (UI automation)
- Estimated effort: 200-250 hours (4-5 weeks for basic manual queue)

**MVP Alternative**: Use simple web form + Google Sheets for moderation queue during pilot (manual process, upgrade to full system in Phase 5)

**Scaling**: Great task for open-source contributor (UI design, moderation workflow

**Deliverables**:
- `POST /api/v1/content/report` - Submit flagged content
- `GET /api/v1/queue` - Moderation queue (admin access)
- `POST /api/v1/review/{contentId}` - Submit review decision
- Web UI for human moderation workflow
- Appeal queue and workflow
- Audit logging of all decisions

**Key Decisions**:
- Automated filtering: Rule-based classifier (no ML for MVP)
- Review SLA: < 24 hours from submission
- Appeal process: 2-tier review with reasoning
- Severity levels: Safe, Warning, Block

**Team**: 1 Backend Engineer + 1 Frontend Engineer (UI)

**Dependencies**: AuthenticationService, AnalyticsService (for metrics)
2-Person Team Assignment**: You (backend) + AI (dashboard UI)
- Estimated effort: 200-250 hours (4-5 weeks basic version)

**MVP Simplification**: Start with read-only dashboard (activity logs, alerts). Write functionality can be added later.

**Scaling**: Great task for UI/designer contributo
---

#### Week 14: ParentDashboardAPI + Analytics Frontend
**Objectives**:
- Parent dashboard for child monitoring
- Activity reports and analytics
- Alert management
- Device status visibility

**Deliverables**:
- `GET /api/v1/profile/{childId}` - Child profile
- `GET /api/v1/activity/{childId}` - Activity logs
- `GET /api/v1/alerts/{childId}` - Active alerts
- 2-Person Team Assignment**: Use Firebase Cloud Messaging (FCM) for MVP (no custom service needed)
- Estimated effort: 50-80 hours to integrate FCM
- Alternative: Simple email/webhook notifications initially

**Scaling**: Can build custom NotificationService in Phase 5 if needed
- Usage reports (weekly/monthly)
- Device status indicators

**Team**: 1 Backend Engineer + 1 Frontend Engineer

**Dependencies**: ParentDashboardAPI definition, AnalyticsService

---

#### Week 15: NotificationService + ApplianceManager
**Objectives**:
- Push notification delivery (APNs/FCM)
- Email and SMS alerts
- SOS priority routing
- Device management at scale
2-Person Team Assignment**: You (test planning) + AI (test automation)
- Estimated effort: 150-200 hours

**Testing Focus** (MVP):
- Unit tests: 80% coverage on critical services (Auth, Policy, Sync)
- Integration tests: End-to-end flows (identity → policy → enforcement)
- Device testing: Hub and mobile app on real hardware

**Defer to Phase 5**: Load testing, penetration testing (hire external auditor)
**Deliverables**:
- `POST /api/v1/notify/push` - Send push notifications
- `POST /api/v1/notify/sos` - Route SOS events
- Device provisioning and firmware management
- Device health monitoring dashboard

**Team**: 1 Backend Engineer (notifications + device management)

**Dependencies**: AuthenticationService

---

#### Week 16: Integration Testing + Documentation
**Objectives**:
- End-to-end system testing
- Performance validation
- Compliance and security review
- Pilot deployment preparation

**Deliverables**:
- Test suite (unit + integration + e2e)
- Performance benchmarks
- Security audit findings and remediation
- Deployment playbook
- Pilot participant onboarding guide

**Team**: QA Engineer + DevOps Engineer

**Dependencies**: All services

---

**Phase 4 Checkpoint** (End of Week 16):
- ✅ Moderation pipeline working with human review
- ✅ Parent dashboards showing child activity and alerts
- ✅ Notifications delivering across channels
- ✅ Device management infrastructure ready for scale
- 🎯 **Deliverable**: Complete MVP ready for pilot deployment

---

## Development Timeline (2-Person Core Team)

```
Timeline: 28-32 weeks for 2-person team
Can accelerate with contributors (see notes)

Week  1   2   3   4   5   6   7   8   9  10  11  12  13  14  15  16  17  18  19  20  21  22  23  24  25  26  27  28

Phase 1: Identity Foundation
├─ AuthenticationService    [██████]
├─ DigitalID Component          [███████]
└─ VerificationApp                 [███████]

Phase 2: Policy & Hub (Parallel start Week 3)
├─ PolicyEngine              [██████]
├─ HomeHubApp (SBC)              [██████████████]
└─ SyncService                           [███████]

Phase 3: User Interfaces (Start Week 8+)
├─ ControlApp (Desktop)              [████████████]
└─ MobileApp (iOS first)                      [████████████████]

Phase 4: Cloud Services (Start Week 16+)
├─ ContentModerationService (manual→auto)          [████████]
├─ ParentDashboardAPI + Analytics                  [████████]
├─ NotificationService                                  [████]
└─ Integration & Pilot Prep                              [██████]

Contributors Timeline:
  Mobile Dev arrives (Week 14)   ↓
  ├─ Android App dev starts [██████████]
  ├─ iOS optimization       [████]
  └─ MobileApp accelerates by 4-6 weeks

  UI Designer arrives (Week 8)   ↓
  ├─ ControlApp UI polish [██████████]
  └─ AdminPortal design   [██████████]
```

**Notes**:
- 2-person team processes services serially (one major component at a time)
- Parallel work focuses on independent services (Auth can run while Policy being designed)
- Contributors can parallelize work (MobileApp development while core backend continues)
- Total timeline reduces ~6 weeks per additional developer added

---

## Team Structure & Scaling

### Current Team (2 People)
- **You (Founder/Lead)**
  - Architectural decisions and design
  - Community management and contributor coordination
  - Deployment and operations
  - Backend core services (40% of time)
  
- **AI Assistant (Development Bot)**
  - Code generation and implementation
  - Testing and validation
  - Documentation
  - Backend services (60% of time)

**Realistic Capacity**: 
- 1 major component per 2-3 weeks
- 60-70% feature velocity vs. full team
- Focus on serial development (one component mostly complete before next)

### Scaling Path (as Contributors Join)

**With 1 Mobile Developer** (add Week 14+)
- Accelerates MobileApp development by 3-4x
- Reduces total timeline by 4-6 weeks

**With 2+ UI Designers/Contributors** (add Week 8+)
- ControlApp and AdminPortal accelerate
- Can parallelize with backend work

**With DevOps/Infrastructure** (add Week 12+)
- Staging environment ready earlier
- Deployment automation and monitoring

### External Partners (Regardless of Team Size)
- **Legal/Compliance**: GDPR validation, privacy review
- **Security Auditor**: Third-party penetration testing (Week 14-16)
- **Schools/Parent Groups**: Pilot validation (3-5 organizations)
- **Open-Source Contributors**: ControlApp, documentation, testing

---

## Key Dependencies & Blockers

| Dependency | Impact | Mitigation |
|------------|--------|-----------|
| AuthenticationService completion | All services blocked | Build in parallel with DigitalID |
| PolicyEngine definition | Hub firmware blocked | Complete by end of Week 5 |
| Hardware selection for Hub | Device development blocked | Decide by Week 1 (recommend RPi 4) |
| Third-party verification partners | VerificationApp blocked | Contact by Week 1 |
| GDPR legal review | Compliance unclear | Parallel with Phases 1-2 |
| Pilot schools/households | Validation blocked | Recruit by Week 8 |

---

## Risk Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Feature scope creep | High | Delays | Strict MVP scope, defer nice-to-haves to Phase 2 |
| Security vulnerabilities | Medium | Critical | Third-party security audit in Week 14-15 |
| Mobile app delays | Medium | Moderate | Start with iOS first, Android follows (shared architecture) |
| Hub hardware unavailable | Low | Moderate | Pre-order hardware by Week 1, identify backup options |
| Policy sync conflicts | Medium | Moderate | Thorough testing in Week 14-16 |
| Performance bottlenecks | Medium | Moderate | Load testing in Week 14, optimize bottlenecks |

---

## Success Metrics

### Development Phase Metrics
- **Code Quality**: 80%+ test coverage, <2 critical bugs per component
- **Performance**: API p95 latency < 200ms, Hub DNS < 50ms
- **Reliability**: 99.5%+ uptime in staging environment
- **Security**: 0 critical vulnerabilities in third-party audit

### MVP Launch Metrics
- **Completeness**: All Phase 1-4 deliverables shipped
- **Functionality**: End-to-end flow works (identity → policy → enforcement)
- **Compliance**: GDPR checklist 100% complete
- **Documentation**: API docs, deployment guide, user guides complete

### Pilot Phase Metrics (12 weeks post-launch)
- **Adoption**: 50+ households/schools enrolled
- **Engagement**: 70%+ active daily usage rate
- **Safety**: Reduction in reported safety incidents by 30%+
- **Satisfaction**: Parent NPS > 50, admin satisfaction > 4/5
- **Performance**: SLA compliance > 95% (< 24 hour moderation, 99.5% uptime)

---

## Deployment Strategy

### Staging Environment
- Complete MVP deployed and tested
- Performance benchmarking completed
- Security audit findings remediated
- All documentation complete

### Pilot Deployment (Week 17-28)
1. **Week 17-18**: Onboard 10 households (early adopters, internal team)
2. **Week 19-20**: Expand to 25 households + 2 schools
3. **Week 21-24**: Expand to 50+ households/schools, collect feedback
4. **Week 25-28**: Bug fixes, performance optimization, prepare for public launch

### Metrics Tracked During Pilot
- Daily active users
- Feature usage (VPN, SOS, Avatar interaction)
- Policy violation trends
- Moderation queue metrics
- Device uptime and reliability
- Parent satisfaction and NPS
- Safety incident reports

---

## Post-MVP Roadmap (Phase 5+)

### Phase 5: Scale & Optimization (Months 6-9)
- ML-based content moderation
- Advanced avatar AI (natural language responses)
- School integration APIs
- Community features (safe social groups)

### Phase 6: Public Launch (Month 10+)
- Marketing and awareness campaigns
- Public download on app stores
- Community hub expansion
- International localization

---

## Deliverables by Phase

### Phase 1 Demo (Week 4)
- Identity creation, verification, and recovery flow
- Demo video: Parent creates identity, child logs in with NTI

### Phase 2 Demo (Week 8)
- Policy creation and enforcement on Hub
- Demo video: Parent creates policy, Hub blocks domain, policy syncs to mobile
- Hub device running and enforcing policies

### Phase 3 Demo (Week 12)
- Full end-to-end system working
- Parent creates avatar, child logs in, social feed works, SOS button functional
- All three apps (ControlApp, MobileApp, Hub) communicating

### Phase 4 Demo (Week 16)
- Complete MVP ready for pilot
- Moderation queue, parent dashboard, notifications working
- Pilot onboarding guide complete

---

## Notes & Assumptions

1. **Team availability**: Full-time dedicated team (no part-time contributors)
2. **Hardware**: Raspberry Pi 4 (2GB RAM, 16GB storage) as target Hub device
3. **Tech stack**:
   - Backend: Node.js/Express or Python/FastAPI
   - Frontend: React/Vue for web dashboards
   - Mobile: Native Swift (iOS) + Kotlin (Android)
   - Hub OS: Debian-based Linux
4. **Data residency**: UK/EU hosting for all personal data
5. **Compliance**: GDPR-first design, privacy by design
6. **Open source**: All components under AGPLv3 license

---

## Next Steps

1. **This Week**: Confirm team composition, lock hardware selection
2. **Week 1**: Kick off AuthenticationService and DigitalID in parallel
3. **Week 2**: Set up development environment, CI/CD pipelines
4. **Week 3**: Begin VerificationApp and PolicyEngine
5. **Week 5**: Begin Hub firmware development
6. **Week 8**: Begin UI development (ControlApp, MobileApp)
7. **Week 13**: Begin cloud services
8. **Week 16**: Full team focus on integration and pilot prep

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Apr 18, 2026 | AI Assistant | Initial roadmap creation |
| | | | 16-week MVP timeline |
| | | | 4-phase development plan |
| | | | Team requirements and risk mitigation |

---

**For questions or clarifications, see [CONTRIBUTING.md](../Docs/Project_Contributers_Info/CONTRIBUTING.md)**

**For governance, see [GOVERNANCE.md](../Docs/Project_Contributers_Info/GOVERNANCE.md)**
