'use client';

import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/presentation/components/layout/AppLayout';
import { useFinance } from '@/presentation/hooks/useFinance';
import { useNotifications } from '@/presentation/hooks/useNotifications';
import { AddTransactionModal } from '@/presentation/components/features/AddTransactionModal';
import { ImportDataModal } from '@/presentation/components/features/ImportDataModal';
import { WhatsAppVerificationModal } from '@/presentation/components/features/WhatsAppVerificationModal';
import { apiGetMe, apiUpdateProfile, apiUpdatePassword } from '@/infrastructure/api/authApi';
import {
  Settings,
  Globe,
  Coins,
  Cloud,
  CloudUpload,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Save,
  ShieldCheck,
  RefreshCw,
  Bell,
  HardDrive,
  FileSpreadsheet,
  Database,
  KeyRound,
  Lock,
  MessageSquare,
  Mail,
  Smartphone,
  Check,
  ShieldAlert,
} from 'lucide-react';

export default function SettingsPage() {
  const { wallets, addTransaction, transferFunds } = useFinance();
  const {
    settings: notifSettings,
    updateSettings: updateNotifSettings,
    requestPhoneOTP,
    confirmPhoneOTP,
    refreshSettings: refreshNotifSettings,
  } = useNotifications();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isWAVerifyModalOpen, setIsWAVerifyModalOpen] = useState(false);

  // Settings Form States
  const [language, setLanguage] = useState('id');
  const [currency, setCurrency] = useState('IDR');
  const [autoBackup, setAutoBackup] = useState(true);
  const [backupFrequency, setBackupFrequency] = useState<'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY'>('DAILY');
  const [soundEffects, setSoundEffects] = useState(true);

  // Notification Channel Settings States (from backend)
  const [waEnabled, setWaEnabled] = useState(false);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [inAppEnabled, setInAppEnabled] = useState(true);
  const [billReminders, setBillReminders] = useState(true);
  const [budgetAlerts, setBudgetAlerts] = useState(true);
  const [lowBalanceAlerts, setLowBalanceAlerts] = useState(true);
  const [securityAlerts, setSecurityAlerts] = useState(true);
  const [budgetThresholdPct, setBudgetThresholdPct] = useState(80);

  // Security / Password Form States
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const [lastBackupTime, setLastBackupTime] = useState('Hari ini, 10:30 WIB');
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  useEffect(() => {
    if (notifSettings) {
      setWaEnabled(notifSettings.whatsapp_enabled);
      setEmailEnabled(notifSettings.email_enabled);
      setInAppEnabled(notifSettings.in_app_enabled);
      setBillReminders(notifSettings.bill_reminders);
      setBudgetAlerts(notifSettings.budget_alerts);
      setLowBalanceAlerts(notifSettings.low_balance_alerts);
      setSecurityAlerts(notifSettings.security_alerts);
      setBudgetThresholdPct(notifSettings.budget_threshold_pct || 80);
    }
  }, [notifSettings]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('auroka_user');
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          if (parsed.currencyPreference || parsed.currency_preference) {
            setCurrency(parsed.currencyPreference || parsed.currency_preference);
          }
          if (parsed.languagePreference || parsed.language_preference) {
            setLanguage(parsed.languagePreference || parsed.language_preference);
          }
        } catch (e) {
          console.error('Failed to parse user preferences', e);
        }
      }

      apiGetMe()
        .then((user) => {
          if (user) {
            if (user.currencyPreference) setCurrency(user.currencyPreference);
            if (user.languagePreference) setLanguage(user.languagePreference);
          }
        })
        .catch(() => {
          // Offline / ignore
        });
    }
  }, []);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleManualBackup = () => {
    setIsBackingUp(true);
    setTimeout(() => {
      setIsBackingUp(false);
      const now = new Date();
      const timeStr = `Hari ini, ${String(now.getHours()).padStart(2, '0')}:${String(
        now.getMinutes()
      ).padStart(2, '0')} WIB`;
      setLastBackupTime(timeStr);
      showToast('Berhasil mencadangkan seluruh data transaksi ke Google Drive!', 'success');
    }, 1500);
  };

  const handleImportSuccess = (fileName: string, rowCount: number) => {
    showToast(`Berhasil mengimpor ${rowCount} transaksi dari berkas "${fileName}" ke dalam Ledger!`, 'success');
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await apiUpdateProfile({
        currencyPreference: currency,
        languagePreference: language,
      });

      // Save notification settings to real backend
      await updateNotifSettings({
        whatsapp_enabled: waEnabled,
        email_enabled: emailEnabled,
        in_app_enabled: inAppEnabled,
        bill_reminders: billReminders,
        budget_alerts: budgetAlerts,
        low_balance_alerts: lowBalanceAlerts,
        security_alerts: securityAlerts,
        budget_threshold_pct: Number(budgetThresholdPct),
      });

      showToast('Pengaturan preferensi dan notifikasi multi-channel berhasil disimpan!', 'success');
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Gagal menyimpan pengaturan.';
      showToast(errorMsg, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword) {
      showToast('Kata sandi saat ini wajib diisi.', 'error');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      showToast('Kata sandi baru minimal 6 karakter.', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('Konfirmasi kata sandi baru tidak sesuai.', 'error');
      return;
    }

    setIsChangingPassword(true);
    try {
      const res = await apiUpdatePassword(oldPassword, newPassword);
      showToast(res.message || 'Kata sandi berhasil diperbarui!', 'success');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Gagal memperbarui kata sandi.';
      showToast(errorMsg, 'error');
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <AppLayout onOpenAddModal={() => setIsModalOpen(true)}>
      <div className="space-y-6">
        {/* Toast Feedback */}
        {toastMessage && (
          <div
            className={`fixed top-20 right-4 z-50 flex items-center gap-3 ${
              toastType === 'error'
                ? 'bg-[#991b1b] text-white border-rose-400/30'
                : 'bg-[#0b1c30] text-white border-white/20'
            } px-4 py-3 rounded-2xl shadow-2xl border animate-in fade-in slide-in-from-top-4 duration-300`}
          >
            {toastType === 'error' ? (
              <AlertCircle className="h-5 w-5 text-rose-300 shrink-0" />
            ) : (
              <CheckCircle2 className="h-5 w-5 text-[#6cf8bb] shrink-0" />
            )}
            <span className="text-xs font-semibold">{toastMessage}</span>
          </div>
        )}

        {/* Page Header */}
        <div className="bg-white border border-[#e2e8f0] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#0b1c30] tracking-tight">
              Pengaturan Sistem
            </h1>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-[#004ac6]/10 text-[#004ac6] px-2.5 py-0.5 rounded-full border border-[#004ac6]/20">
              Preferences
            </span>
          </div>
          <p className="text-xs text-[#434655] mt-1">
            Sesuaikan bahasa antarmuka, format mata uang, sinkronisasi Google Drive, dan impor transaksi.
          </p>
        </div>

        <form onSubmit={handleSaveSettings} className="space-y-6">
          {/* Section 1: Regional & Localization */}
          <div className="bg-white border border-[#e2e8f0] rounded-2xl p-6 shadow-sm space-y-5">
            <div className="flex items-center gap-2 border-b border-[#f1f5f9] pb-3">
              <Globe className="h-5 w-5 text-[#004ac6]" />
              <div>
                <h3 className="text-sm font-bold text-[#0f172a]">
                  Bahasa & Format Mata Uang
                </h3>
                <p className="text-xs text-[#64748b]">
                  Konfigurasi lokalisasi dan tampilan nominal saldo transaksi
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Language Selection */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#334155]">
                  Bahasa Antarmuka (Language)
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#cbd5e1] text-xs font-semibold text-[#0f172a] bg-white focus:outline-none focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/10 transition-all cursor-pointer"
                >
                  <option value="id">Bahasa Indonesia (Default)</option>
                  <option value="en">English (United States)</option>
                  <option value="jw">Basa Jawa</option>
                </select>
                <p className="text-[10px] text-[#64748b]">
                  Bahasa yang digunakan pada seluruh menu dan laporan keuangan.
                </p>
              </div>

              {/* Currency Selection */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#334155]">
                  Format Mata Uang Utama (Currency)
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#cbd5e1] text-xs font-semibold text-[#0f172a] bg-white focus:outline-none focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/10 transition-all cursor-pointer font-mono"
                >
                  <option value="IDR">IDR - Rupiah Indonesia (Rp)</option>
                  <option value="USD">USD - US Dollar ($)</option>
                  <option value="EUR">EUR - Euro (€)</option>
                  <option value="SGD">SGD - Singapore Dollar (S$)</option>
                  <option value="JPY">JPY - Japanese Yen (¥)</option>
                </select>
                <p className="text-[10px] text-[#64748b]">
                  Standar kalkulasi angka pada seluruh kartu dompet dan buku kas.
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: Backup Data di Akun Google & Sinkronisasi Cloud */}
          <div className="bg-white border border-[#e2e8f0] rounded-2xl p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-[#f1f5f9] pb-3">
              <div className="flex items-center gap-2">
                <Cloud className="h-5 w-5 text-[#0284c7]" />
                <div>
                  <h3 className="text-sm font-bold text-[#0f172a]">
                    Cadangan Data di Akun Google (Cloud Backup)
                  </h3>
                  <p className="text-xs text-[#64748b]">
                    Amankan seluruh riwayat transaksi dan data keuangan Anda ke Google Drive pribadi
                  </p>
                </div>
              </div>

              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#006c49] bg-[#006c49]/10 px-2.5 py-1 rounded-full">
                <ShieldCheck className="h-3.5 w-3.5" />
                Google Drive Terkoneksi
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-center">
              <div className="p-4 rounded-2xl bg-[#f8fafc] border border-[#e2e8f0] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#0f172a]">Akun Google Backup:</span>
                  <span className="font-mono text-[#004ac6] font-semibold">user@auroka.id</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#64748b]">Waktu Cadangan Terakhir:</span>
                  <span className="font-semibold text-[#0f172a]">{lastBackupTime}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#64748b]">Ukuran Berkas Cadangan:</span>
                  <span className="font-mono text-[#64748b]">1.4 MB (Tersinkron)</span>
                </div>
              </div>

              <div className="space-y-3">
                {/* Auto Backup Toggle & Frequency Selection */}
                <div className="p-3.5 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-[#0f172a]">Cadangan Otomatis</p>
                      <p className="text-[10px] text-[#64748b]">
                        Sinkronisasi cloud terjadwal secara periodik
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={autoBackup}
                      onChange={(e) => setAutoBackup(e.target.checked)}
                      className="h-4 w-4 text-[#004ac6] rounded focus:ring-[#004ac6] cursor-pointer"
                    />
                  </div>

                  {autoBackup ? (
                    <div className="pt-2 border-t border-[#e2e8f0] space-y-1.5 animate-in fade-in duration-200">
                      <label className="block text-[11px] font-bold text-[#334155]">
                        Frekuensi Cadangan Terjadwal
                      </label>
                      <select
                        value={backupFrequency}
                        onChange={(e) =>
                          setBackupFrequency(
                            e.target.value as 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY'
                          )
                        }
                        className="w-full px-3 py-2 rounded-xl border border-[#cbd5e1] text-xs font-semibold text-[#0f172a] bg-white focus:outline-none focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/10 transition-all cursor-pointer"
                      >
                        <option value="DAILY">Setiap Hari (Harian - Pukul 00:00 WIB)</option>
                        <option value="WEEKLY">Setiap Minggu (Mingguan - Setiap Hari Minggu)</option>
                        <option value="MONTHLY">Setiap Bulan (Bulanan - Tanggal 1 Awal Bulan)</option>
                        <option value="QUARTERLY">Setiap Triwulan (Per 3 Bulan - Jan, Apr, Jul, Okt)</option>
                      </select>
                      <p className="text-[10px] text-[#006c49] font-medium flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3 inline shrink-0" />
                        <span>
                          {backupFrequency === 'DAILY' && 'Data akan dicadangkan otomatis setiap hari pada pukul 00:00 WIB.'}
                          {backupFrequency === 'WEEKLY' && 'Data akan dicadangkan otomatis setiap hari Minggu pada pukul 23:59 WIB.'}
                          {backupFrequency === 'MONTHLY' && 'Data akan dicadangkan otomatis setiap tanggal 1 awal bulan.'}
                          {backupFrequency === 'QUARTERLY' && 'Data akan dicadangkan otomatis per triwulan (setiap 3 bulan).'}
                        </span>
                      </p>
                    </div>
                  ) : (
                    <div className="pt-1 text-[10px] text-[#ba1a1a] italic">
                      Cadangan otomatis dinonaktifkan. Anda tetap dapat mencadangkan manual di bawah.
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleManualBackup}
                  disabled={isBackingUp}
                  className="w-full flex items-center justify-center gap-2 bg-[#eff4ff] hover:bg-[#dce9ff] text-[#004ac6] border border-[#004ac6]/30 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-2xs"
                >
                  {isBackingUp ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin text-[#004ac6]" />
                      <span>Menghubungkan ke Google Drive...</span>
                    </>
                  ) : (
                    <>
                      <CloudUpload className="h-4 w-4" />
                      <span>Cadangkan ke Google Drive Sekarang</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Section 3: Import Database (Excel / CSV) */}
          <div className="bg-white border border-[#e2e8f0] rounded-2xl p-6 shadow-sm space-y-5">
            <div className="flex items-center gap-2 border-b border-[#f1f5f9] pb-3">
              <Database className="h-5 w-5 text-[#7c3aed]" />
              <div>
                <h3 className="text-sm font-bold text-[#0f172a]">
                  Impor Berkas Transaksi
                </h3>
                <p className="text-xs text-[#64748b]">
                  Unggah data transaksi eksternal dalam format Excel (.xlsx) atau CSV ke akun Anda
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-gradient-to-br from-[#fbfaff] to-[#f5f3ff] border border-[#e9d5ff]">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="h-4 w-4 text-[#7c3aed]" />
                  <p className="text-xs font-bold text-[#4c1d95]">
                    Integrasi Berkas Excel / CSV
                  </p>
                </div>
                <p className="text-[11px] text-[#6b21a8]">
                  Mendukung pembukuan multi-kolom dengan format otomatis untuk seluruh transaksi keluar dan masuk.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsImportModalOpen(true)}
                className="inline-flex items-center justify-center gap-2 bg-[#7c3aed] hover:bg-[#6d28d9] text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md shadow-[#7c3aed]/20 shrink-0"
              >
                <UploadCloud className="h-4 w-4" />
                <span>Impor Berkas Excel / CSV</span>
              </button>
            </div>
          </div>

          {/* Section 4: Smart Multi-Channel Notifications & WhatsApp APIWA */}
          <div className="bg-white border border-[#e2e8f0] rounded-2xl p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-[#f1f5f9] pb-3">
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-[#004ac6]" />
                <div>
                  <h3 className="text-sm font-bold text-[#0f172a]">
                    Saluran Notifikasi & WhatsApp Gateway
                  </h3>
                  <p className="text-xs text-[#64748b]">
                    Atur pengiriman pesan instan WhatsApp (APIWA), email ringkasan, dan peringatan In-App
                  </p>
                </div>
              </div>
            </div>

            {/* Channels Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* WhatsApp Channel Card with Gatekeeper */}
              <div className={`p-4 rounded-2xl border transition-all ${
                notifSettings?.is_phone_verified
                  ? 'bg-emerald-50/40 border-emerald-200'
                  : 'bg-[#f8fafc] border-[#e2e8f0]'
              }`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-emerald-600 text-white shadow-xs">
                      <MessageSquare className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#0f172a]">WhatsApp Alert</h4>
                      <p className="text-[10px] text-[#64748b]">Local APIWA Gateway</p>
                    </div>
                  </div>

                  {notifSettings?.is_phone_verified ? (
                    <input
                      type="checkbox"
                      checked={waEnabled}
                      onChange={(e) => setWaEnabled(e.target.checked)}
                      className="h-4 w-4 text-emerald-600 rounded focus:ring-emerald-600 cursor-pointer"
                    />
                  ) : (
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                      Terkunci
                    </span>
                  )}
                </div>

                <div className="mt-3 pt-3 border-t border-emerald-200/60 space-y-2">
                  {notifSettings?.is_phone_verified ? (
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-[11px]">
                        <Check className="h-3.5 w-3.5" />
                        <span>{notifSettings.phone_number}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsWAVerifyModalOpen(true)}
                        className="text-[10px] font-bold text-[#004ac6] hover:underline"
                      >
                        Ganti
                      </button>
                    </div>
                  ) : (
                    <div>
                      <p className="text-[10px] text-[#64748b] mb-2 leading-relaxed">
                        Verifikasi nomor WA Anda dengan OTP 6-digit untuk mengaktifkan notifikasi via WhatsApp.
                      </p>
                      <button
                        type="button"
                        onClick={() => setIsWAVerifyModalOpen(true)}
                        className="w-full flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs"
                      >
                        <ShieldCheck className="h-3.5 w-3.5" />
                        <span>Verifikasi WhatsApp</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Email Channel Card */}
              <div className="p-4 rounded-2xl bg-[#f8fafc] border border-[#e2e8f0]">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-blue-600 text-white shadow-xs">
                      <Mail className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#0f172a]">Email Alert</h4>
                      <p className="text-[10px] text-[#64748b]">Resend Verified API</p>
                    </div>
                  </div>

                  <input
                    type="checkbox"
                    checked={emailEnabled}
                    onChange={(e) => setEmailEnabled(e.target.checked)}
                    className="h-4 w-4 text-[#004ac6] rounded focus:ring-[#004ac6] cursor-pointer"
                  />
                </div>

                <div className="mt-3 pt-3 border-t border-[#e2e8f0]">
                  <p className="text-[11px] text-[#64748b]">
                    Mengirim laporan keuangan mingguan & notifikasi penting ke alamat email terdaftar.
                  </p>
                </div>
              </div>

              {/* In-App Channel Card */}
              <div className="p-4 rounded-2xl bg-[#f8fafc] border border-[#e2e8f0]">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-xs">
                      <Smartphone className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#0f172a]">In-App Center</h4>
                      <p className="text-[10px] text-[#64748b]">Pusat Notifikasi Aplikasi</p>
                    </div>
                  </div>

                  <input
                    type="checkbox"
                    checked={inAppEnabled}
                    onChange={(e) => setInAppEnabled(e.target.checked)}
                    className="h-4 w-4 text-indigo-600 rounded focus:ring-indigo-600 cursor-pointer"
                  />
                </div>

                <div className="mt-3 pt-3 border-t border-[#e2e8f0]">
                  <p className="text-[11px] text-[#64748b]">
                    Badge unread pada header aplikasi dan riwayat lengkap di halaman /notifications.
                  </p>
                </div>
              </div>
            </div>

            {/* Notification Trigger Toggles & Threshold */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold text-[#334155] uppercase tracking-wider">
                Jenis Notifikasi Otomatis
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <label className="flex items-center justify-between p-3.5 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] cursor-pointer hover:bg-white transition-colors">
                  <div>
                    <p className="text-xs font-bold text-[#0f172a]">Pengingat Jatuh Tempo Tagihan</p>
                    <p className="text-[10px] text-[#64748b]">
                      Peringatan otomatis H-3, H-1, dan Hari-H sebelum jatuh tempo
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={billReminders}
                    onChange={(e) => setBillReminders(e.target.checked)}
                    className="h-4 w-4 text-[#004ac6] rounded focus:ring-[#004ac6] cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-3.5 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] cursor-pointer hover:bg-white transition-colors">
                  <div>
                    <p className="text-xs font-bold text-[#0f172a]">Peringatan Limit Anggaran</p>
                    <p className="text-[10px] text-[#64748b]">
                      Peringatan jika pengeluaran kategori mencapai 80% & 100%
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={budgetAlerts}
                    onChange={(e) => setBudgetAlerts(e.target.checked)}
                    className="h-4 w-4 text-[#004ac6] rounded focus:ring-[#004ac6] cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-3.5 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] cursor-pointer hover:bg-white transition-colors">
                  <div>
                    <p className="text-xs font-bold text-[#0f172a]">Peringatan Saldo Kritis Dompet</p>
                    <p className="text-[10px] text-[#64748b]">
                      Pemberitahuan jika saldo kas/bank di bawah batas minimum
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={lowBalanceAlerts}
                    onChange={(e) => setLowBalanceAlerts(e.target.checked)}
                    className="h-4 w-4 text-[#004ac6] rounded focus:ring-[#004ac6] cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-3.5 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] cursor-pointer hover:bg-white transition-colors">
                  <div>
                    <p className="text-xs font-bold text-[#0f172a]">Notifikasi Keamanan Akun</p>
                    <p className="text-[10px] text-[#64748b]">
                      Peringatan sesi login baru dan perubahan kata sandi
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={securityAlerts}
                    onChange={(e) => setSecurityAlerts(e.target.checked)}
                    className="h-4 w-4 text-[#004ac6] rounded focus:ring-[#004ac6] cursor-pointer"
                  />
                </label>
              </div>

              {/* Threshold Slider / Select */}
              <div className="p-3.5 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold text-[#0f172a]">Ambang Batas Peringatan Anggaran (Threshold)</p>
                  <p className="text-[10px] text-[#64748b]">Kirim peringatan dini saat pengeluaran kategori mencapai persentase ini</p>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={budgetThresholdPct}
                    onChange={(e) => setBudgetThresholdPct(Number(e.target.value))}
                    className="px-3 py-1.5 text-xs font-bold text-[#004ac6] bg-white border border-[#cbd5e1] rounded-xl focus:outline-none focus:border-[#004ac6]"
                  >
                    <option value={70}>70% dari Batas</option>
                    <option value={80}>80% dari Batas (Rekomendasi)</option>
                    <option value={90}>90% dari Batas</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Section 5: Preferences & Audio */}
          <div className="bg-white border border-[#e2e8f0] rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-[#f1f5f9] pb-3">
              <Settings className="h-5 w-5 text-[#d97706]" />
              <div>
                <h3 className="text-sm font-bold text-[#0f172a]">
                  Preferensi Audio & UX
                </h3>
                <p className="text-xs text-[#64748b]">
                  Suara interaksi pencatatan kas dan umpan balik antarmuka
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <label className="flex items-center justify-between p-3 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] cursor-pointer hover:bg-white transition-colors">
                <div>
                  <p className="text-xs font-bold text-[#0f172a]">Efek Audio Transaksi</p>
                  <p className="text-[10px] text-[#64748b]">
                    Suara notifikasi saat transaksi berhasil disimpan
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={soundEffects}
                  onChange={(e) => setSoundEffects(e.target.checked)}
                  className="h-4 w-4 text-[#004ac6] rounded focus:ring-[#004ac6] cursor-pointer"
                />
              </label>
            </div>
          </div>

          {/* Section 6: Change Password & Security */}
          <div className="bg-white border border-[#e2e8f0] rounded-2xl p-6 shadow-sm space-y-5">
            <div className="flex items-center gap-2 border-b border-[#f1f5f9] pb-3">
              <KeyRound className="h-5 w-5 text-[#004ac6]" />
              <div>
                <h3 className="text-sm font-bold text-[#0f172a]">
                  Ubah Kata Sandi Akun (Security)
                </h3>
                <p className="text-xs text-[#64748b]">
                  Perbarui kata sandi secara berkala untuk melindungi keamanan akses akun Anda
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#334155]">
                  Kata Sandi Lama <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#94a3b8]">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder="Masukkan kata sandi lama"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#cbd5e1] text-xs font-semibold text-[#0f172a] focus:outline-none focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/10 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#334155]">
                  Kata Sandi Baru <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#94a3b8]">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#cbd5e1] text-xs font-semibold text-[#0f172a] focus:outline-none focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/10 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#334155]">
                  Konfirmasi Sandi Baru <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#94a3b8]">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Ulangi kata sandi baru"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#cbd5e1] text-xs font-semibold text-[#0f172a] focus:outline-none focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/10 transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleChangePassword}
                disabled={isChangingPassword || !oldPassword || !newPassword}
                className="flex items-center gap-2 bg-[#0b1c30] hover:bg-[#1e293b] text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isChangingPassword ? (
                  <>
                    <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Memperbarui Sandi...</span>
                  </>
                ) : (
                  <>
                    <KeyRound className="h-4 w-4" />
                    <span>Ubah Kata Sandi</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Submit Action Button */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 bg-[#004ac6] hover:bg-[#2563eb] text-white px-7 py-3 rounded-xl text-xs font-bold transition-all shadow-md shadow-[#004ac6]/20"
            >
              {isSaving ? (
                <>
                  <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Menyimpan Pengaturan...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Simpan Semua Pengaturan</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <AddTransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        wallets={wallets}
        onAddTransaction={addTransaction}
        onTransferFunds={transferFunds}
      />

      <ImportDataModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={handleImportSuccess}
      />

      <WhatsAppVerificationModal
        isOpen={isWAVerifyModalOpen}
        onClose={() => setIsWAVerifyModalOpen(false)}
        currentPhone={notifSettings?.phone_number || ''}
        onRequestOTP={requestPhoneOTP}
        onConfirmOTP={confirmPhoneOTP}
        onSuccess={(updatedSettings) => {
          setWaEnabled(true);
          showToast('Nomor WhatsApp terverifikasi & notifikasi WA diaktifkan!', 'success');
          refreshNotifSettings();
        }}
      />
    </AppLayout>
  );
}
