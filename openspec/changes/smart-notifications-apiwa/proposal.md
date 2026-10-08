# Change: Smart Multi-Channel Notification Engine & WhatsApp APIWA Integration

## Why
Users need proactive alerts regarding due bills, overspending limits (80%/100%), and critical wallet balance to maintain financial awareness. Users must be able to choose their notification channels (WhatsApp, Email, In-App). WhatsApp alerts require verified phone numbers via WhatsApp OTP to prevent spam and ensure message delivery.

## What Changes
1. **Database Schema & Models (PostgreSQL & GORM):**
   - Create `notifications` table for in-app alert history, unread counters, and actionable redirect links.
   - Create `user_notification_settings` table storing channel preferences (`whatsapp_enabled`, `email_enabled`, `in_app_enabled`, `preferred_channel`), verified phone number, verification timestamp, and custom thresholds.
   - Create `notification_delivery_logs` to prevent duplicate message dispatches.
   - Support WhatsApp OTP verification flow in backend `otps` model (`type: 'PHONE_VERIFY'`, `channel: 'WHATSAPP'`).

2. **Backend Services & APIWA WhatsApp Client (Golang Gin):**
   - Implement `services.WhatsAppService` communicating with local APIWA service (`http://127.0.0.1:3100`).
   - Implement `services.NotificationDispatcher` handling In-App creation, WhatsApp dispatch, and Email dispatch based on verified user settings.
   - Implement Cron/Background Worker scanning due recurring bills (H-3, H-1, Hari H) and checking budget thresholds.
   - Add Endpoints:
     - `GET /api/v1/notifications` (List notifications with filter & pagination)
     - `GET /api/v1/notifications/unread-count` (Badge counter)
     - `PATCH /api/v1/notifications/:id/read` & `POST /api/v1/notifications/read-all`
     - `DELETE /api/v1/notifications/:id` & `DELETE /api/v1/notifications/clear-read`
     - `GET /api/v1/notifications/settings` & `PUT /api/v1/notifications/settings`
     - `POST /api/v1/notifications/verify-phone/request` & `POST /api/v1/notifications/verify-phone/confirm`

3. **Frontend In-App Center & Settings UI (Next.js 16 Clean Architecture):**
   - Header bell icon with dynamic unread badge count.
   - Dedicated `/notifications` page with Category Filter tabs (`Semua`, `Belum Dibaca`, `Tagihan & Budget`, `Keamanan`), search, and direct action buttons (e.g. "Bayar Tagihan").
   - `/settings` Notification Channel configuration tab with:
     - WhatsApp Verification Modal with 6-digit OTP input, resend timer, and verified badge.
     - Toggle switches for WhatsApp Alert (locked until verified), Email Alert, and In-App notifications.
     - Toggle switches for Bill Reminders, Budget Alerts, and Low Balance Warnings.

4. **Automated Testing & Verification:**
   - Backend unit tests for OTP verification and Notification Dispatcher.
   - Frontend Jest / Testing Library tests for `/notifications` and Settings channel toggles.
   - Full Next.js production build verification.
