# ParentDashboardAPI

## Purpose
RESTful backend service powering the Parent and School Administrator dashboard. Provides real-time data, policy management, alert handling, and reporting capabilities for parents and educators managing child/student safety.

## Responsibilities
- **User Profile Management**: Retrieve and manage child profiles, permissions, identity status
- **Policy Enforcement**: Get current policies, request policy changes, view policy history
- **Activity Monitoring**: Retrieve device activity logs, app usage statistics, network activity
- **Alert Management**: Fetch active alerts, acknowledge alerts, set alert thresholds and rules
- **Usage Reports**: Generate usage reports, screen time analytics, safety incident summaries
- **Block/Whitelist Management**: Manage domain/app blocks, whitelist requests, view enforcement stats
- **Device Status**: Query hub status, connectivity, policy sync status, storage usage
- **Notification Preferences**: Manage notification settings, alert schedules
- **School/Community Integration**: Multi-user access control for school administrators

## Key APIs
- `GET /api/v1/profile/{childId}` - Retrieve child profile and identity status
- `GET /api/v1/policies/{childId}` - Get current policies for child
- `POST /api/v1/policies/{childId}` - Update child policies
- `GET /api/v1/activity/{childId}?period=7days` - Retrieve activity logs and metrics
- `GET /api/v1/alerts/{childId}` - Get active/historical alerts
- `POST /api/v1/alerts/{alertId}/acknowledge` - Mark alert as reviewed
- `POST /api/v1/blocks` - Add/remove domain or app blocks
- `GET /api/v1/reports/{childId}/usage` - Generate usage report
- `GET /api/v1/device/{hubId}/status` - Query hub device status
- `POST /api/v1/notification-settings` - Update alert preferences

## Integration Points
- **ControlApp**: Submits policy changes, syncs profile data
- **MobileApp**: Source of activity data, usage metrics, alert triggers
- **HomeHubApp**: Reports device connectivity, policy sync status
- **ContentModerationService**: Returns moderation outcomes affecting child
- **NotificationService**: Sends alerts based on dashboard rules
- **AuthenticationService**: Validates parent/admin credentials and permissions
- **AnalyticsService**: Aggregates child activity and safety metrics
- **SyncService**: Ensures policy changes reach all child devices

## Data Compliance
- UK GDPR consent verification before data access
- Parental access controls (parent-only data, shared custody rules)
- Audit trail for all policy changes and data access
- Minimal PII storage (use identity tokens)
- End-to-end encryption for sensitive data in transit

## Success Metrics
- API response time: < 200ms (p95)
- Dashboard data refresh: < 30 seconds from hub/app event
- Mobile app compatibility: iOS 13+, Android 9+
- Parent satisfaction: policy update ease, data clarity
