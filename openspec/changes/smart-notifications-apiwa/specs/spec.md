# Spec: Smart Multi-Channel Notification Engine & WhatsApp APIWA Integration

## Requirements

### R1: Notification Channel Selection & Verification Gatekeeper
- The system MUST allow users to configure their preferred notification channels (WhatsApp, Email, In-App).
- The system MUST strictly require WhatsApp phone verification (`is_phone_verified: true`) before enabling WhatsApp alerts.
- The system MUST support requesting a 6-digit OTP via WhatsApp and confirming it within a 10-minute expiry window.

### R2: Multi-Channel Alert Dispatching
- The system MUST dispatch due bill reminders (H-3, H-1, Due Date) to In-App and WhatsApp (if enabled).
- The system MUST dispatch overspending warnings (80% and 100% of budget limit) to In-App and WhatsApp (if enabled).
- The system MUST prevent duplicate message deliveries on the same calendar day using `notification_delivery_logs`.

### R3: In-App Notification Center
- The system MUST provide an unread counter badge in the application header.
- The system MUST provide a full notification center page at `/notifications` with filtering, search, mark-all-as-read, and actionable redirect links.
