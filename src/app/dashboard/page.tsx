'use client';

import React, { useState } from 'react';
import { AppLayout } from '@/presentation/components/layout/AppLayout';
import { useFinance } from '@/presentation/hooks/useFinance';
import { formatRupiah } from '@/presentation/utils/formatters';
import { WalletCards } from '@/presentation/components/features/WalletCards';
import { RecentTransactions } from '@/presentation/components/features/RecentTransactions';
import { BudgetProgress } from '@/presentation/components/features/BudgetProgress';
import { AddTransactionModal } from '@/presentation/components/features/AddTransactionModal';
import { CashFlowChart } from '@/presentation/components/features/CashFlowChart';
import { apiGetMe } from '@/infrastructure/api/authApi';
import {
  TrendingUp,
  TrendingDown,
  Scale,
  ShieldCheck,
} from 'lucide-react';

export default function DashboardPage() {
  const {
    summary,
    transactions,
    wallets,
    budgets,
    addTransaction,
    transferFunds,
  } = useFinance();

  const [isModalOpen, setIsModalOpen] = useState(false);

  React.useEffect(() => {
    // Tangkap token dari URL parameter setelah callback dari backend Golang
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const token = params.get('token');
      
      if (token) {
        // Simpan JWT token
        localStorage.setItem('auroka_token', token);
        
        // Ambil profil data user dari backend
        apiGetMe()
          .then((user) => {
            if (user) {
              localStorage.setItem('auroka_user', JSON.stringify(user));
              window.dispatchEvent(new Event('auroka:profile-updated'));
            }
          })
          .catch(() => {
            if (!localStorage.getItem('auroka_user')) {
              localStorage.setItem('auroka_user', JSON.stringify({
                id: 'google-auth',
                name: 'Pengguna Auroka',
                email: 'user@auroka.id'
              }));
              window.dispatchEvent(new Event('auroka:profile-updated'));
            }
          });
        
        // Bersihkan URL dari parameter token demi keamanan dan estetika
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, []);

  const totalBalance = summary?.totalBalance || 0;
  const monthlyIncome = summary?.monthlyIncome || 0;
  const monthlyExpense = summary?.monthlyExpense || 0;
  const netCashFlow = summary?.netCashFlow || 0;
  const savingsRate = summary?.savingsRate || 0;

  return (
    <AppLayout onOpenAddModal={() => setIsModalOpen(true)}>
      <div className="space-y-6">
        {/* Top Header Banner Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-[#e2e8f0] rounded-2xl p-5 shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-[#0b1c30] tracking-tight">
                Ringkasan Keuangan Auroka
              </h1>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-[#004ac6]/10 text-[#004ac6] px-2.5 py-0.5 rounded-full border border-[#004ac6]/20">
                Live Update
              </span>
            </div>
            <p className="text-xs text-[#434655] mt-1">
              Pratinjau real-time total saldo kas, pemasukan, pengeluaran, dan anggaran bulanan.
            </p>
          </div>
        </div>

        {/* Liquid Balance & Stats Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Card: Liquid Balance */}
          <div className="lg:col-span-2 bg-gradient-to-br from-[#004ac6] via-[#0053db] to-[#1e40af] rounded-3xl p-8 sm:p-10 text-white shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[260px] group">
            {/* Elegant Background Motif */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none transition-transform duration-700 group-hover:scale-110"></div>
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-white/5 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4 pointer-events-none"></div>

            {/* 1. Unstretched Batik Kawung Outline Pattern with Left, Right & Downward Soft Gradient Fade */}
            <svg
              className="absolute inset-0 w-full h-full opacity-[0.14] pointer-events-none text-white"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <pattern id="pattern-kawung-bold" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
                  <g fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="0" cy="0" r="42.42" />
                    <circle cx="60" cy="0" r="42.42" />
                    <circle cx="0" cy="60" r="42.42" />
                    <circle cx="60" cy="60" r="42.42" />
                    <circle cx="30" cy="30" r="42.42" />
                  </g>
                </pattern>

                {/* Soft 2D radial gradient mask: subtly fades out on left edge, right edge, and bottom */}
                <radialGradient id="batik-fade-gradient" cx="50%" cy="20%" r="62%" fx="50%" fy="20%">
                  <stop offset="0%" stopColor="white" stopOpacity="1" />
                  <stop offset="40%" stopColor="white" stopOpacity="0.95" />
                  <stop offset="70%" stopColor="white" stopOpacity="0.45" />
                  <stop offset="95%" stopColor="white" stopOpacity="0" />
                </radialGradient>
                <mask id="motif-fade-mask">
                  <rect width="100%" height="100%" fill="url(#batik-fade-gradient)" />
                </mask>
              </defs>
              <rect width="100%" height="100%" fill="url(#pattern-kawung-bold)" mask="url(#motif-fade-mask)" />
            </svg>

            {/* 2. Soft Bottom-Up Gradient Glow Mask */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none"></div>

            {/* Top row: Label & Security badge */}
            <div className="flex items-center justify-between z-10">
              <span className="text-xs uppercase tracking-widest text-blue-200 font-bold">
                Saldo Likuid Terpadu
              </span>
              <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-bold border border-white/15">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-300" />
                <span>Tersinkronisasi</span>
              </div>
            </div>

            {/* Middle: Big Balance Display */}
            <div className="my-6 z-10">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight font-mono text-white">
                {formatRupiah(totalBalance)}
              </h2>
              <p className="text-xs text-blue-200 mt-2">
                Akumulasi seluruh rekening bank, e-wallet, dan uang kas fisik
              </p>
            </div>

            {/* Bottom row: Mini indicators */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-white/15 z-10 text-xs">
              <div>
                <span className="text-blue-200 block text-[10px]">Pemasukan Bulan Ini</span>
                <span className="font-bold text-white font-mono text-sm">
                  {formatRupiah(monthlyIncome)}
                </span>
              </div>
              <div>
                <span className="text-blue-200 block text-[10px]">Pengeluaran Bulan Ini</span>
                <span className="font-bold text-rose-200 font-mono text-sm">
                  {formatRupiah(monthlyExpense)}
                </span>
              </div>
              <div>
                <span className="text-blue-200 block text-[10px]">Arus Kas Bersih</span>
                <span
                  className={`font-bold font-mono text-sm ${
                    netCashFlow >= 0 ? 'text-emerald-300' : 'text-rose-300'
                  }`}
                >
                  {formatRupiah(netCashFlow)}
                </span>
              </div>
              <div>
                <span className="text-blue-200 block text-[10px]">Tingkat Tabungan</span>
                <span className="font-bold text-emerald-300 font-mono text-sm">
                  {savingsRate}%
                </span>
              </div>
            </div>
          </div>

          {/* Quick Metrics Column */}
          <div className="space-y-4 flex flex-col justify-between">
            {/* Metric 1: Pemasukan */}
            <div className="bg-white border border-[#e2e8f0] rounded-2xl p-5 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-[#64748b]">Total Pemasukan</span>
                <h3 className="text-xl sm:text-2xl font-black text-[#006c49] mt-1 font-mono">
                  {formatRupiah(monthlyIncome)}
                </h3>
                <p className="text-[11px] text-[#006c49] flex items-center gap-1 mt-1 font-semibold">
                  <TrendingUp className="h-3 w-3" />
                  <span>Arus kas masuk bulan ini</span>
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-[#006c49]/10 text-[#006c49] flex items-center justify-center shrink-0">
                <TrendingUp className="h-6 w-6" />
              </div>
            </div>

            {/* Metric 2: Pengeluaran */}
            <div className="bg-white border border-[#e2e8f0] rounded-2xl p-5 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-[#64748b]">Total Pengeluaran</span>
                <h3 className="text-xl sm:text-2xl font-black text-[#ba1a1a] mt-1 font-mono">
                  {formatRupiah(monthlyExpense)}
                </h3>
                <p className="text-[11px] text-[#ba1a1a] flex items-center gap-1 mt-1 font-semibold">
                  <TrendingDown className="h-3 w-3" />
                  <span>Arus kas keluar bulan ini</span>
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-[#ba1a1a]/10 text-[#ba1a1a] flex items-center justify-center shrink-0">
                <TrendingDown className="h-6 w-6" />
              </div>
            </div>

            {/* Metric 3: Arus Kas Bersih */}
            <div className="bg-white border border-[#e2e8f0] rounded-2xl p-5 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-[#64748b]">Surplus / Defisit</span>
                <h3
                  className={`text-xl sm:text-2xl font-black mt-1 font-mono ${
                    netCashFlow >= 0 ? 'text-[#006c49]' : 'text-[#ba1a1a]'
                  }`}
                >
                  {formatRupiah(netCashFlow)}
                </h3>
                <p className="text-[11px] text-[#64748b] flex items-center gap-1 mt-1">
                  <Scale className="h-3 w-3" />
                  <span>{netCashFlow >= 0 ? 'Surplus anggaran aman' : 'Defisit keuangan'}</span>
                </p>
              </div>
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                  netCashFlow >= 0
                    ? 'bg-[#006c49]/10 text-[#006c49]'
                    : 'bg-[#ba1a1a]/10 text-[#ba1a1a]'
                }`}
              >
                <Scale className="h-6 w-6" />
              </div>
            </div>
          </div>
        </div>

        {/* Cash Flow Trend Analytics Chart */}
        <div>
          <CashFlowChart />
        </div>

        {/* Connected Wallets, Budget & Recent Transactions */}
        <div className="space-y-6">
          {/* Wallets & Balances */}
          <div>
            <WalletCards wallets={wallets} />
          </div>

          {/* Monthly Budget Allocation Tracking */}
          <div>
            <BudgetProgress
              budgets={budgets}
              showManageLink={true}
            />
          </div>

          {/* Recent Ledger Transactions */}
          <div>
            <RecentTransactions
              transactions={transactions}
              maxDisplay={8}
              showManageLink={true}
            />
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
