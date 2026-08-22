# 🏆 Auroka - Web Manajemen Keuangan

> **Auroka**: *Pahami Uang, Bangun Masa Depan (From Understanding to Prosperity)*  
> *Auroka (Aurum / Emas)* — Membantu pengguna memahami uang, membangun kebiasaan finansial yang sehat, dan bertumbuh menuju kemakmuran seperti emas yang semakin bernilai.

Aplikasi Web Manajemen Keuangan modern berbasis **Next.js (App Router, TypeScript, Tailwind CSS)** yang dibangun menggunakan **Clean Architecture** dan **The Ledger System**. Terisolasi penuh dari UI sehingga dapat dijalankan menggunakan **Mock Data** dan siap diintegrasikan secara instan ketika Backend REST API (Golang / PostgreSQL) siap.

---

## 📐 Arsitektur & Filosofi Sistem

### 1. Clean Architecture (4-Tier Decoupling)
Sistem ini memisahkan aturan bisnis inti, logika aplikasi, infrastruktur data, dan antarmuka pengguna ke dalam 4 lapisan independen:

- **Domain Layer (`src/domain/`)**: Berisi entitas bisnis murni (`Transaction`, `Wallet`, `Budget`, `FinancialSummary`) dan interface abstrak repositori (`ITransactionRepository`, `IWalletRepository`, `IBudgetRepository`).
- **Application Layer (`src/application/`)**: Berisi Use Cases logika bisnis murni seperti `GetFinancialSummary`, `GetTransactions`, `GetWallets`, `GetBudgets`, dan `CreateTransaction`.
- **Infrastructure Layer (`src/infrastructure/`)**: Tempat adapter data berada, memuat implementasi **Mock Data** (`MockTransactionRepository`, `MockWalletRepository`) serta **Dependency Injection Container** (`container.ts`).
- **Presentation Layer (`src/presentation/` & `src/app/`)**: Antarmuka React / Next.js, Custom Hooks (`useFinance`), utility formatters (Rupiah/IDR & Tanggal), dan komponen UI dashboard.

### 2. Standarisasi Saldo Manual (The Ledger System)
Mengikuti aturan mutlak pembukuan keuangan terpusat:
- **Saldo (Balance) adalah hasil kalkulasi (`SUM`)** dari seluruh transaksi masuk (`IN`, `INITIAL_BALANCE`) dikurangi transaksi keluar (`OUT`).
- Saldo awal diawali dengan transaksi tipe `INITIAL_BALANCE` atau `ADJUSTMENT`.
- Memberikan **jejak audit sempurna** dan mencegah anomali lonjakan data historis.

### 3. Granularitas Header-Detail & Fitur Spesial
- **Granular Header-Detail ERD**: Setiap transaksi makro memiliki rincian item (`TransactionItem`).
- **Opsi "Nitip Teman" (`is_friend_order`)**: Mencatat pembelian item yang dititip teman beserta nama teman (`friendName`).
- **Worthiness Rating (1-5 ⭐)**: Penilaian tingkat kebermanfaatan/kepuasan dari setiap item pengeluaran.
- **Arsitektur Multi-Tenant**: Seluruh entitas terikat dengan `userId` untuk pengamanan isolasi data per pengguna.

---

## 📂 Struktur Direktori Proyek (File Tree)

