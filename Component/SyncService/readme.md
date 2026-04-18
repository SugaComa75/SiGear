# SyncService

## Purpose
Cross-device and cross-platform synchronization service. Ensures policies, avatars, identity status, and application state remain consistent across all of a child's devices (Hub, Mobile App, Control App, HomeHubApp).

## Responsibilities
- **Policy Sync**: Distribute policy updates to Hub, Mobile App, and HomeHubApp within 5 minutes
- **Avatar Sync**: Synchronize avatar configuration and status across devices
- **Identity Sync**: Keep identity status consistent (verification status, recovered identity, etc.)
- **Settings Sync**: Sync user preferences, notification settings, quiet hours, etc.
- **Conflict Resolution**: Handle version conflicts when multiple devices try to sync simultaneously
- **Offline Support**: Queue changes when offline, sync when connectivity restored
- **Incremental Sync**: Only push changed data to minimize bandwidth
- **Sync Verification**: Confirm successful sync on each device
- **Rollback Support**: Revert to last known good state if sync corruption detected
- **Performance**: Efficient sync to minimize battery drain and bandwidth on mobile

## Key APIs
- `POST /api/v1/sync/policy` - Push policy update to devices
- `GET /api/v1/sync/policy/{childId}` - Poll for policy changes
- `POST /api/v1/sync/avatar` - Push avatar configuration updates
- `GET /api/v1/sync/avatar/{childId}` - Poll for avatar changes
- `POST /api/v1/sync/identity` - Update identity status across devices
- `POST /api/v1/sync/settings` - Sync settings across devices
- `POST /api/v1/sync/confirm` - Device confirms successful sync
- `POST /api/v1/sync/rollback` - Rollback to last known good state
- `GET /api/v1/sync/status/{childId}` - Check sync status for all child devices

## Sync Data Types
1. **Policies**: Content filters, temporal restrictions, social limits, device rules
2. **Avatars**: Avatar appearance, behavior configuration, messaging templates
3. **Identity**: Identity verification status, avatar permissions, recovery codes
4. **Permissions**: App access, domain access, peer communication permissions
5. **Settings**: Notification preferences, quiet hours, emergency contacts
6. **Rules**: Custom rules, exceptions, temporary overrides
7. **Lists**: Block lists, whitelist, trusted contacts

## Device Types & Platforms
- **Hub (SBC)**: Updates via dashboard or parent app, needs local storage backup
- **Mobile App (iOS/Android)**: Push notifications + pull mechanism, offline queue
- **Control App (macOS/Windows)**: Desktop application, periodic polling
- **HomeHubApp (School Appliance)**: Receives class-specific policy updates

## Sync Strategy
1. **Push-based** (for urgent updates): Server pushes policy changes immediately
2. **Pull-based** (for bandwidth efficiency): Devices poll for changes on wake/login
3. **Hybrid**: Push trigger + pull confirmation to ensure delivery
4. **Offline Queue**: Store changes locally, sync when connectivity restored

## Conflict Resolution
- **Last-write-wins**: For non-conflicting updates
- **Parent authority**: Parent changes override child/system changes
- **School authority**: School policies override child policies (when applicable)
- **Merge strategy**: For complex conflicts (multiple policy updates), merge non-conflicting parts
- **User notification**: Alert users when conflicts detected and resolved

## Integration Points
- **PolicyEngine**: Receives policy change events to sync
- **AvatarService**: Avatar updates trigger sync distribution
- **ControlApp**: Parent initiates policy/settings sync
- **MobileApp**: Receives sync updates, confirms successful sync
- **HomeHubApp**: Receives school policy updates
- **ParentDashboardAPI**: Reports sync status and device connectivity
- **NotificationService**: Notifies of successful/failed syncs
- **AuthenticationService**: Validates device credentials before sync

## Data Compliance
- Sync data integrity verification (checksums, signatures)
- Encrypted sync payloads in transit (TLS 1.3+)
- Minimal retry attempts (prevent sync flooding attacks)
- Audit trail of all sync operations
- Compliance with UK GDPR data processing rules

## Performance Requirements
- Policy sync time: < 5 minutes from change to all devices
- Avatar sync: < 30 seconds to all devices
- Identity sync: < 1 minute to all devices
- Bandwidth impact: < 1MB per week per device
- Battery impact: minimal (efficient sync scheduling)
- Hub storage: < 100MB for all sync data

## Success Metrics
- Sync success rate: 99.5%+ (no data loss)
- Sync latency: < 5 minutes for policy updates
- Conflict resolution: 100% successful without user intervention
- Offline handling: 100% of offline changes synced when connectivity restored
- Device coverage: all child devices in sync within 5 minutes of update
- Parent satisfaction: quick enforcement of policy changes, transparent status
