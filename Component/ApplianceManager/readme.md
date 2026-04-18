# ApplianceManager

## Purpose
Backend service for managing SiGear Hub devices at scale. Handles device provisioning, firmware management, remote support, health monitoring, and troubleshooting across deployed hubs in homes and schools.

## Responsibilities
- **Device Registration**: Onboard new Hub devices, assign to households/schools
- **Firmware Management**: Deploy firmware updates, rollback on failure, version tracking
- **Remote Access**: Provide secure remote console access for troubleshooting
- **Health Monitoring**: Track hub uptime, disk usage, memory, CPU, network connectivity
- **Performance Monitoring**: Monitor DNS queries, VPN throughput, policy enforcement latency
- **Log Collection**: Aggregate local hub logs to cloud for analysis and compliance
- **Device Configuration**: Remotely configure network settings, DNS servers, VPN endpoints
- **Crash Reporting**: Capture and analyze hub crashes, kernel panics, error states
- **Support Ticketing**: Integrate with support system for device-related issues
- **Lifecycle Management**: Track device provisioning, decommissioning, hardware replacement

## Key APIs
- `POST /api/v1/device/register` - Register new Hub device
- `GET /api/v1/device/{deviceId}` - Get device status and configuration
- `POST /api/v1/device/{deviceId}/firmware/update` - Deploy firmware update
- `GET /api/v1/device/{deviceId}/logs` - Retrieve device logs
- `POST /api/v1/device/{deviceId}/config` - Update device configuration
- `GET /api/v1/device/{deviceId}/health` - Get health metrics (CPU, memory, disk, connectivity)
- `POST /api/v1/device/{deviceId}/reboot` - Remote reboot device
- `POST /api/v1/device/{deviceId}/diagnostics` - Run diagnostics and collect reports
- `GET /api/v1/devices?status=offline` - Query devices by status
- `POST /api/v1/device/{deviceId}/support/session` - Initiate remote support session

## Device Management Workflows

### Device Provisioning
1. Hub powers on for first time (factory reset state)
2. Parent/admin scans QR code or enters device ID
3. Device enters provisioning mode, generates device ID and bootstrap keys
4. Device communicates with ApplianceManager to register
5. Parent confirms device ownership and assigns to household
6. Device receives configuration (WiFi, DNS, VPN settings)
7. Device downloads and installs system software
8. Device ready for operation

### Firmware Update
1. New firmware released and tested
2. Staged rollout to small device subset first
3. Monitor for errors and complaints
4. Gradual expansion to more devices
5. Optional automatic rollout with user notification
6. Failed updates automatically rollback to previous version
7. Device reports success/failure to ApplianceManager
8. Update metrics tracked for analysis

### Device Recovery
1. Device enters error state (network down, storage full, policy corruption)
2. Device automatically attempts recovery (restart, clear caches)
3. If recovery fails, alert sent to household and support team
4. Parent can initiate manual recovery:
   - Reboot device
   - Factory reset to baseline configuration
   - Restore from encrypted backup
5. ApplianceManager guides recovery process

### Remote Support Session
1. User initiates support ticket for device issue
2. Support agent receives ticket with device ID and issue description
3. Agent requests remote access permission from household
4. Parent approves (one-time or time-limited access)
5. Agent connects via encrypted tunnel to device console
6. Agent diagnoses issue, gathers logs, or makes configuration changes
7. Session ends, audit trail recorded

## Device Features Monitored
- **Network**: IPv4/IPv6 connectivity, DNS resolution, VPN connection status, latency
- **DNS Policy**: Active policy rules, enforcement rate, blocked requests per hour
- **VPN**: Connection status, throughput, uptime percentage
- **Local Storage**: Partition usage, log storage, policy database size
- **Processing**: CPU usage, memory usage, policy evaluation latency
- **Reliability**: Uptime percentage, reboot frequency, error rates
- **Security**: Firewall status, policy engine status, key rotation due
- **Synchronization**: Last successful policy sync, avatar config sync, time drift

## Deployment Scenarios
1. **Home Hub**: Single household device, parent manages via dashboard
2. **School Hub**: Shared device for classroom/school, IT admin manages via ApplianceManager
3. **Community Hub**: Managed by community center/club, designated admin manages
4. **Multi-Device Household**: Multiple devices in same household, coordinated via ApplianceManager

## Log Types Collected
- **Policy Engine Logs**: Policy decisions, blocks, allowed requests
- **VPN Logs**: Connection events, throughput, errors
- **System Logs**: Boot messages, service status, errors
- **Security Logs**: Authentication attempts, policy violations, recovery events
- **Performance Logs**: DNS query latency, VPN throughput, CPU/memory usage
- **Update Logs**: Firmware update progress, rollback events

## Integration Points
- **ParentDashboardAPI**: Reports device status and connectivity
- **SyncService**: Coordinates firmware updates and configuration distribution
- **PolicyEngine**: Distributes new policies to devices
- **AuthenticationService**: Validates device identity during registration
- **AdminPortal**: Displays device health metrics, supports remote troubleshooting
- **AnalyticsService**: Collects device performance metrics
- **NotificationService**: Alerts on device offline/error conditions

## Data Compliance
- Device registration audit trail (who registered, when, from where)
- Log data encrypted at rest in cloud storage
- UK GDPR compliant log retention (auto-purge logs after X days)
- Log data only accessible to authorized household/school users and support staff
- Remote access sessions encrypted end-to-end
- Audit trail of all remote access sessions for accountability

## Security Requirements
- Device authentication: HMAC bootstrap signature verification
- Firmware signing: All firmware updates digitally signed and verified
- Update verification: Device verifies firmware integrity before installation
- Remote access: Encrypted tunnels, optional time-limited session tokens
- Admin access: Restricted to authorized ApplianceManager admins only
- Audit logging: All management operations logged with operator ID

## Monitoring & Alerting
- Device offline for > 24 hours: alert household and support team
- Storage capacity > 80% full: alert and trigger log cleanup
- Policy sync failures: retry with exponential backoff, alert if persistent
- High error rates: collect diagnostics, escalate to support
- Firmware update failure: automatic rollback, alert support team

## Success Metrics
- Device provisioning time: < 10 minutes end-to-end
- Firmware update success rate: 99.5%+ (minimal rollbacks)
- Device uptime: 99.5%+ for owned devices
- Support response: < 30 minutes to initiate remote session
- Log collection: < 5 minute latency from device to cloud
- Remote session reliability: 99%+ session success rate
- Parent satisfaction: ease of setup, quick resolution of issues
