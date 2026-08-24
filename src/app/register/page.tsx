'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { mockRegister } from '@/infrastructure/mock/mockAuth';
import { Coins, Lock, Mail, User, ArrowRight, CheckCircle2, ShieldCheck, AlertCircle } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; email?: string; password?: string }>({});

  const validateForm = () => {
    const errors: { name?: string; email?: string; password?: string } = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!name.trim()) {
      errors.name = 'Nama lengkap wajib diisi.';
    } else if (name.trim().length < 2) {
      errors.name = 'Nama lengkap minimal 2 karakter.';
    }

    if (!email.trim()) {
      errors.email = 'Alamat email wajib diisi.';
    } else if (!emailRegex.test(email.trim())) {
      errors.email = 'Format alamat email tidak valid.';
    }

    if (!password) {
      errors.password = 'Kata sandi wajib diisi.';
    } else if (password.length < 8) {
      errors.password = 'Kata sandi minimal 8 karakter.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      setError('Mohon periksa kembali input formulir Anda.');
      return;
    }

    try {
      setLoading(true);
      const user = await mockRegister(name, email, password);
      localStorage.setItem('auroka_user', JSON.stringify(user));
      router.push('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Gagal membuat akun');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9ff] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans selection:bg-[#004ac6] selection:text-white">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <Link href="/" className="inline-flex items-center gap-2 group">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#004ac6] to-[#2563eb] text-white shadow-lg shadow-[#004ac6]/30 group-hover:scale-105 transition-transform">
            <Coins className="h-6 w-6" />
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-[#004ac6]">
            Auroka
          </span>
        </Link>
        <h2 className="text-2xl font-extrabold text-[#0b1c30] tracking-tight">
          Buat Akun Auroka Baru
        </h2>
        <p className="text-xs text-[#434655]">
          Pahami Uang, Bangun Masa Depan (From Understanding to Prosperity)
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white border border-[#c3c6d7]/60 py-8 px-6 sm:px-10 shadow-xl rounded-2xl space-y-6">
          {error && (
            <div
              id="auth-alert-message"
              data-testid="auth-alert"
              className="auth-alert-banner flex items-center gap-2 rounded-xl bg-rose-500/10 border border-rose-500/20 p-3 text-xs text-[#ba1a1a] font-medium"
              role="alert"
            >
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#0b1c30] mb-1.5">
                Nama Lengkap
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-[#434655]" />
                <input
                  id="register-name-input"
                  name="name"
                  data-testid="register-name"
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (fieldErrors.name) setFieldErrors((prev) => ({ ...prev, name: undefined }));
                  }}
                  placeholder="Contoh: Alan Mazkama"
                  className={`w-full rounded-xl bg-[#f8f9ff] border ${
                    fieldErrors.name ? 'border-rose-500 ring-1 ring-rose-500' : 'border-[#c3c6d7]'
                  } pl-10 pr-3 py-2.5 text-xs text-[#0b1c30] placeholder-slate-400 focus:outline-none focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/20 transition-all`}
                />
              </div>
              {fieldErrors.name && (
                <p id="name-error-text" className="mt-1 text-[11px] text-rose-600 font-semibold flex items-center gap-1">
                  <AlertCircle className="h-3 w-3 inline" /> {fieldErrors.name}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0b1c30] mb-1.5">
                Alamat Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-[#434655]" />
                <input
                  id="register-email-input"
                  name="email"
                  data-testid="register-email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: undefined }));
                  }}
                  placeholder="nama@email.com"
                  className={`w-full rounded-xl bg-[#f8f9ff] border ${
                    fieldErrors.email ? 'border-rose-500 ring-1 ring-rose-500' : 'border-[#c3c6d7]'
                  } pl-10 pr-3 py-2.5 text-xs text-[#0b1c30] placeholder-slate-400 focus:outline-none focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/20 transition-all`}
                />
              </div>
              {fieldErrors.email && (
                <p id="email-error-text" className="mt-1 text-[11px] text-rose-600 font-semibold flex items-center gap-1">
                  <AlertCircle className="h-3 w-3 inline" /> {fieldErrors.email}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0b1c30] mb-1.5">
                Kata Sandi
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-[#434655]" />
                <input
                  id="register-password-input"
                  name="password"
                  data-testid="register-password"
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: undefined }));
                  }}
                  placeholder="Minimal 8 karakter"
                  className={`w-full rounded-xl bg-[#f8f9ff] border ${
                    fieldErrors.password ? 'border-rose-500 ring-1 ring-rose-500' : 'border-[#c3c6d7]'
                  } pl-10 pr-3 py-2.5 text-xs text-[#0b1c30] placeholder-slate-400 focus:outline-none focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/20 transition-all`}
                />
              </div>
              {fieldErrors.password && (
                <p id="password-error-text" className="mt-1 text-[11px] text-rose-600 font-semibold flex items-center gap-1">
                  <AlertCircle className="h-3 w-3 inline" /> {fieldErrors.password}
                </p>
              )}
            </div>

            <div className="pt-2">
              <button
                id="register-submit-btn"
                data-testid="register-submit"
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-[#004ac6] hover:bg-[#2563eb] text-white py-3 rounded-xl font-bold text-xs shadow-lg shadow-[#004ac6]/20 hover:shadow-xl transition-all disabled:opacity-50"
              >
                <span>{loading ? 'Mendaftarkan Akun...' : 'Daftar Akun Auroka'}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </form>

          <div className="pt-4 border-t border-[#c3c6d7]/40 space-y-1 text-center">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#006c49]">
              <ShieldCheck className="h-4 w-4" />
              <span>Multi-Tenant User Isolation Standard</span>
            </div>
          </div>

          <div className="text-center pt-2">
            <p className="text-xs text-[#434655]">
              Sudah memiliki akun?{' '}
              <Link
                href="/login"
                className="font-bold text-[#004ac6] hover:underline"
              >
                Masuk di Sini
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
