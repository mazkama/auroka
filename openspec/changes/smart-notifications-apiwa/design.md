# Design: Smart Multi-Channel Notification Engine & WhatsApp APIWA Integration

## Architectural Context
Auroka utilizes a 4-tier Clean Architecture frontend (Next.js 16) coupled with a Golang Gin REST API backend. The notification architecture introduces an event-driven and scheduled dispatcher that routes financial alerts to:
1. In-App Notifications (Stored in PostgreSQL `notifications` table)
2. WhatsApp Notifications via Local APIWA Gateway (`http://127.0.0.1:3100`)
3. Email Notifications via Resend API

## Security & Verification Rules
1. **WhatsApp Gatekeeping:** Users CANNOT enable `whatsapp_enabled: true` unless `is_phone_verified: true` and `phone_verified_at IS NOT NULL`.
2. **Phone Number Change:** Updating the phone number resets `is_phone_verified` to `false` and disables WhatsApp dispatches until re-verified.
3. **OTP Security:** OTPs are 6-digit numeric codes with 10-minute expiry, rate-limited to 1 request per 60 seconds per user.

## Data Flow
```
[ Event / Cron Worker ]
         │
         ▼
[ NotificationDispatcher ] ──► Check user_notification_settings
         │
         ├─► In-App DB: INSERT INTO notifications
         │
         ├─► If whatsapp_enabled AND is_phone_verified:
         │      APIWA Client ──► POST http://127.0.0.1:3100/api/v1/sessions/:id/send-message
         │
         └─► If email_enabled:
                Resend Client ──► Send HTML Email
```
