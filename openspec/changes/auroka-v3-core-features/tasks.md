# Tasks: Auroka v3.0 Core Features & Expansion

## 1. User Profile & Account Settings Persistence

- [ ] 1.1 Update Golang `models.User` with `phone`, `bio`, `avatar_url`, `currency_preference`, `language_preference` and run auto-migration. Verify schema with `docker exec auroka-db psql -U auroka_user -d auroka_db -c "\d users"`.
- [ ] 1.2 Implement `PUT /api/v1/auth/profile` and `PUT /api/v1/auth/password` in `auth_controller.go` and register in `routes.go`. Verify endpoints with curl.
- [ ] 1.3 Update frontend `authApi.ts`, `useFinance.ts`, and wire `/profile` & `/settings` forms to real API. Verify profile save updates state and database.

## 2. Password Recovery via Email OTP

- [ ] 2.1 Implement `otps` model in Go backend for reset password purpose. Verify table creation.
- [ ] 2.2 Implement `POST /api/v1/auth/forgot-password` and `POST /api/v1/auth/reset-password` sending 6-digit OTPs via Resend API from `Auroka <no-reply@auroka.kuloalan.online>`. Verify with backend test/curl.
- [ ] 2.3 Build frontend `/forgot-password` and `/reset-password` pages with direct paste OTP input and login redirection. Verify flow in browser/test.

## 3. Inter-Wallet Transfer Engine

- [ ] 3.1 Implement atomic transfer in Go backend (`POST /api/v1/transactions/transfer`) creating double-entry `TRANSFER_OUT` and `TRANSFER_IN` with optional admin fee. Verify atomic balance update.
- [ ] 3.2 Update Clean Architecture repository, use case `TransferFunds`, and integrate transfer selector in frontend `AddTransactionModal.tsx`. Verify transfer records in wallet view.

## 4. Bill & Subscription Tracker

- [ ] 4.1 Create `models.Bill` in Go backend and implement CRUD + `POST /api/v1/bills/:id/pay` controllers. Verify endpoints with curl.
- [ ] 4.2 Build frontend Clean Architecture `BillRepository`, `useBills` hook, and `/bills` page with due date countdown badges and pay button. Verify UI rendering and payment action.

## 5. Friend Debt Settlement Tracker

- [ ] 5.1 Implement `GET /api/v1/debts` and `POST /api/v1/debts/:id/settle` in Go backend. Verify query and settlement update with curl.
- [ ] 5.2 Build frontend debts tracker widget or page with "Tandai Lunas" action. Verify status updates to settled.

## 6. PWA Mobile-First Configuration

- [ ] 6.1 Create `public/manifest.webmanifest`, app icons, and meta tags in `layout.tsx`. Verify manifest resolves HTTP 200.
- [ ] 6.2 Configure Service Worker registration for offline asset caching. Verify build and service worker file.

## 7. Verification & Deployment

- [ ] 7.1 Run full frontend test suite (`npm run test`) and verify 100% pass rate.
- [ ] 7.2 Run production build (`npm run build`) and restart PM2 `auroka` service. Verify 0 build errors and live status.
