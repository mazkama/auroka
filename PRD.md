# 📄 Product Requirement Document (PRD) v3.1
# Auroka - Enterprise Smart Notification & Multi-Channel Alert Engine (APIWA Integration)

**Versi:** 3.1.0  
**Tanggal Update:** 2026-10-05  
**Status:** Approved for Implementation / High Priority  
**Tech Stack:** 
- **Frontend:** Next.js 16 (React 19, Turbopack, Tailwind CSS, Lucide Icons, Clean Architecture 4-Tier)
- **Backend:** Golang 1.22+ (Gin Gonic, GORM ORM, Cron Scheduler / Asynq / Go Routine Worker)
- **Database:** PostgreSQL 16 (Docker container `auroka-db`)
- **Notification Channels:** APIWA WhatsApp Gateway (`http://127.0.0.1:3100`), Resend Transactional Email API, In-App Notification Center, PWA Web Push
- **Domain Live:** `https://auroka.kuloalan.online`

---

## 📌 1. Executive Summary & Problem Statement

### A. Latar Belakang & Problem Statement
Meskipun fitur inti pencatatan, mutasi dompet, tagihan, dan pelunasan titipan teman telah aktif di Auroka v3.0, **pengguna masih sering lupa atau tidak menyadari kondisi keuangannya** (*low financial awareness*) karena:
1. **Lupa Bayar Tagihan (Overdue Bills):** Tagihan langganan (WiFi, kos, PLN, asuransi) terlambat dibayar karena pengguna tidak selalu membuka aplikasi setiap hari.
2. **Budget Jebol (Overspending Alert):** Pengguna baru sadar kehabisan uang di akhir bulan tanpa peringatan dini ketika anggaran kategori (misal: Makan / Hiburan) telah mencapai 80% atau 100%.
3. **Piutang Titipan Teman Terlupakan (Debt Reminders):** Tagihan belanja titipan teman sering tidak ditagih karena tidak ada rekap berkala.
4. **Saldo Dompet Kritis (Low Balance Warning):** Saldo rekening/e-wallet menipis mendekati batas minimum.
5. **Keterbatasan Saluran Notifikasi:** Notifikasi in-app saja tidak cukup menjangkau pengguna saat sedang *offline* atau tidak membuka browser. Diperlukan saluran langsung ke smartphone: **WhatsApp (via APIWA)** dan **Email**.

### B. Visi Solusi
Membangun **Auroka Smart Notification & Multi-Channel Alert Engine** yang proaktif memberikan peringatan otomatis, ringkasan berkala, dan pengamanan akun secara instan melalui **In-App Notification Center**, **WhatsApp (APIWA Gateway)**, dan **Email (Resend API)**.

---

## 👥 2. User Persona & Use Cases

| Persona | Skenario Masalah | Solusi Auroka Alert Engine |
|---|---|---|
| **Pekerja / Anak Kos** | Lupa bayar tagihan WiFi dan listrik sehingga terkena denda atau pemutusan. | **H-3 & H-1 Bill Due Reminder**: WhatsApp reminder otomatis berisi nama tagihan, nominal, & link bayar 1-klik. |
| **Budget-Conscious User** | Kategori nongkrong/ngopi sudah overbudget 110% di pertengahan bulan. | **Real-time Overspending Alert**: Notifikasi instan saat transaksi baru membuat kategori melewati 80% / 100% budget. |
| **Pemberi Talangan Teman** | Sering lupa menagih belanjaan barang titipan teman yang sudah lewat berminggu-minggu. | **Weekly Debt Summary**: Rekap otomatis daftar piutang teman yang belum lunas. |
| **Security Concerned User** | Ingin memastikan login dari perangkat baru atau reset password dilakukan oleh dirinya sendiri. | **Multi-Channel OTP (WA + Email)** & **Security Login Alert**. |

---

## 🏗️ 3. Arsitektur Sistem & Alur Notifikasi (APIWA Engine)

```
┌────────────────────────────────────────────────────────────────────────┐
│                        AUROKA CORE SYSTEM                              │
│                                                                        │
│  ┌──────────────────────┐             ┌─────────────────────────────┐  │
│  │ Transaction / Budget │             │ Scheduled Cron Worker (Go)  │  │
│  │ Event Trigger        │             │ - Daily Bill Due Check (08:00)││
│  │ (Real-time Mutasi)   │             │ - Weekly Financial Digest   │  │
│  └──────────┬───────────┘             └──────────────┬──────────────┘  │
└─────────────┼────────────────────────────────────────┼─────────────────┘
              │                                        │
              ▼                                        ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   NOTIFICATION DISPATCHER SERVICE                      │
│   (Evaluasi Preferensi Pengguna: In-App, WhatsApp, Email, Push)        │
└───────┬──────────────────────┬──────────────────────┬──────────────────┘
        │                      │                      │
        ▼                      ▼                      ▼
┌───────────────┐      ┌───────────────┐      ┌───────────────┐
│ In-App Center │      │ APIWA Gateway │      │  Resend API   │
│ (Postgres DB) │      │ (Port 3100)   │      │  (Email Svc)  │
│ /notifications│      │ WhatsApp OTP  │      │ Transactional │
│ Realtime Badge│      │ & Bill Alerts │      │ Security Mail │
└───────────────┘      └───────────────┘      └───────────────┘
```