```text
auroka-frontend/
├── src/
│   ├── domain/                         # Layer 1: Entitas & Interface Kontrak Repositori
│   │   ├── entities/
│   │   │   ├── transaction.ts          # Entity Transaction & TransactionItem (Header-Detail)
│   │   │   ├── wallet.ts               # Entity Wallet & AccountType (BANK, E_WALLET, CRYPTO, CASH)
│   │   │   ├── budget.ts               # Entity Budget & Alokasi Anggaran
│   │   │   └── summary.ts              # Entity Ringkasan Keuangan (Balance, Cash Flow, Savings Rate)
│   │   └── repositories/
│   │       ├── ITransactionRepository.ts
│   │       ├── IWalletRepository.ts
│   │       └── IBudgetRepository.ts
│   │
│   ├── application/                    # Layer 2: Business Use Cases
│   │   └── usecases/
│   │       ├── GetFinancialSummary.ts
│   │       ├── GetTransactions.ts
│   │       ├── GetWallets.ts
│   │       ├── GetBudgets.ts
│   │       └── CreateTransaction.ts
│   │
│   ├── infrastructure/                 # Layer 3: Data Adapter & Dependency Injection
│   │   ├── mock/
│   │   │   ├── mockData.ts             # Realistic IDR Mock Data, Nitip Teman & Rating
│   │   │   ├── MockTransactionRepository.ts
│   │   │   ├── MockWalletRepository.ts
│   │   │   └── MockBudgetRepository.ts
│   │   └── di/
│   │       └── container.ts            # Dependency Container (Toggle Switcher Mock vs API)
│   │
│   └── presentation/                   # Layer 4: Presentation & UI Components
│       ├── hooks/
│       │   └── useFinance.ts           # Custom React Hook penghubung UI ke Use Cases
│       ├── utils/
│       │   └── formatters.ts           # Utility Format Rupiah (IDR) & Tanggal Indonesia
│       └── components/
│           ├── layout/
│           │   ├── Header.tsx          # Branding Auroka, Logo, Slogan & Quick Actions
│           │   └── Sidebar.tsx         # Navigasi & Auroka Brand Story Card
│           ├── ui/
│           │   └── StatCard.tsx        # Widget Statistik Ringkasan Saldo & Cash Flow
│           └── features/
│               ├── DashboardOverview.tsx
│               ├── WalletCards.tsx      # Kartu Rekening BCA, Mandiri, GoPay, Binance
│               ├── RecentTransactions.tsx # Tabel Histori Ledger, Nitip Teman & Rating
│               ├── BudgetProgress.tsx   # Progress bar & indikator peringatan anggaran
│               └── AddTransactionModal.tsx # Form catat transaksi & Opsi Nitip Teman
│
├── .env.local                          # Konfigurasi Environment Variable (NEXT_PUBLIC_USE_MOCK=true)
├── package.json
├── tsconfig.json
└── README.md
```

---

## ⚡ Cara Menjalankan Proyek

### 1. Prasyarat System
Pastikan perangkat Anda telah terpasang:
- **Node.js**: v18.x / v20.x atau lebih baru
- **npm**: v9.x / v10.x atau lebih baru

### 2. Instalasi Dependensi
Jalankan perintah berikut pada terminal di direktori proyek:

```bash
npm install
```

### 3. Menjalankan Server Pengembangan (Dev Mode)
Jalankan perintah berikut untuk mengaktifkan dev server:

```bash
npm run dev
```

Buka browser Anda dan akses:
👉 **`http://localhost:3000`**

### 4. Konfigurasi Switching ke Backend API (Masa Depan)
Secara bawaan, aplikasi membaca file `.env.local`:

```env
NEXT_PUBLIC_USE_MOCK=true
```

Ketika backend API (Golang / PostgreSQL) sudah siap:
1. Buat repositori API (`ApiTransactionRepository`, `ApiWalletRepository`) di `src/infrastructure/api/`.
2. Daftarkan repositori API pada `src/infrastructure/di/container.ts`.
3. Ubah nilai `NEXT_PUBLIC_USE_MOCK=false` pada `.env.local`.

---

## 🛠️ Testing & Verification Commands

- **Validasi Build Production**:
  ```bash
  npm run build
  ```
- **Validasi Linting & Type Checking**:
  ```bash
  npm run lint
  ```

---

## 🎨 Branding & Brand Story

- **Nama Brand**: **Auroka**
- **Filosofi**: *Aurum (Emas)* — Perjalanan menuju nilai, pemahaman, dan kemakmuran finansial.
- **Slogan**: *"Pahami Uang, Bangun Masa Depan"*

---
Developed for **Auroka Projects 2026**.
