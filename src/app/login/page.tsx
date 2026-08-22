'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { mockLogin } from '@/infrastructure/mock/mockAuth';
import { Coins, Lock, Mail, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('user@auroka.id');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
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
            <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 p-3 text-xs text-[#ba1a1a]">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#0b1c30] mb-1.5">
                Alamat Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-[#434655]" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  className="w-full rounded-xl bg-[#f8f9ff] border border-[#c3c6d7] pl-10 pr-3 py-2.5 text-xs text-[#0b1c30] placeholder-slate-400 focus:outline-none focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/20 transition-all"
                />
              </div>
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
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl bg-[#f8f9ff] border border-[#c3c6d7] pl-10 pr-3 py-2.5 text-xs text-[#0b1c30] placeholder-slate-400 focus:outline-none focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/20 transition-all"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
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
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#006c49]">
              <CheckCircle2 className="h-4 w-4" />
              <span>Demo Account Quick Access</span>
            </div>
            <p className="text-[11px] text-[#434655] leading-relaxed">
              Form telah diisi dengan kredensial akun mock. Klik tombol &quot;Masuk ke Dashboard&quot; di atas untuk membuka antarmuka.
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
