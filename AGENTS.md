<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# 🚀 Auroka Project Progress & Agent Continuation Guide

## 📌 Project Overview & Architecture
- **Framework**: Next.js 16.3.2 (Turbopack, App Router, TypeScript, Tailwind CSS).
- **Design System**: Stitch Reference System (`#004ac6` primary blue, `#f8f9ff` surface, clean white `#ffffff` card backgrounds).
- **Core Architecture**: 4-Tier Clean Architecture (`Domain`, `Application`, `Infrastructure`, `Presentation`).
- **Ledger System**: Balance is dynamically calculated (`SUM`) from Debit/Credit transactions.

---

## 🛠️ Summary of Latest Completed Features

### 1. Landing Page & Global Navigation (`/`)
- **Navbar Dynamic Scroll Spy**: `Navbar.tsx` dynamically tracks scroll position to highlight the active menu pill (`Beranda`, `Preview Dashboard`, `Keunggulan`, `Filosofi Auroka`).
- **Filosofi Auroka Section**: Dedicated `#about` section with gold/aurum accents (`#784b00`) reflecting the philosophy: *"Terinspirasi dari Aurum (Emas) - Pahami Uang, Bangun Masa Depan"*.
- **Authentication Routes**: Added quick CTA buttons connecting to `/login` and `/register`.

### 2. Dashboard Overhaul (`/dashboard`)
- **Unified Clean Theme**: All dashboard components (`WalletCards`, `RecentTransactions`, `BudgetProgress`) use standard white card design (`bg-white border-[#e2e8f0]`).
- **CashFlow Visualization**: Added `CashFlowChart.tsx` powered by `recharts`.
- **Liquid Balance Card**: Enriched with 2-layer harmonized SVG wave motifs (taller on the right, semi-transparent), `text-5xl` typography, and glassmorphic badge.

### 3. Wallet Management CRUD (`/wallets`)
- **Full Clean Architecture CRUD**:
  - `Domain`: `IWalletRepository.ts` updated with `createWallet`, `updateWallet`, `deleteWallet`.
  - `Application`: Created Use Cases (`CreateWallet.ts`, `UpdateWallet.ts`, `DeleteWallet.ts`).
  - `Infrastructure`: Implemented in `MockWalletRepository.ts` & registered in `di/container.ts`.
  - `Presentation`: `useFinance.ts` hook updated with `addWallet`, `editWallet`, `removeWallet`.
- **Interactive UI**:
  - `WalletModal.tsx`: Supports Account Category selection (`BANK`, `E_WALLET`, `CRYPTO`, `CASH`), initial balance, account number, and color picker.
  - `WalletCards.tsx`: Displays Edit ✏️ and Delete 🗑️ action buttons on card hover.

### 4. Mobile Bottom Navigation (`Sidebar.tsx` & `AppLayout.tsx`)
- **5-Item Bottom Nav Bar**: Fixed mobile bottom navigation bar (`lg:hidden fixed bottom-0`) with 5 menu slots including a prominent center **Floating Action Button (+)** (`Plus` icon with gradient `from-[#004ac6] to-[#2563eb]`, white ring, and elevated floating placement) triggering `onOpenAddModal`.
- **Layout Spacing**: Updated `AppLayout` with `pb-20` on mobile view so content is never overlapped.
- **Unit Testing**: Updated `Sidebar.test.tsx` verifying the 5-item mobile bottom navigation bar and central floating Add button interaction.

### 5. Global Header Redesign & Unified Search Bar (`AppHeader.tsx`)
- **Title Text Removal**: Removed hardcoded page title `h1` and subtitle `p` across all app routes for a cleaner, modern look.
- **Integrated Global Search**: Added a prominent, responsive search bar in the main header area equipped with a search icon, quick clear button `(X)`, shortcut indicator `⌘K`, and smooth focus states.

---

## ✅ Quality & Verification Status
- `npm run test`: **Passed (3/3 test files, 6/6 tests)**
- `npm run build`: **Compiled successfully with 0 errors (10/10 static pages generated)**

---

## 🧭 Instructions for Next Agent/Developer
When continuing this codebase on any platform:
1. All business logic must remain decoupled in `src/application/usecases/`.
2. UI components must use `useFinance` hook to interact with financial data.
3. To switch from Mock Data to real REST API backend, update `src/infrastructure/di/container.ts` by configuring API Repositories.

