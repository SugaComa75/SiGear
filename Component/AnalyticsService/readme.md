# AnalyticsService

## Purpose
Telemetry aggregation and analytics service. Collects usage metrics, safety incidents, system performance data, and generates reports for parents, administrators, and system operators.

## Responsibilities
- **Metrics Collection**: Aggregate telemetry from Hub, Mobile App, Control App, HomeHubApp
- **Safety Metrics**: Track policy violations, blocked attempts, moderation actions, SOS triggers
- **Usage Analytics**: Screen time, app usage, network activity, social interaction patterns
- **System Metrics**: Hub uptime, connectivity, policy sync success, device health
- **Report Generation**: Produce usage reports, safety summaries, trend analysis
- **Trend Analysis**: Identify patterns in behavior, policy violations, content risks
- **Alerting**: Trigger alerts on unusual patterns (spike in violations, device failure, etc.)
- **Dashboard Data**: Provide real-time metrics for parent and admin dashboards
- **Data Retention**: Manage data lifecycle with privacy-compliant purging
- **Performance Monitoring**: Track service health, API response times, error rates

## Key APIs
- `POST /api/v1/events` - Submit telemetry event (Hub/App calls)
- `GET /api/v1/analytics/child/{childId}/usage` - Get usage analytics
- `GET /api/v1/analytics/child/{childId}/safety` - Get safety incident summary
- `GET /api/v1/reports/usage/{childId}?period=week` - Generate usage report
- `GET /api/v1/reports/safety/{childId}?period=month` - Generate safety report
- `GET /api/v1/metrics/system/health` - System performance metrics
- `GET /api/v1/trends/{childId}` - Identify behavioral patterns
- `GET /api/v1/alerts/system` - System-wide alerts and anomalies
- `POST /api/v1/analytics/custom-query` - Ad-hoc data query (admin only)

## Event Types (Telemetry)
1. **Usage Events**: App launch, session start/end, feature usage, content view
2. **Safety Events**: Policy violation, blocked attempt, content flagged, moderation action
3. **Identity Events**: Identity verification, avatar change, authentication event
4. **Device Events**: Hub sync, connectivity change, policy update, device error
5. **Social Events**: Messaging, content sharing, peer interaction, group activity
6. **System Events**: API errors, service degradation, data sync failure, SOS trigger

## Report Types
1. **Weekly Usage Report**: Screen time, apps used, time of day patterns
2. **Monthly Safety Report**: Policy violations, content flags, moderation actions
3. **School Report**: Class activity, group engagement, competency progress
4. **Hub Health Report**: Uptime, connectivity, policy sync success rates
5. **Incident Report**: SOS triggers, emergency events, escalated issues
6. **Trend Report**: Behavioral changes, risk indicators, engagement trends
7. **Moderation Report**: Review queue metrics, appeal rates, decision distribution
8. **System Report**: Overall platform health, error rates, performance metrics

## Dashboard Metrics
- **For Parents**: Daily usage summary, weekly trends, safety alerts, device status
- **For Administrators**: User counts, platform health, moderation queue depth, policy effectiveness
- **For Moderators**: Review queue metrics, decision rate, appeal rate, accuracy
- **For System Operators**: API latency, error rates, storage usage, compliance metrics

## Data Compliance
- Minimal PII collection (use identity tokens, not names)
- UK GDPR compliant data retention (auto-purge non-aggregated data per policy)
- UK/EU data residency for all analytics data
- Parental consent verification before analytics sharing
- Transparent data collection practices
- Right to erasure for child data upon parent request
- No correlation of analytics with other services for tracking children

## Privacy Safeguards
- Aggregate reporting: no individual-level data shared beyond primary user (parent)
- Data anonymization: identify users by token, not personal data
- Differential privacy: add noise to small population analytics
- User control: parents can opt-out of non-essential telemetry
- Audit trail: all analytics data access logged

## Success Metrics
- Data collection latency: < 10 seconds from event to analytics available
- Report generation: < 30 seconds for weekly usage report
- Data accuracy: 99.5%+ event capture and processing
- Compliance: 100% GDPR adherence in data handling
- Parent satisfaction: report clarity and usefulness
- System performance: analytics service < 50ms latency impact on other services
