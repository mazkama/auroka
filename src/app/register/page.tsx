'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { mockRegister } from '@/infrastructure/mock/mockAuth';
import { Coins, Lock, Mail, User, ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
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
            <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 p-3 text-xs text-[#ba1a1a]">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#0b1c30] mb-1.5">
                Nama Lengkap
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-[#434655]" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Alan Mazkama"
                  className="w-full rounded-xl bg-[#f8f9ff] border border-[#c3c6d7] pl-10 pr-3 py-2.5 text-xs text-[#0b1c30] placeholder-slate-400 focus:outline-none focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/20 transition-all"
                />
              </div>
            </div>

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
              <label className="block text-xs font-bold text-[#0b1c30] mb-1.5">
                Kata Sandi
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-[#434655]" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimal 8 karakter"
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
