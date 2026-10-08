# Tasks: Smart Multi-Channel Notification Engine & WhatsApp APIWA Integration

## 1. Backend Database Schema & GORM Models
- [x] 1.1 Create `models.Notification`, `models.UserNotificationSettings`, `models.NotificationDeliveryLog`, and update `models.OTP` for phone verification.
- [x] 1.2 Run auto-migration and verify database tables in `auroka-db` container.

## 2. APIWA WhatsApp Client & Notification Dispatcher Service
- [x] 2.1 Implement `utils.WhatsAppClient` to connect to local APIWA gateway at `http://127.0.0.1:3100`.
- [x] 2.2 Implement `services.NotificationDispatcher` handling In-App, WhatsApp, and Email routing with preference checks and anti-duplicate rate limits.
- [x] 2.3 Implement notification controllers and register routes in `routes.go`:
  - `GET /api/v1/notifications`, `GET /api/v1/notifications/unread-count`, `PATCH /api/v1/notifications/:id/read`, `POST /api/v1/notifications/read-all`, `DELETE /api/v1/notifications/:id`, `DELETE /api/v1/notifications/clear-read`
  - `GET /api/v1/notifications/settings`, `PUT /api/v1/notifications/settings`
  - `POST /api/v1/notifications/verify-phone/request`, `POST /api/v1/notifications/verify-phone/confirm`
- [x] 2.4 Implement Go background worker for recurring bill due scanning (H-3, H-1, Hari H) and overbudget alerts.

## 3. Frontend In-App Center & Header Integration
- [x] 3.1 Create Clean Architecture entities, repository (`INotificationRepository`), and use cases (`GetNotifications`, `MarkNotificationRead`, `GetUnreadCount`).
- [x] 3.2 Update `AppHeader.tsx` to display real-time unread notification count badge.
- [x] 3.3 Build rich `/notifications` page with Category filter tabs, search, empty states, and quick-action buttons.

## 4. Frontend Settings & WhatsApp Verification Modal
- [x] 4.1 In `/settings` (Notification Tab), implement channel toggles (WhatsApp, Email, In-App) and alert type preferences.
- [x] 4.2 Enforce WhatsApp gatekeeper: lock toggle when unverified, provide "Verifikasi WhatsApp" modal with OTP input, timer, and success badge.
- [x] 4.3 Connect form submissions to real API endpoints.

## 5. Testing, Verification & Production Build
- [x] 5.1 Run backend API tests with curl & unit tests.
- [x] 5.2 Run frontend unit tests (`npm run test`).
- [x] 5.3 Run production build (`npm run build`) and restart PM2 `auroka` service.
