'use client';

import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/presentation/components/layout/Navbar';
import {
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  Lock,
  Layers,
  Users,
  Coins,
  Receipt,
  Star,
  LogIn,
  UserPlus,
  LayoutDashboard,
  UserCheck,
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#f8f9ff] text-[#0b1c30] flex flex-col font-sans overflow-hidden">
      <Navbar />

      {/* Hero Section */}
      <section id="hero" className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center relative">
        {/* Background Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-[#dbe1ff]/60 rounded-full blur-3xl -z-10 pointer-events-none opacity-70"></div>

        {/* Platform Badge */}
        <div className="inline-flex items-center gap-2 bg-[#dce9ff] border border-[#c3c6d7]/50 rounded-full px-4 py-1.5 mb-6 shadow-sm">
          <span className="w-2.5 h-2.5 rounded-full bg-[#006c49] animate-pulse"></span>
          <span className="text-xs font-semibold text-[#004ac6]">
            Terintegrasi Clean Architecture & Ledger System
          </span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#0b1c30] mb-6 max-w-4xl mx-auto leading-tight">
          Kelola Keuangan Lebih Mudah<br className="hidden sm:block" />
          <span className="bg-gradient-to-r from-[#004ac6] via-[#2563eb] to-[#784b00] bg-clip-text text-transparent">
            Kapan Saja, Di Mana Saja.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg text-[#434655] max-w-2xl mx-auto mb-8 leading-relaxed">
          Auroka membantu Anda memahami uang, membangun kebiasaan finansial sehat, dan bertumbuh menuju kemakmuran seperti emas yang semakin bernilai.
        </p>

        {/* User Badges */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10">
          <div className="flex -space-x-3">
            <div className="w-9 h-9 rounded-full bg-[#2563eb] text-white flex items-center justify-center font-bold text-xs border-2 border-[#f8f9ff]">
              AD
            </div>
            <div className="w-9 h-9 rounded-full bg-[#006c49] text-white flex items-center justify-center font-bold text-xs border-2 border-[#f8f9ff]">
              MZ
            </div>
            <div className="w-9 h-9 rounded-full bg-[#784b00] text-white flex items-center justify-center font-bold text-xs border-2 border-[#f8f9ff]">
              RK
            </div>
            <div className="w-9 h-9 rounded-full bg-[#6366f1] text-white flex items-center justify-center font-bold text-xs border-2 border-[#f8f9ff]">
              SK
            </div>
          </div>
          <div className="flex items-center gap-2 bg-[#e5eeff] rounded-full px-3 py-1 border border-[#c3c6d7]/40 text-xs font-semibold text-[#434655]">
            <Users className="h-4 w-4 text-[#004ac6]" />
            <span>1,000+ Pengguna Aktif Auroka</span>
          </div>
        </div>

        {/* CTA Buttons (Register & Login Actions) */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/register"
            className="w-full sm:w-auto bg-[#004ac6] hover:bg-[#2563eb] text-white px-8 py-3.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#004ac6]/25 hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <UserPlus className="h-4 w-4" />
            <span>Daftar Akun Baru</span>
          </Link>

          <Link
            href="/login"
            className="w-full sm:w-auto bg-white border border-[#004ac6] text-[#004ac6] px-8 py-3.5 rounded-xl font-bold text-sm hover:bg-[#eff4ff] transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            <LogIn className="h-4 w-4" />
            <span>Masuk Akun Demo</span>
          </Link>
        </div>

        <div className="mt-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#434655] hover:text-[#004ac6] transition-colors"
          >
            <LayoutDashboard className="h-3.5 w-3.5" />
            <span>Atau pratinjau Dashboard langsung tanpa login →</span>
          </Link>
        </div>
      </section>

      {/* App Interactive Mockup Section */}
      <section id="mockup" className="px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto pb-24">
        <Link href="/dashboard" className="block group">
          <div className="bg-white rounded-2xl border border-[#c3c6d7] shadow-2xl overflow-hidden group-hover:border-[#004ac6] transition-all duration-300 transform group-hover:scale-[1.01]">
            {/* Browser Header */}
            <div className="bg-[#eff4ff] border-b border-[#c3c6d7]/60 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
              </div>
              <div className="mx-auto bg-white border border-[#c3c6d7]/60 rounded-lg px-4 py-1 text-xs text-[#434655] font-mono text-center w-full max-w-xs flex items-center justify-center gap-2 shadow-inner">
                <Lock className="h-3.5 w-3.5 text-[#004ac6]" />
                <span>auroka.id/dashboard</span>
              </div>
              <span className="text-[11px] font-bold text-[#004ac6] group-hover:underline">
                Klik untuk Buka →
              </span>
            </div>

            {/* Dashboard Preview Content */}
            <div className="p-6 sm:p-8 bg-[#f8f9ff] space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Main Liquid Balance Card */}
                <div className="md:col-span-2 bg-gradient-to-br from-[#004ac6] via-[#0053db] to-[#2563eb] rounded-2xl p-6 text-white shadow-xl relative overflow-hidden flex flex-col justify-between">
                  <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                  <div className="flex justify-between items-start mb-8 relative z-10">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#6cf8bb]"></span>
                        <h3 className="font-bold text-sm text-white/90">
                          Total Liquid Balance (The Ledger System)
                        </h3>
                      </div>
                      <p className="text-xs text-white/80">
                        5 Akun Terhubung (BCA, Mandiri, GoPay, Binance, Tunai)
                      </p>
                    </div>
                    <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold">
                      Live Dashboard
                    </span>
                  </div>

                  <div className="relative z-10">
                    <span className="text-xs text-white/80 uppercase font-semibold tracking-wider">
                      Total Kekayaan Likuid
                    </span>
                    <h2 className="text-3xl sm:text-4xl font-extrabold font-mono tracking-tight text-white mt-1">
                      Rp 88.300.000
                    </h2>
                  </div>
                </div>

                {/* Side Stats Cards */}
                <div className="flex flex-col gap-4">
                  <div className="bg-white border border-[#c3c6d7]/60 rounded-xl p-4 shadow-sm flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-[#434655] mb-1">
                        <TrendingUp className="h-4 w-4 text-[#006c49]" />
                        <span className="text-xs font-bold">Pemasukan</span>
                      </div>
                      <p className="text-lg font-bold font-mono text-[#006c49]">
                        Rp 25.000.000
                      </p>
                    </div>
                  </div>

                  <div className="bg-white border border-[#c3c6d7]/60 rounded-xl p-4 shadow-sm flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-[#434655] mb-1">
                        <TrendingDown className="h-4 w-4 text-[#ba1a1a]" />
                        <span className="text-xs font-bold">Pengeluaran</span>
                      </div>
                      <p className="text-lg font-bold font-mono text-[#ba1a1a]">
                        Rp 10.570.000
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sample Transaction Item Preview */}
              <div className="bg-white rounded-xl border border-[#c3c6d7]/60 p-4 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#0b1c30]">Makan Malam Resto & Cafe</span>
                  <span className="font-mono font-bold text-[#ba1a1a]">- Rp 320.000</span>
                </div>
                <div className="flex items-center gap-2 text-[11px]">
                  <span className="bg-[#004ac6]/10 text-[#004ac6] font-semibold px-2 py-0.2 rounded">
                    Makan & Minum
                  </span>
                  <span className="flex items-center gap-1 bg-amber-500/10 text-amber-600 font-semibold px-2 py-0.2 rounded">
                    <UserCheck className="h-3 w-3" />
                    <span>Nitip Dimas (Rp 100.000)</span>
                  </span>
                  <span className="flex text-amber-400">★★★★★</span>
                </div>
              </div>
            </div>
          </div>
        </Link>
      </section>

      {/* Core Features Showcase */}
      <section id="features" className="py-16 bg-white border-y border-[#c3c6d7]/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <h2 className="text-3xl font-extrabold text-[#0b1c30] tracking-tight">
              Fitur Keuangan Enterprise Auroka
            </h2>
            <p className="text-sm text-[#434655]">
              Dirancang khusus untuk menghadirkan integritas data finansial akurat dan transparan.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[#f8f9ff] border border-[#c3c6d7]/50 rounded-2xl p-6 space-y-4 shadow-sm hover:border-[#004ac6]/40 transition-colors">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#004ac6]/10 text-[#004ac6]">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-[#0b1c30]">
                The Ledger System
              </h3>
              <p className="text-xs text-[#434655] leading-relaxed">
                Saldo adalah hasil penjumlahan (`SUM`) dari riwayat transaksi Debit & Kredit. Mencegah manipulasi statis dan menjamin jejak audit 100% sempurna.
              </p>
            </div>

            <div className="bg-[#f8f9ff] border border-[#c3c6d7]/50 rounded-2xl p-6 space-y-4 shadow-sm hover:border-[#004ac6]/40 transition-colors">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#006c49]/10 text-[#006c49]">
                <Receipt className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-[#0b1c30]">
                Header-Detail & Nitip Teman
              </h3>
              <p className="text-xs text-[#434655] leading-relaxed">
                Catat transaksi hingga granularitas per item. Sertakan opsi Nitip Teman beserta nama teman dan Worthiness Rating 1-5 ⭐.
              </p>
            </div>

            <div className="bg-[#f8f9ff] border border-[#c3c6d7]/50 rounded-2xl p-6 space-y-4 shadow-sm hover:border-[#004ac6]/40 transition-colors">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#784b00]/10 text-[#784b00]">
                <Layers className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-[#0b1c30]">
                Clean Architecture Standard
              </h3>
              <p className="text-xs text-[#434655] leading-relaxed">
                Pemisahan domain entitas, use cases, dan UI. Mendukung migrasi instan dari Mock Data ke Server Golang/PostgreSQL API.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section id="about" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-gradient-to-br from-[#004ac6]/5 to-[#784b00]/10 rounded-full blur-3xl -z-10 pointer-events-none"></div>
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-[#784b00]/10 to-[#d97706]/10 rounded-2xl border border-[#784b00]/20 shadow-sm mb-2">
            <Coins className="h-8 w-8 text-[#784b00]" />
          </div>
          <div className="space-y-4">
            <h2 className="text-sm font-bold tracking-widest text-[#004ac6] uppercase">
              Filosofi Auroka
            </h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-[#0b1c30] tracking-tight">
              Pahami Uang, <br className="sm:hidden" />
              <span className="bg-gradient-to-r from-[#784b00] to-[#d97706] bg-clip-text text-transparent">Bangun Masa Depan.</span>
            </h3>
          </div>
          <p className="text-base sm:text-lg text-[#434655] leading-relaxed max-w-2xl mx-auto">
            Terinspirasi dari kata <strong>Aurum</strong> (Emas), Auroka hadir tidak sekadar sebagai alat pencatat. Kami membangun fondasi untuk membantu Anda memahami aliran uang, membentuk kebiasaan finansial yang sehat secara konsisten, dan bertumbuh menuju kemakmuran yang sejati bak emas yang semakin bernilai.
          </p>
          <div className="pt-4 flex items-center justify-center gap-2 text-sm font-bold text-[#0b1c30]">
            <span className="w-8 h-[2px] bg-gradient-to-r from-transparent to-[#784b00]/50 rounded-full"></span>
            <span>Dari Kebiasaan Kecil Menuju Kemakmuran</span>
            <span className="w-8 h-[2px] bg-gradient-to-l from-transparent to-[#784b00]/50 rounded-full"></span>
          </div>
        </div>
      </section>

      {/* Call To Action Footer Banner */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="rounded-3xl bg-gradient-to-r from-[#004ac6] via-[#2563eb] to-[#006c49] p-8 sm:p-12 text-white shadow-2xl text-center space-y-6 relative overflow-hidden">
          <div className="max-w-2xl mx-auto space-y-4 relative z-10">
            <h2 className="text-3xl font-extrabold tracking-tight">
              Siap Memulai Perjalanan Keuangan Anda?
            </h2>
            <p className="text-sm text-white/90">
              Daftar akun baru sekarang atau masuk menggunakan akun demo terintegrasi.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link
                href="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white text-[#004ac6] px-8 py-3.5 rounded-xl font-bold text-sm shadow-lg hover:bg-[#eff4ff] transition-all transform hover:scale-105"
              >
                <UserPlus className="h-4 w-4" />
                <span>Daftar Akun Baru</span>
              </Link>
              <Link
                href="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#004ac6] border border-white/40 text-white px-8 py-3.5 rounded-xl font-bold text-sm hover:bg-white/10 transition-colors"
              >
                <LogIn className="h-4 w-4" />
                <span>Masuk Akun Demo</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-[#c3c6d7]/50 py-8 px-4 sm:px-6 lg:px-8 text-center text-xs text-[#434655]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Coins className="h-4 w-4 text-[#004ac6]" />
            <span className="font-bold text-[#0b1c30]">Auroka Projects 2026</span>
          </div>
          <p>© 2026 Auroka. All rights reserved. Pahami Uang, Bangun Masa Depan.</p>
        </div>
      </footer>
    </div>
  );
}
