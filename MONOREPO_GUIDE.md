# 🏰 Auroka Monorepo Architecture & Backend Setup Guide

Dokumen panduan ini menyajikan standar penamaan repositori GitHub, struktur direktori **Monorepo (Frontend + Backend)**, serta langkah-langkah migrasi dan pengintegrasian backend untuk kemudahan pengembangan selanjutnya.

---

## 📌 1. Rekomendasi Penamaan & Struktur Repositori GitHub

### 🏷️ Nama Repositori GitHub
> **Rekomendasi Utama**: `auroka` (atau `auroka-app`)
> 
> *Alasan*: Nama yang ringkas, profesional, dan mencakup seluruh ekosistem aplikasi (Frontend, Backend REST API, Database, dan Docker Config).

### 📁 Struktur Folder Monorepo yang Disarankan:
```text
auroka/                                # Root Repository GitHub
├── auroka-frontend/                   # Next.js 16.3.2 App Router (Clean Architecture)
│   ├── src/
│   │   ├── domain/                    # Entities, Value Objects & Repository Interfaces
│   │   ├── application/               # Business Logic Use Cases (CreateWallet, GetBudgets, dll)
│   │   ├── infrastructure/            # Repositories (Switchable: Mock & Real API)
│   │   │   ├── di/container.ts        # Dependency Injection Container
│   │   │   ├── mock/                  # Standalone Mock Repositories
│   │   │   └── api/                   # REST API Repositories (Axios / Fetch)
│   │   └── presentation/              # UI Components, Hooks, Modals & Recharts
│   ├── public/                        # Static Assets & Brand Favicon Logo
│   ├── package.json
│   └── README.md
│
├── auroka-backend/                    # REST API Backend (NestJS / Express / Go / Laravel)
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/                  # Authentication (JWT / Multi-Tenant)
│   │   │   ├── wallets/               # Wallet CRUD & Balance Calculator
│   │   │   ├── transactions/          # Transaction Header-Detail (Debit/Kredit Ledger)
│   │   │   └── budgets/               # Monthly Budget Limits & Threshold Alert
│   │   └── database/                  # Migrations & ORM Models (Prisma / TypeORM / GORM)
│   ├── package.json
│   └── README.md
│
├── docker-compose.yml                 # Orchestration Lingkungan Dev (PostgreSQL + FE + BE)
├── .gitignore                         # Master Git Ignore
├── README.md                          # Panduan Utama Project
└── AGENTS.md                          # Rules & Status Pengembangan AI Agent
```

---

## 🛠️ 2. Langkah-Langkah Migrasi Ke Monorepo (Step-by-Step)

> [!NOTE]
> Ikuti urutan langkah di bawah ini ketika Anda siap menggabungkan repository ke struktur monorepo tunggal di GitHub.

### Langkah 1: Buat Folder Root & Inisialisasi Git
```bash
# 1. Buat folder root monorepo di lokal Anda
mkdir auroka
cd auroka

# 2. Inisialisasi Git pada folder root
git init
```

### Langkah 2: Pindahkan Folder Frontend Saat Ini
```bash
# Pindahkan folder project frontend ke dalam root monorepo
mv "/path/to/auroka-frontend" ./auroka-frontend
```

### Langkah 3: Inisialisasi Project Backend (`auroka-backend`)
```bash
# Contoh inisialisasi backend menggunakan NestJS atau Node.js Express:
npx @nestjs/cli new auroka-backend
# ATAU untuk Express/TypeScript:
mkdir auroka-backend && cd auroka-backend && npm init -y
```

### Langkah 4: Buat Root `package.json` (NPM Workspaces)
Buat file `package.json` di direktori teratas `auroka/`:
```json
{
  "name": "auroka-monorepo",
  "version": "1.0.0",
  "private": true,
  "workspaces": [
    "auroka-frontend",
    "auroka-backend"
  ],
  "scripts": {
    "dev:fe": "npm --prefix auroka-frontend run dev",
    "dev:be": "npm --prefix auroka-backend run dev",
    "build:fe": "npm --prefix auroka-frontend run build",
    "build:be": "npm --prefix auroka-backend run build",
    "test": "npm --prefix auroka-frontend test && npm --prefix auroka-backend test"
  }
}
```

### Langkah 5: Buat Master `docker-compose.yml` (Opsional)
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: auroka-db
    environment:
      POSTGRES_USER: auroka_user
      POSTGRES_PASSWORD: auroka_password
      POSTGRES_DB: auroka_ledger
    ports:
      - "5432:5432"

  backend:
    build: ./auroka-backend
    container_name: auroka-api
    ports:
      - "4000:4000"
    environment:
      DATABASE_URL: "postgresql://auroka_user:auroka_password@postgres:5432/auroka_ledger"
    depends_on:
      - postgres

  frontend:
    build: ./auroka-frontend
    container_name: auroka-web
    ports:
      - "3000:3000"
    environment:
      NEXT_PUBLIC_USE_MOCK: "false"
      NEXT_PUBLIC_API_URL: "http://localhost:4000"
    depends_on:
      - backend
```

---

## 🔌 3. Menghubungkan Frontend Clean Architecture ke Backend REST API

> [!TIP]
> Frontend Auroka telah dirancang menggunakan **Clean Architecture (4-Tier)**. Pengembang backend hanya perlu membuat **`ApiRepositories`** tanpa merubah kode UI maupun logika bisnis!

### Cara Mengaktifkan Real Backend di Frontend:

1. Buat API Repository di `auroka-frontend/src/infrastructure/api/`:
   - `ApiWalletRepository.ts`
   - `ApiTransactionRepository.ts`
   - `ApiBudgetRepository.ts`

2. Buka `auroka-frontend/src/infrastructure/di/container.ts` dan ubah pendaftaran repositori:
```typescript
private initRepositories() {
  const isMock = process.env.NEXT_PUBLIC_USE_MOCK !== 'false';

  if (isMock) {
    this.transactionRepository = new MockTransactionRepository();
    this.walletRepository = new MockWalletRepository();
    this.budgetRepository = new MockBudgetRepository();
  } else {
    // Mode Production REST API Real Backend:
    this.transactionRepository = new ApiTransactionRepository();
    this.walletRepository = new ApiWalletRepository();
    this.budgetRepository = new ApiBudgetRepository();
  }
}
```

3. Pada `.env.local`:
```env
NEXT_PUBLIC_USE_MOCK=false
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
```

---

## 📜 Summary & Cheat Sheet Pengembang

| Komponen | Teknologi | Lokasi Folder | Catatan |
|---|---|---|---|
| **Frontend Web** | Next.js 16 (Turbopack, App Router) | `auroka-frontend/` | Clean Architecture, Tailwind CSS, Recharts |
| **Backend REST API** | NestJS / Express / Go | `auroka-backend/` | RESTful API, JWT Auth, Ledger Calculator |
| **Database** | PostgreSQL | Docker `5432` | Schema Header-Detail ERD |
| **DI Container** | TypeScript Class | `src/infrastructure/di/container.ts` | Saklar instan Mock Data $\leftrightarrow$ Real API |

---
*Dokumen ini dibuat secara otomatis untuk menjamin kelancaran kolaborasi dan siklus pengembangan Auroka selanjutnya.*
