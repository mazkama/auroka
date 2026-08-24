'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { mockLogin } from '@/infrastructure/mock/mockAuth';
import { Coins, Lock, Mail, ArrowRight, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  const handleFillDemo = () => {
    setEmail('user@auroka.id');
    setPassword('password123');
    setError('');
    setFieldErrors({});
  };

  const validateForm = () => {
    const errors: { email?: string; password?: string } = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email.trim()) {
      errors.email = 'Alamat email wajib diisi.';
    } else if (!emailRegex.test(email.trim())) {
      errors.email = 'Format alamat email tidak valid.';
    }

    if (!password) {
      errors.password = 'Kata sandi wajib diisi.';
    } else if (password.length < 6) {
      errors.password = 'Kata sandi minimal 6 karakter.';
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
      const user = await mockLogin(email, password);
      localStorage.setItem('auroka_user', JSON.stringify(user));
      router.push('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Gagal melakukan login');
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
          Masuk ke Akun Auroka Anda
        </h2>
        <p className="text-xs text-[#434655]">
          Kelola saldo likuid & transaksi berbasis Clean Architecture
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
                Alamat Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-[#434655]" />
                <input
                  id="login-email-input"
                  name="email"
                  data-testid="login-email"
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
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-[#0b1c30]">
                  Kata Sandi
                </label>
                <a
                  href="#"
                  className="text-[11px] font-semibold text-[#004ac6] hover:underline"
                >
                  Lupa password?
                </a>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-[#434655]" />
                <input
                  id="login-password-input"
                  name="password"
                  data-testid="login-password"
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: undefined }));
                  }}
                  placeholder="••••••••"
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
                id="login-submit-btn"
                data-testid="login-submit"
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-[#004ac6] hover:bg-[#2563eb] text-white py-3 rounded-xl font-bold text-xs shadow-lg shadow-[#004ac6]/20 hover:shadow-xl transition-all disabled:opacity-50"
              >
                <span>{loading ? 'Memverifikasi Sesi...' : 'Masuk ke Dashboard'}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </form>

          {/* Quick Demo Autofill Helper */}
          <div className="pt-4 border-t border-[#c3c6d7]/40 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#006c49]">
                <CheckCircle2 className="h-4 w-4" />
                <span>Demo Account Quick Access</span>
              </div>
              <button
                id="autofill-demo-btn"
                data-testid="autofill-demo"
                type="button"
                onClick={handleFillDemo}
                className="text-[11px] font-bold text-[#004ac6] hover:underline bg-[#004ac6]/10 px-2.5 py-1 rounded-lg transition-colors"
              >
                Gunakan Kredensial Demo
              </button>
            </div>
            <p className="text-[11px] text-[#434655] leading-relaxed">
              Klik &quot;Gunakan Kredensial Demo&quot; di atas untuk mengisi akun mock (<code className="bg-slate-100 px-1 py-0.5 rounded">user@auroka.id</code> / <code className="bg-slate-100 px-1 py-0.5 rounded">password123</code>).
            </p>
          </div>

          <div className="text-center pt-2">
            <p className="text-xs text-[#434655]">
              Belum memiliki akun Auroka?{' '}
              <Link
                href="/register"
                className="font-bold text-[#004ac6] hover:underline"
              >
                Daftar Akun Baru
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
