'use client';

import React, { useState } from 'react';
import { AppLayout } from '@/presentation/components/layout/AppLayout';
import { useFinance } from '@/presentation/hooks/useFinance';
import { AddTransactionModal } from '@/presentation/components/features/AddTransactionModal';
import {
  User,
  Mail,
  Phone,
  Camera,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Sparkles,
  Save,
  KeyRound,
  History,
  Smartphone,
  ExternalLink,
} from 'lucide-react';

export default function ProfilePage() {
  const { wallets, addTransaction } = useFinance();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Profile Form States
  const [username, setUsername] = useState('Demo User');
  const [phone, setPhone] = useState('+62 812-3456-7890');
  const googleEmail = 'user@auroka.id'; // Fixed Google Gmail Account (Cannot be changed)
  const [bio, setBio] = useState('Pengguna Auroka Enterprise Finansial.');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        setAvatarPreview(reader.result as string);
        showToast('📸 Foto profil berhasil diperbarui.');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveChanges = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      showToast('✅ Perubahan profil berhasil disimpan!');
    }, 800);
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
              Profil Saya
            </h1>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-[#004ac6]/10 text-[#004ac6] px-2.5 py-0.5 rounded-full border border-[#004ac6]/20">
              Personal Account
            </span>
          </div>
          <p className="text-xs text-[#434655] mt-1">
            Kelola data identitas akun, foto profil, dan informasi kontak Anda di Auroka.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Card 1: Avatar & Profile Summary (Mobile: 1st | Desktop: Top Left) */}
          <div className="order-1 lg:col-span-4 bg-white border border-[#e2e8f0] rounded-2xl p-6 shadow-sm text-center space-y-4">
            {/* Avatar Uploader */}
            <div className="relative inline-block mx-auto">
              <div className="w-28 h-28 rounded-3xl bg-gradient-to-tr from-[#004ac6] to-[#2563eb] text-white flex items-center justify-center font-extrabold text-3xl shadow-xl overflow-hidden ring-4 ring-[#eff4ff]">
                {avatarPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={avatarPreview}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>AU</span>
                )}
              </div>

              {/* Upload Button overlay */}
              <label className="absolute bottom-0 right-0 p-2 rounded-2xl bg-[#004ac6] hover:bg-[#2563eb] text-white shadow-lg cursor-pointer transition-all hover:scale-105 border-2 border-white">
                <Camera className="h-4 w-4" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </label>
            </div>

            <div>
              <h3 className="text-lg font-bold text-[#0b1c30]">{username}</h3>
              <p className="text-xs text-[#64748b]">{googleEmail}</p>
            </div>

            <div className="pt-2 border-t border-[#f1f5f9] flex items-center justify-center gap-2">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#006c49] bg-[#006c49]/10 px-3 py-1 rounded-full">
                <ShieldCheck className="h-3.5 w-3.5" />
                Google Verified
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#004ac6] bg-[#004ac6]/10 px-3 py-1 rounded-full">
                <Sparkles className="h-3.5 w-3.5" />
                Auroka Pro
              </span>
            </div>
          </div>

          {/* Card 2: Informasi Data Diri Form (Mobile: 2nd [di atas Keamanan] | Desktop: Right Column) */}
          <div className="order-2 lg:col-span-8 lg:row-span-2 bg-white border border-[#e2e8f0] rounded-2xl p-6 sm:p-7 shadow-sm space-y-6">
            <div>
              <h3 className="text-base font-bold text-[#0f172a]">
                Informasi Data Diri
              </h3>
              <p className="text-xs text-[#64748b] mt-0.5">
                Perbarui nama pengguna dan nomor telepon kontak Anda.
              </p>
            </div>

            <form onSubmit={handleSaveChanges} className="space-y-5">
              {/* Field 1: Username */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#334155]">
                  Username / Nama Lengkap <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#94a3b8]">
                    <User className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Masukkan nama pengguna..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#cbd5e1] text-xs font-semibold text-[#0f172a] focus:outline-none focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/10 transition-all"
                  />
                </div>
                <p className="text-[10px] text-[#64748b]">
                  Nama ini akan ditampilkan pada header, laporan, dan catatan transaksi.
                </p>
              </div>

              {/* Field 2: Phone Number */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#334155]">
                  Nomor WhatsApp / Handphone <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#94a3b8]">
                    <Phone className="h-4 w-4" />
                  </div>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+62 8xx-xxxx-xxxx"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#cbd5e1] text-xs font-semibold text-[#0f172a] focus:outline-none focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/10 transition-all font-mono"
                  />
                </div>
                <p className="text-[10px] text-[#64748b]">
                  Digunakan untuk notifikasi pengingat limit anggaran bulanan dan keamanan.
                </p>
              </div>

              {/* Field 3: Google Gmail (READ ONLY - Tidak bisa diubah) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-[#334155]">
                    Alamat Gmail (Akun Google Terdaftar)
                  </label>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#64748b] bg-[#f1f5f9] px-2 py-0.5 rounded-md">
                    <Lock className="h-3 w-3 text-[#94a3b8]" />
                    Permanen / Tidak dapat diubah
                  </span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#94a3b8]">
                    <Mail className="h-4 w-4 text-[#006c49]" />
                  </div>
                  <input
                    type="email"
                    disabled
                    readOnly
                    value={googleEmail}
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] text-xs font-bold text-[#64748b] cursor-not-allowed select-none font-mono"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
                    <ShieldCheck className="h-4 w-4 text-[#006c49]" />
                  </div>
                </div>
                <p className="text-[10px] text-[#64748b]">
                  Alamat email terikat langsung dengan akun Google SSO demi integritas data dan keamanan Ledger.
                </p>
              </div>

              {/* Field 4: Bio / Catatan Pribadi */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#334155]">
                  Bio Singkat
                </label>
                <textarea
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tuliskan catatan singkat tentang profil Anda..."
                  className="w-full p-3 rounded-xl border border-[#cbd5e1] text-xs font-semibold text-[#0f172a] focus:outline-none focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/10 transition-all resize-none"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-3 border-t border-[#f1f5f9] flex items-center justify-end gap-3">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center gap-2 bg-[#004ac6] hover:bg-[#2563eb] text-white px-6 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md shadow-[#004ac6]/20"
                >
                  {isSaving ? (
                    <>
                      <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      <span>Simpan Perubahan</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Card 3: Account Security Info Card (Mobile: 3rd | Desktop: Bottom Left) */}
          <div className="order-3 lg:col-span-4 bg-white border border-[#e2e8f0] rounded-2xl p-5 shadow-sm space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#94a3b8] flex items-center gap-1.5">
              <KeyRound className="h-3.5 w-3.5 text-[#004ac6]" />
              Keamanan & Akses
            </h4>

            <div className="p-3 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#0f172a]">Autentikasi Akun</span>
                <span className="text-[10px] font-bold text-[#006c49]">Aktif</span>
              </div>
              <p className="text-[11px] text-[#64748b]">
                Terkoneksi langsung melalui Single Sign-On (SSO) Google Account.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#0f172a]">Sesi Login Terakhir</span>
                <span className="text-[10px] text-[#64748b]">Hari ini, 10:45</span>
              </div>
              <p className="text-[11px] text-[#64748b]">
                Windows 11 • Chrome Browser • Jakarta, Indonesia
              </p>
            </div>
          </div>
        </div>
      </div>

      <AddTransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        wallets={wallets}
        onAddTransaction={addTransaction}
      />
    </AppLayout>
  );
}
