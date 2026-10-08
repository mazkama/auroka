# Design: Auroka v3.0 Core Features & Full Recommendations

## Context
See `proposal.md` for motivation and background. Auroka uses Next.js 16 (Turbopack, TypeScript, Tailwind CSS) for the frontend adhering to 4-Tier Clean Architecture, and Golang 1.22+ with Gin and GORM for the backend. PostgreSQL runs in Docker container `auroka-db`, and transactional emails are sent via Resend API from `Auroka <no-reply@auroka.kuloalan.online>`.

## Goals / Non-Goals

**Goals:**
- Implement real backend persistence for user profile (phone, bio, avatar, preferences) and connect `/profile` & `/settings`.
- Implement full password recovery workflow: `POST /api/v1/auth/forgot-password` and `POST /api/v1/auth/reset-password` with email OTP verification and frontend pages `/forgot-password` and `/reset-password` (with direct paste UX).
- Implement atomic inter-wallet transfer (`POST /api/v1/transactions/transfer`) in Go backend and frontend transfer transaction UI.
- Implement Bill & Subscription Tracker (`/api/v1/bills`) backend model, CRUD API, payment action, and frontend `/bills` page.
- Implement Friend Order Debt Settlement Tracker (`/api/v1/debts`) and frontend management.
- Configure PWA manifest and service worker.

**Non-Goals:**
- External bank scraping or open banking APIs (not in PRD v3 scope).
- Live payment gateway processing (settlements are internal bookkeeping actions).

## Decisions

### 1. Database Schema Extensions in Golang (GORM AutoMigrate)
- **User Model**: Add `Phone string`, `Bio string`, `AvatarURL string`, `CurrencyPreference string`, `LanguagePreference string`.
- **OTP Model**: Add `otps` table with `email`, `code_hash`, `purpose` (`VERIFICATION`, `RESET_PASSWORD`), `expires_at`, `is_used`.
- **Bill Model**: Create `bills` table: `user_id`, `name`, `category`, `amount`, `due_day`, `cycle` (`MONTHLY`, `YEARLY`), `wallet_id`, `status` (`PENDING`, `PAID`), `last_paid_at`.
- **Transaction Item Model**: Add `is_friend_order` (bool), `friend_name` (string), `is_settled` (bool), `settled_at` (time).

*Alternative considered:* Separate table for user preferences vs direct columns on User table. Chosen direct columns for simplicity and fast read/write.

### 2. Atomic Inter-Wallet Transfer in Ledger Engine
- Use `db.Transaction(func(tx *gorm.DB) error { ... })` in Golang.
- Create source transaction entry: `type = 'OUT'` or `'TRANSFER_OUT'` with negative impact on source wallet.
- Create destination transaction entry: `type = 'IN'` or `'TRANSFER_IN'` with positive impact on target wallet.
- If admin fee > 0, create fee transaction entry: `type = 'OUT'`, category `'Biaya Admin'`.

*Rationale:* Guarantees consistency and ensures ledger balance calculations remain 100% accurate.

### 3. Password Reset OTP Security
- Rate limit reset requests (max 3 requests per 10 minutes per email).
- Hash OTP before saving or store with secure random generation.
- Expiration set to 10 minutes.
- When password is reset, mark OTP `is_used = true` and update password with `bcrypt.GenerateFromPassword`.

### 4. Frontend Clean Architecture Integration
- Repositories: `AuthRepository`, `WalletRepository`, `TransactionRepository`, `BillRepository`, `DebtRepository`.
- Use Cases: `UpdateProfile`, `ChangePassword`, `RequestPasswordReset`, `ResetPassword`, `TransferFunds`, `GetBills`, `CreateBill`, `PayBill`, `GetFriendDebts`, `SettleFriendDebt`.
- Custom Hooks: Extend `useFinance.ts` or add `useBills.ts` and `useDebts.ts`.

## Risks / Trade-offs

- **[Risk: GORM Migration on existing production DB]** → GORM `AutoMigrate` adds missing columns and tables without dropping existing data.
- **[Risk: OTP delivery delay]** → Resend API delivers in ~1s; frontend provides 60s resend cooldown.
- **[Risk: Service worker caching stale API responses]** → Service worker configured to bypass network requests for `/api/v1/*`.
