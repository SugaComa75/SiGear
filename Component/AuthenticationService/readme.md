# AuthenticationService

## Purpose
Core identity verification and authentication service. Manages user authentication tokens, NTI (Non-Transferable Identity) verification, session management, and credential validation across all SiGear services.

## Responsibilities
- **Identity Verification**: Verify NTI status, check identity freshness, validate identity claims
- **Token Management**: Issue, validate, refresh, and revoke authentication tokens
- **Session Management**: Create and manage user sessions with appropriate timeout/idle policies
- **Multi-Factor Authentication**: Support for hardware tokens (Yubikey), TOTP, backup codes
- **Credential Validation**: Verify parent/admin credentials, role-based access control (RBAC)
- **Device Registration**: Validate device authenticity during bootstrap registration
- **OAuth Integration**: Support third-party integrations with secure OAuth flows
- **Audit Logging**: Log all authentication events, login attempts, token usage
- **Rate Limiting**: Prevent brute-force attacks, throttle failed attempts
- **Revocation Management**: Handle credential revocation, lost devices, emergency access

## Key APIs
- `POST /api/v1/auth/login` - Authenticate user, return session token
- `POST /api/v1/auth/token/verify` - Verify token validity and claims
- `POST /api/v1/auth/token/refresh` - Issue new token before expiry
- `POST /api/v1/auth/logout` - Revoke session token
- `POST /api/v1/auth/identity/verify` - Verify NTI identity status
- `POST /api/v1/auth/mfa/setup` - Set up multi-factor authentication
- `POST /api/v1/auth/mfa/verify` - Verify MFA code during login
- `POST /api/v1/auth/device/register` - Authenticate device bootstrap registration
- `GET /api/v1/auth/session/{sessionId}` - Retrieve session details
- `POST /api/v1/auth/credential/revoke` - Revoke compromised credentials

## Authentication Methods
1. **NTI + Avatar**: Primary authentication using Non-Transferable Identity
2. **Passkey/WebAuthn**: Hardware key or biometric authentication (Control App, Admin)
3. **TOTP/2FA**: Time-based one-time passwords for sensitive operations
4. **Yubikey**: Hardware token support for identity backup and recovery
5. **Device Keys**: HMAC-SHA256 signature for Hub device authentication
6. **HMAC Bootstrap**: Device provisioning during initial setup

## Integration Points
- **ControlApp**: Authenticate parent, verify identity, MFA setup
- **MobileApp**: NTI authentication, session management
- **HomeHubApp**: School admin authentication
- **AdminPortal**: Admin and moderator authentication, RBAC
- **ParentDashboardAPI**: Validate parent credentials before API access
- **VerificationApp**: Validate verified identity claims
- **ContentModerationService**: Verify reviewer credentials
- **All APIs**: Token validation middleware

## Data Compliance
- UK GDPR compliant credential storage (hashed passwords, no plaintext)
- UK/EU data residency for identity tokens and session data
- Minimal credential retention (auto-delete expired sessions after 30 days)
- Encrypted credential storage at rest
- Audit trail of all authentication events
- Right to erasure support for identity data

## Security Requirements
- Passwords: minimum 12 characters, complexity requirements
- Token expiry: 15 minutes for short-lived access, 7 days for refresh tokens
- Session timeout: 30 minutes idle on mobile, 60 minutes on web
- Rate limiting: 5 failed attempts locks account for 15 minutes
- MFA: required for parents, admins, and moderators
- Device validation: HMAC bootstrap signature verification for first registration

## Success Metrics
- Authentication latency: < 200ms (p95)
- Token validation: < 10ms in auth middleware
- Session availability: 99.9%+ uptime
- Zero successful unauthorized API calls from rate-limited attackers
- MFA adoption rate: 100% for admins and moderators
- Account recovery: < 1 hour for legitimate owner requests