---

## 📋 4. Spesifikasi Fitur Notifikasi & Peringatan

### A. 🔔 Kategori & Pemicu Notifikasi (Trigger Matrix)

| Kategori | Nama Notifikasi | Trigger / Pemicu | Saluran Default | Level Urgensi |
|---|---|---|---|---|
| **BILLS** | **Peringatan Jatuh Tempo Tagihan** | H-3, H-1, & Hari-H tanggal jatuh tempo tagihan aktif. | WhatsApp + In-App | 🔴 `DANGER` / 🟡 `WARNING` |
| **BUDGET** | **Peringatan Anggaran Menipis (80%)** | Pengeluaran kategori mencapai $\ge 80\%$ dari batas budget. | In-App + WhatsApp | 🟡 `WARNING` |
| **BUDGET** | **Peringatan Anggaran Jebol (100%+)** | Pengeluaran kategori melebihi $100\%$ limit budget bulanan. | WhatsApp + In-App | 🔴 `DANGER` |
| **WALLET** | **Saldo Dompet Kritis (Low Balance)** | Saldo dompet turun di bawah threshold (misal: $<$ Rp 50.000). | In-App | 🟡 `WARNING` |
| **DEBTS** | **Pengingat Piutang Teman (Split Bill)** | Belanja titipan teman belum lunas setelah $> 7$ hari. | In-App + WhatsApp Digest | 🔵 `INFO` |
| **SECURITY** | **OTP Reset Sandi / Registrasi** | Permintaan OTP via nomor WhatsApp / Email. | WhatsApp / Email | 🔴 `DANGER` |
| **SECURITY** | **Login Perangkat Baru** | Berhasil login dari IP / User-Agent baru. | Email + In-App | 🟡 `WARNING` |
| **DIGEST** | **Laporan Keuangan Mingguan (Sunday)** | Setiap hari Minggu jam 19:00 WIB (Arus Kas & Saving Rate). | WhatsApp + In-App | 🟢 `SUCCESS` |

---

### B. 📲 Integrasi APIWA WhatsApp Gateway

1. **Konfigurasi Gateway Backend Go:**
   - Host: `http://127.0.0.1:3100` (Local PM2 service `apiwa`)
   - Endpoint: `POST /api/v1/:sessionId/send-message`
   - Payload:
     ```json
     {
       "receiver": "628xxxxxxxxxx",
       "message": "Halo Mas Alan! ⚠️ Peringatan Tagihan Auroka..."
     }
     ```
2. **Template Pesan WhatsApp:**
   - **Template 1: Tagihan Jatuh Tempo (Bills)**
     ```
     🔔 *Peringatan Tagihan Auroka*
     Halo {{name}}, tagihan rutin Anda akan segera jatuh tempo:

     📋 *Tagihan:* {{bill_name}}
     💰 *Nominal:* Rp {{amount}}
     📅 *Jatuh Tempo:* {{due_date}} ({{days_left}} hari lagi)
     💳 *Dompet:* {{wallet_name}}

     👉 Bayar sekarang di: https://auroka.kuloalan.online/bills
     ```
   - **Template 2: Anggaran Jebol (Overbudget)**
     ```
     ⚠️ *Peringatan Anggaran Auroka*
     Hai {{name}}, pengeluaran kategori *{{category_name}}* bulan ini sudah melebihi batas:

     📊 *Anggaran:* Rp {{budget_limit}}
     💸 *Realisasi:* Rp {{spent_amount}} ({{percent}}%)
     🔴 *Status:* Melebihi batas anggaran!

     👉 Cek detail arus kas Anda: https://auroka.kuloalan.online/analytics
     ```
   - **Template 3: OTP WhatsApp Verification**
     ```
     🔐 *Kode Keamanan Auroka*
     Kode verifikasi Anda adalah: *{{otp_code}}*

     Kode ini berlaku selama 10 menit. JANGAN berikan kode ini kepada siapa pun termasuk pihak Auroka.
     ```

---

### C. 📱 In-App Notification Center (`/notifications`)

