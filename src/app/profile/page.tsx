'use client';

import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/presentation/components/layout/AppLayout';
import { useFinance } from '@/presentation/hooks/useFinance';
import { AuthUser, apiGetMe, apiUpdateProfile } from '@/infrastructure/api/authApi';
import { AddTransactionModal } from '@/presentation/components/features/AddTransactionModal';
import { PageHeader, Button, Input, Textarea, Avatar, Badge } from '@/presentation/components/ui';
import { useTranslation } from '@/presentation/i18n/I18nContext';
import {
  User,
  Mail,
  Phone,
  Camera,
  ShieldCheck,
  AlertCircle,
  Lock,
  Sparkles,
  Save,
  KeyRound,
} from 'lucide-react';

export default function ProfilePage() {
  const { t } = useTranslation();
  const { wallets, addTransaction, transferFunds } = useFinance();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Profile Form States
  const [user, setUser] = useState<AuthUser | null>(null);
  const [username, setUsername] = useState('Memuat...');
  const [phone, setPhone] = useState('');
  const [googleEmail, setGoogleEmail] = useState('Memuat...');
  const [bio, setBio] = useState('');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('auroka_user');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setUsername(parsedUser.name || '');
          setGoogleEmail(parsedUser.email || '');
          setPhone(parsedUser.phone || '');
          setBio(parsedUser.bio || '');
          if (parsedUser.avatarUrl || parsedUser.avatar_url) {
            setAvatarPreview(parsedUser.avatarUrl || parsedUser.avatar_url);
          }
        } catch (e) {
          console.error('Failed to parse user', e);
        }
      }

      // Sync latest data from backend API
      apiGetMe()
        .then((fetchedUser) => {
          if (fetchedUser) {
            setUser(fetchedUser);
            setUsername(fetchedUser.name || '');
            setGoogleEmail(fetchedUser.email || '');
            setPhone(fetchedUser.phone || '');
            setBio(fetchedUser.bio || '');
            if (fetchedUser.avatarUrl) {
              setAvatarPreview(fetchedUser.avatarUrl);
            }
          }
        })
        .catch(() => {
          // Keep offline state
        });
    }
  }, []);

  // Password Form States
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Status & Feedback
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Avatar = reader.result as string;
        
        // Compress image using client-side canvas
        const img = document.createElement('img');
        img.src = base64Avatar;
        img.onload = async () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 400;
          const MAX_HEIGHT = 400;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.85);
          setAvatarPreview(compressedBase64);

          try {
            const updated = await apiUpdateProfile({ avatarUrl: compressedBase64 });
            if (updated && updated.user) {
              setUser(updated.user);
            }
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new Event('auroka:profile-updated'));
            }
            showToast('Foto profil berhasil diperbarui.', 'success');
          } catch (err: unknown) {
            const errMsg = err instanceof Error ? err.message : 'Gagal memperbarui foto profil.';
            showToast(errMsg, 'error');
          }
        };
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const updated = await apiUpdateProfile({
        name: username,
        phone,
        bio,
      });
      if (updated && updated.user) {
        setUser(updated.user);
      }
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('auroka:profile-updated'));
      }
      showToast('Perubahan profil berhasil disimpan.', 'success');
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Gagal menyimpan perubahan profil.';
      showToast(errMsg, 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    if (newPassword.length < 6) {
      setPasswordError('Kata sandi baru minimal 6 karakter.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    setSavingPassword(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auroka_token') : null;
      const res = await fetch('/api/v1/auth/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          oldPassword,
          newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gagal memperbarui kata sandi.');
      }

      showToast('Kata sandi berhasil diperbarui.', 'success');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Gagal memperbarui kata sandi.';
      setPasswordError(errMsg);
      showToast(errMsg, 'error');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <AppLayout onOpenAddModal={() => setIsModalOpen(true)}>
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Toast Alert */}
        {toastMessage && (
          <div
            className={`fixed top-20 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl shadow-xl text-xs font-semibold animate-in fade-in slide-in-from-top-3 duration-200 border ${
              toastMessage.type === 'success'
                ? 'bg-[#0b1c30] text-white border-slate-700'
                : 'bg-[#ef4444] text-white border-red-400'
            }`}
          >
            {toastMessage.type === 'success' ? (
              <Sparkles className="h-4 w-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 text-white shrink-0" />
            )}
            <span>{toastMessage.text}</span>
          </div>
        )}

        {/* Page Header */}
        <PageHeader
          title={t('profile.title')}
          subtitle={t('profile.subtitle')}
          icon={User}
        />

        {/* Profile Card & Avatar Section */}
        <div className="bg-white border border-[#e2e8f0] rounded-3xl p-6 sm:p-8 shadow-xs relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
            {/* Avatar with Upload Trigger */}
            <div className="relative group">
              <Avatar
                src={avatarPreview}
                name={username}
                size="xl"
                className="shadow-lg ring-4 ring-[#eff4ff]"
              />

              <label
                htmlFor="avatar-upload"
                className="absolute bottom-0 right-0 bg-[#004ac6] hover:bg-[#2563eb] text-white p-2.5 rounded-full shadow-lg cursor-pointer transition-all hover:scale-105 active:scale-95 border-2 border-white"
                title="Unggah Foto Profil Baru"
              >
                <Camera className="h-4 w-4" />
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </label>
            </div>

            {/* Profile Overview */}
            <div className="text-center sm:text-left min-w-0 flex-1 space-y-1.5">
              <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-extrabold text-[#0b1c30] tracking-tight">
                  {username}
                </h2>
                <Badge variant="success" size="sm" icon={<ShieldCheck className="h-3 w-3" />}>
                  {t('profile.verified')}
                </Badge>
              </div>
              <p className="text-xs text-[#64748b]">{googleEmail}</p>
              {bio && (
                <p className="text-xs text-[#434655] italic bg-[#f8fafc] px-3 py-1.5 rounded-xl border border-[#f1f5f9] mt-2 inline-block">
                  &ldquo;{bio}&rdquo;
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Main Settings Tabs / Form Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Section 1: Informasi Personal */}
          <div className="bg-white border border-[#e2e8f0] rounded-3xl p-6 shadow-xs space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-[#f1f5f9]">
              <User className="h-4 w-4 text-[#004ac6]" />
              <h3 className="font-extrabold text-sm text-[#0b1c30]">Data Personal & Kontak</h3>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <Input
                label={t('profile.fullName')}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                leftIcon={<User className="h-4 w-4" />}
                required
              />

              <Input
                label={t('profile.email')}
                type="email"
                value={googleEmail}
                disabled
                leftIcon={<Mail className="h-4 w-4" />}
                helperText="Email terhubung dengan sistem autentikasi."
              />

              <Input
                label={t('profile.phone')}
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="cth: +62 812-3456-7890"
                leftIcon={<Phone className="h-4 w-4" />}
              />

              <Textarea
                label={t('profile.bio')}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tuliskan catatan singkat profil Anda..."
                rows={3}
              />

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  isLoading={savingProfile}
                  leftIcon={<Save className="h-4 w-4" />}
                  className="w-full"
                >
                  {t('profile.saveChanges')}
                </Button>
              </div>
            </form>
          </div>

          {/* Section 2: Keamanan & Password */}
          <div className="bg-white border border-[#e2e8f0] rounded-3xl p-6 shadow-xs space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-[#f1f5f9]">
              <Lock className="h-4 w-4 text-[#004ac6]" />
              <h3 className="font-extrabold text-sm text-[#0b1c30]">{t('profile.security')}</h3>
            </div>

            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <Input
                label={t('profile.oldPassword')}
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="Masukkan kata sandi lama"
                leftIcon={<KeyRound className="h-4 w-4" />}
                required
              />

              <Input
                label={t('profile.newPassword')}
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimal 6 karakter"
                leftIcon={<Lock className="h-4 w-4" />}
                required
              />

              <Input
                label={t('profile.confirmPassword')}
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Ulangi kata sandi baru"
                leftIcon={<Lock className="h-4 w-4" />}
                required
                error={passwordError}
              />

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="outline"
                  size="md"
                  isLoading={savingPassword}
                  leftIcon={<KeyRound className="h-4 w-4" />}
                  className="w-full"
                >
                  {t('profile.updatePassword')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Quick Add Transaction Modal */}
      <AddTransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddTransaction={addTransaction}
        onTransferFunds={transferFunds}
        wallets={wallets}
      />
    </AppLayout>
  );
}
