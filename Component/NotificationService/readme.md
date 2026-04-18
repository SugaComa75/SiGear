# NotificationService

## Purpose
Centralized notification and alerting system. Manages push notifications, email alerts, in-app messages, and SOS event routing across MobileApp, ControlApp, ParentDashboard, and AdminPortal.

## Responsibilities
- **Push Notification Delivery**: Route notifications to iOS/Android via APNs/FCM
- **Multi-Channel Alerts**: Email, SMS (if enabled), in-app banners, dashboard notifications
- **SOS Event Routing**: Priority handling of emergency SOS triggers with location sharing
- **Policy Update Notifications**: Notify users when policies change or avatar permissions update
- **Alert Aggregation**: Batch low-priority alerts, deduplicate, prevent notification fatigue
- **Notification Scheduling**: Respect quiet hours, do-not-disturb settings, per-user preferences
- **Delivery Verification**: Track delivery status, retry failed sends, log delivery metrics
- **Notification History**: Maintain audit trail of all notifications sent

## Key APIs
- `POST /api/v1/notify/push` - Send push notification (internal service-to-service)
- `POST /api/v1/notify/email` - Send email alert
- `POST /api/v1/notify/sos` - Route SOS emergency event (priority)
- `POST /api/v1/notify/policy-update` - Notify of policy change
- `GET /api/v1/notifications/{userId}` - Retrieve notification history
- `POST /api/v1/preferences/{userId}` - Update notification preferences
- `GET /api/v1/delivery-status/{notificationId}` - Check notification delivery status

## Integration Points
- **MobileApp**: Receives push notifications, SOS alerts, policy updates
- **ControlApp**: Receives policy change notifications, identity verification reminders
- **ParentDashboardAPI**: Routes alerts based on configured rules and thresholds
- **ContentModerationService**: Alerts parents when moderation action taken on child's content
- **PolicyEngine**: Notifies when policy enforcement actions occur
- **HomeHubApp**: Receives connectivity and offline event notifications
- **AdminPortal**: Sends urgent moderation queue alerts to human reviewers

## Notification Types
1. **Security Alerts**: SOS trigger, attempted policy bypass, unusual activity
2. **Content Alerts**: Flagged content, moderation actions, appeals
3. **Identity Alerts**: Identity verification due, failed verification, recovery needed
4. **Policy Alerts**: Policy changes, permission updates, new restrictions
5. **System Alerts**: Hub connectivity lost, offline mode, sync failures
6. **Maintenance Alerts**: Updates available, maintenance windows, outages
7. **Educational Alerts**: Competency test results, skill achievements, teaching content available

## Data Compliance
- Do not include sensitive data in notifications (use reference IDs)
- Respect notification consent and opt-out preferences
- GDPR-compliant email and SMS delivery
- Secure delivery logs without storing message content long-term
- End-to-end encryption for sensitive SOS event routing

## Success Metrics
- Push delivery rate: > 95%
- Delivery latency: < 5 seconds (p95)
- SOS event response: < 1 second from trigger to delivery
- Notification accuracy: zero false alerts per 10,000 messages
- Parent satisfaction with alert frequency and relevance