1. **Indikator Badge Header:**
   - Badge merah dengan *counter* angka notifikasi yang belum dibaca (`unread count`) pada icon lonceng di `AppHeader`.
2. **Halaman `/notifications`:**
   - **Filter Tab:** `Semua`, `Belum Dibaca`, `Tagihan & Budget`, `Keamanan & Akun`.
   - **Aksi Cepat:**
     - Tombol *"Tandai Semua Sudah Dibaca"*.
     - Tombol *"Hapus Notifikasi Terbaca"*.
     - Tombol Aksi Langsung pada card (misal: *"Bayar Tagihan"* ➡️ redirect ke `/bills`, *"Atur Budget"* ➡️ redirect ke `/analytics`).
3. **Pengaturan Preferensi Notifikasi (`/settings`):**
   - Toggle sakelar kustom pengguna:
     - [x] Peringatan Tagihan via WhatsApp
     - [x] Peringatan Budget Menipis
     - [x] Rekap Keuangan Mingguan
     - [x] Nomor WhatsApp Terdaftar (`+628...`) & Status Verifikasi

---

## 🗄️ 5. Skema Database Tambahan (Database Entities)

```sql
-- 1. Tabel Notifikasi Pengguna (In-App)
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL, -- 'BILLS', 'BUDGET', 'WALLET', 'DEBTS', 'SECURITY', 'SYSTEM'
    type VARCHAR(50) NOT NULL,     -- 'SUCCESS', 'WARNING', 'INFO', 'DANGER'
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    action_url VARCHAR(255),
    action_label VARCHAR(100),
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index untuk optimasi query unread count
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read);

-- 2. Tabel Preferensi Notifikasi Pengguna
CREATE TABLE user_notification_settings (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    whatsapp_enabled BOOLEAN DEFAULT TRUE,
    email_enabled BOOLEAN DEFAULT TRUE,
    bill_reminders_enabled BOOLEAN DEFAULT TRUE,
    budget_alerts_enabled BOOLEAN DEFAULT TRUE,
    low_balance_alerts_enabled BOOLEAN DEFAULT TRUE,
    low_balance_threshold NUMERIC(15, 2) DEFAULT 50000,
    weekly_digest_enabled BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabel Log Pengiriman Notifikasi External (Anti Spam / Rate Limiting)
CREATE TABLE notification_delivery_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    channel VARCHAR(20) NOT NULL, -- 'WHATSAPP', 'EMAIL', 'PUSH'
    identifier VARCHAR(100) NOT NULL, -- misal: 'BILL_DUE_123_2026-10-05'
    status VARCHAR(20) NOT NULL,     -- 'SENT', 'FAILED'
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🔌 6. Endpoint API Baru (Backend Routes)

### A. Notifications API
* `GET /api/v1/notifications` -> Daftar notifikasi pengguna (Support filter: `category`, `is_read`, pagination)
* `GET /api/v1/notifications/unread-count` -> Jumlah notifikasi unread untuk badge header
* `PATCH /api/v1/notifications/:id/read` -> Tandai 1 notifikasi telah dibaca
* `POST /api/v1/notifications/read-all` -> Tandai semua notifikasi telah dibaca
* `DELETE /api/v1/notifications/:id` -> Hapus satu notifikasi
* `DELETE /api/v1/notifications/clear-read` -> Hapus seluruh notifikasi terbaca

### B. Notification Settings API
* `GET /api/v1/notifications/settings` -> Ambil pengaturan preferensi notifikasi pengguna
* `PUT /api/v1/notifications/settings` -> Update toggle preferensi (WA, Email, Threshold)

---

## 📅 7. Rencana Eksekusi & Tahapan Implementasi

| Fase | Pekerjaan | Output |
|---|---|---|
| **Fase 1** | **Database Migration & Backend Models** | Tabel `notifications`, `user_notification_settings`, `delivery_logs` di Golang GORM. |
| **Fase 2** | **Notification Service & Dispatcher (Go)** | Modul internal `notification_service.go` yang mendukung dispatch In-App + APIWA WhatsApp client. |
| **Fase 3** | **APIWA WhatsApp Client Integration** | Service pengiriman pesan WA terintegrasi ke `http://127.0.0.1:3100` dengan rate-limiting & formatting rapi. |
| **Fase 4** | **Cron Job Scheduler (Bill & Budget Engine)** | Background worker otomatis: Scan jatuh tempo tagihan setiap pagi (08:00) & trigger alert budget realtime. |
| **Fase 5** | **Frontend In-App Center & Badge Indicator** | Header bell badge realtime, halaman `/notifications` dengan filter & direct-action buttons. |
| **Fase 6** | **Settings & Testing** | Halaman toggle preferensi di `/settings`, E2E test pengiriman notifikasi, dan verifikasi. |
