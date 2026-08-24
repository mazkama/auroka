'use client';

import React, { useState } from 'react';
import { AppLayout } from '@/presentation/components/layout/AppLayout';
import { useFinance } from '@/presentation/hooks/useFinance';
import { AddTransactionModal } from '@/presentation/components/features/AddTransactionModal';
import { ImportDataModal } from '@/presentation/components/features/ImportDataModal';
import {
  Settings,
  Globe,
  Coins,
  Cloud,
  CloudUpload,
  UploadCloud,
  CheckCircle2,
  Save,
  ShieldCheck,
  RefreshCw,
  Bell,
  HardDrive,
  FileSpreadsheet,
  Database,
} from 'lucide-react';

export default function SettingsPage() {
  const { wallets, addTransaction } = useFinance();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Settings Form States
  const [language, setLanguage] = useState('id');
  const [currency, setCurrency] = useState('IDR');
  const [autoBackup, setAutoBackup] = useState(true);
  const [backupFrequency, setBackupFrequency] = useState<'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY'>('DAILY');
  const [budgetAlerts, setBudgetAlerts] = useState(true);
  const [soundEffects, setSoundEffects] = useState(true);

  const [lastBackupTime, setLastBackupTime] = useState('Hari ini, 10:30 WIB');
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
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
      showToast('☁️ Berhasil mencadangkan seluruh data transaksi ke Google Drive!');
    }, 1500);
  };

  const handleImportSuccess = (fileName: string, rowCount: number) => {
    showToast(`✅ Berhasil mengimpor ${rowCount} transaksi dari berkas "${fileName}" ke dalam Ledger!`);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      showToast('⚙️ Pengaturan sistem Auroka berhasil disimpan.');
    }, 700);
  };

  return (
    <AppLayout onOpenAddModal={() => setIsModalOpen(true)}>
      <div className="space-y-6">
        {/* Toast Feedback */}
        {toastMessage && (
          <div className="fixed top-20 right-4 z-50 flex items-center gap-3 bg-[#0b1c30] text-white px-4 py-3 rounded-2xl shadow-2xl border border-white/20 animate-in fade-in slide-in-from-top-4 duration-300">
            <CheckCircle2 className="h-5 w-5 text-[#6cf8bb] shrink-0" />
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
            Sesuaikan bahasa antarmuka, format mata uang, sinkronisasi Google Drive, dan import database.
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
                  <option value="id">🇮🇩 Bahasa Indonesia (Default)</option>
                  <option value="en">🇺🇸 English (United States)</option>
                  <option value="jw">🇮🇩 Basa Jawa</option>
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
                    Amankan seluruh riwayat transaksi dan ledger Anda ke Google Drive pribadi
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
                  <span className="text-[#64748b]">Ukuran Berkas Ledger:</span>
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
                        <option value="DAILY">📅 Setiap Hari (Harian - Pukul 00:00 WIB)</option>
                        <option value="WEEKLY">📆 Setiap Minggu (Mingguan - Setiap Hari Minggu)</option>
                        <option value="MONTHLY">🗓️ Setiap Bulan (Bulanan - Tanggal 1 Awal Bulan)</option>
                        <option value="QUARTERLY">📊 Setiap Triwulan (Per 3 Bulan - Jan, Apr, Jul, Okt)</option>
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
                  Import Database & Pembukuan
                </h3>
                <p className="text-xs text-[#64748b]">
                  Unggah data transaksi eksternal dalam format Excel (.xlsx) atau CSV ke database lokal
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
                <span>Import Database Excel / CSV</span>
              </button>
            </div>
          </div>

          {/* Section 4: Preferences & Notifications */}
          <div className="bg-white border border-[#e2e8f0] rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-[#f1f5f9] pb-3">
              <Bell className="h-5 w-5 text-[#d97706]" />
              <div>
                <h3 className="text-sm font-bold text-[#0f172a]">
                  Preferensi Notifikasi & Suara
                </h3>
                <p className="text-xs text-[#64748b]">
                  Pemberitahuan peringatan limit anggaran dan audio aplikasi
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <label className="flex items-center justify-between p-3 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] cursor-pointer hover:bg-white transition-colors">
                <div>
                  <p className="text-xs font-bold text-[#0f172a]">Peringatan Limit Anggaran (80% & 95%)</p>
                  <p className="text-[10px] text-[#64748b]">
                    Tampilkan alert saat pengeluaran mendekati batas anggaran bulanan
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={budgetAlerts}
                  onChange={(e) => setBudgetAlerts(e.target.checked)}
                  className="h-4 w-4 text-[#004ac6] rounded focus:ring-[#004ac6] cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] cursor-pointer hover:bg-white transition-colors">
                <div>
                  <p className="text-xs font-bold text-[#0f172a]">Efek Audio Transaksi</p>
                  <p className="text-[10px] text-[#64748b]">
                    Suara chime saat transaksi berhasil ditambahkan ke Ledger
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
      />

      <ImportDataModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={handleImportSuccess}
      />
    </AppLayout>
  );
}
