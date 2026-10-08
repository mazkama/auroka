# Proposal: Auroka v3.0 Core Features & Account Expansion

## Why
Auroka has established a verified Realtime Ledger engine, clean landing page, and transactional email verification system. However, several critical features from PRD v3.0 remain unintegrated or mocked in the frontend:
1. Profile and user settings are not persisted to the backend database.
2. Users who forget their password cannot recover their account via email OTP.
3. Inter-wallet transfers (e.g. Bank to E-Wallet) cannot be recorded in a single atomic transaction.
4. Recurring bills and subscriptions (WiFi, PLN, Netflix, Rent) lack automated tracking and due date reminders.
5. Friend order debts (`isFriendOrder`) lack a centralized settlement tracker.
6. Mobile web users lack an installable Progressive Web App (PWA) experience.

Now that email delivery via Resend API (`no-reply@auroka.kuloalan.online`) is live and stable, we can implement complete end-to-end backend and frontend flows.

## What Changes
- **User Profile & Settings API**: Add `phone`, `bio`, `avatar_url`, and preferences to PostgreSQL `users` table, add `PUT /api/v1/auth/profile` and `PUT /api/v1/auth/password` endpoints, and connect `/profile` & `/settings` forms with real persistence.
- **Forgot Password & OTP Reset**: Implement `POST /api/v1/auth/forgot-password` and `POST /api/v1/auth/reset-password` in Go backend, sending 6-digit OTPs via Resend API, and build frontend pages `/forgot-password` and `/reset-password` with direct paste support.
- **Inter-Wallet Transfer Engine**: Add `POST /api/v1/transactions/transfer` endpoint creating atomic debit (`TRANSFER_OUT`) and credit (`TRANSFER_IN`) ledger entries with optional admin fee recording, and integrate transfer mode in frontend transaction modal.
- **Bill & Subscription Tracker**: Add `bills` database table and backend CRUD endpoints (`/api/v1/bills`), create Clean Architecture repository/use-cases, and add `/bills` route with due date indicators and one-click "Pay Bill" action.
- **Split Bill & Debt Settlement**: Build `/debts` page or dashboard widget summarizing unpaid friend orders (`isFriendOrder = true`) with a 1-click "Mark as Settled" action.
- **PWA Configuration**: Add `manifest.webmanifest`, app icons, and offline service worker configuration for native-like mobile installation.

## Capabilities

### New Capabilities
- `user-profile-management`: Persistent user profile attributes (bio, phone, avatar) and preference settings.
- `password-recovery`: Email OTP-based forgot password and password reset workflow.
- `inter-wallet-transfer`: Atomic ledger double-entry transfers between distinct user wallets.
- `bill-subscription-tracker`: Recurring obligations management with billing cycle and automated payment transaction generation.
- `friend-debt-settlement`: Aggregation and settlement tracking for items flagged as friend orders.
- `pwa-mobile-readiness`: Web app manifest and PWA installation support.

### Modified Capabilities
<!-- None: Initial baseline spec suite creation -->

## Impact
- **Backend**: New Go controllers, models (`Bill`, updated `User`, `OTP`), database migrations, and routes.
- **Frontend**: Clean Architecture domain/application/infrastructure updates, new routes (`/forgot-password`, `/reset-password`, `/bills`), and connected forms.
- **Dependencies**: No external paid libraries required; uses existing Go Gin, GORM, Resend API, and Next.js 16.
