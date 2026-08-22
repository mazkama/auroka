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
import {
  TrendingUp,
  TrendingDown,
  Scale,
  RefreshCw,
  PlusCircle,
  ShieldCheck,
} from 'lucide-react';

export default function DashboardPage() {
  const {
    summary,
    transactions,
    wallets,
    budgets,
    refreshData,
    addTransaction,
  } = useFinance();

  const [isModalOpen, setIsModalOpen] = useState(false);

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
                Ledger Live
              </span>
            </div>
            <p className="text-xs text-[#434655] mt-1">
              Pratinjau real-time total kekayaan likuid, pemasukan, pengeluaran & anggaran.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={refreshData}
              className="flex items-center gap-1.5 bg-[#eff4ff] hover:bg-[#dce9ff] text-[#004ac6] border border-[#c3c6d7]/50 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Sync Data</span>
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 bg-[#004ac6] hover:bg-[#2563eb] text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md shadow-[#004ac6]/20"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Catat Transaksi</span>
            </button>
          </div>
        </div>

        {/* Liquid Balance & Stats Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Card: Liquid Balance */}
          <div className="lg:col-span-2 bg-gradient-to-br from-[#004ac6] via-[#0053db] to-[#1e40af] rounded-3xl p-8 sm:p-10 text-white shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[260px] group">
            {/* Elegant Background Motif */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none transition-transform duration-700 group-hover:scale-110"></div>
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-white/5 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4 pointer-events-none"></div>
            
            <svg 
              className="absolute inset-0 w-full h-full opacity-[0.12] pointer-events-none text-white" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <pattern id="pattern-artdeco-arch" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
                  <g fill="none" stroke="currentColor" strokeWidth="1.2">
                    <circle cx="30" cy="0" r="7" />
                    <circle cx="30" cy="0" r="14" />
                    <circle cx="30" cy="0" r="21" />
                    <circle cx="30" cy="0" r="28" />

                    <circle cx="30" cy="60" r="7" />
                    <circle cx="30" cy="60" r="14" />
                    <circle cx="30" cy="60" r="21" />
                    <circle cx="30" cy="60" r="28" />

                    <circle cx="0" cy="30" r="7" />
                    <circle cx="0" cy="30" r="14" />
                    <circle cx="0" cy="30" r="21" />
                    <circle cx="0" cy="30" r="28" />

                    <circle cx="60" cy="30" r="7" />
                    <circle cx="60" cy="30" r="14" />
                    <circle cx="60" cy="30" r="21" />
                    <circle cx="60" cy="30" r="28" />

                    <circle cx="30" cy="30" r="7" />
                    <circle cx="30" cy="30" r="14" />
                    <circle cx="30" cy="30" r="21" />
                    <circle cx="30" cy="30" r="28" />
                  </g>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#pattern-artdeco-arch)" />
            </svg>

            <div className="flex justify-between items-start relative z-10">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#6cf8bb] shadow-[0_0_10px_rgba(108,248,187,0.8)] animate-pulse"></span>
                  <h3 className="font-extrabold text-sm sm:text-base text-white tracking-wide">
                    Total Liquid Balance
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-white/70 font-medium">
                  Dari {wallets.length} Akun Terhubung (The Ledger System)
                </p>
              </div>

              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-3.5 py-1.5 rounded-full text-xs font-bold shadow-sm">
                <ShieldCheck className="h-4 w-4 text-white" />
                <span>Multi-Tenant Ready</span>
              </div>
            </div>

            <div className="relative z-10 pt-8 sm:pt-12">
              <span className="text-sm font-semibold text-white/70 uppercase tracking-widest mb-1 block">
                Total Kekayaan Bersih
              </span>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-mono tracking-tighter text-white drop-shadow-md">
                {formatRupiah(summary?.totalBalance || 0)}
              </h2>
            </div>
          </div>

          {/* Income & Expense Side Stats */}
          <div className="flex flex-col gap-4">
            <div className="bg-white border border-[#e2e8f0] rounded-2xl p-5 shadow-sm flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 text-[#434655] mb-1">
                  <TrendingUp className="h-4 w-4 text-[#006c49]" />
                  <h4 className="text-xs font-bold">Pemasukan Bulan Ini</h4>
                </div>
                <p className="text-xl font-bold font-mono text-[#006c49]">
                  {formatRupiah(summary?.monthlyIncome || 0)}
                </p>
              </div>
            </div>

            <div className="bg-white border border-[#e2e8f0] rounded-2xl p-5 shadow-sm flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 text-[#434655] mb-1">
                  <TrendingDown className="h-4 w-4 text-[#ba1a1a]" />
                  <h4 className="text-xs font-bold">Pengeluaran Bulan Ini</h4>
                </div>
                <p className="text-xl font-bold font-mono text-[#ba1a1a]">
                  {formatRupiah(summary?.monthlyExpense || 0)}
                </p>
              </div>
            </div>

            <div className="bg-white border border-[#e2e8f0] rounded-2xl p-5 shadow-sm flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 text-[#434655] mb-1">
                  <Scale className="h-4 w-4 text-[#784b00]" />
                  <h4 className="text-xs font-bold">Net Cash Flow</h4>
                </div>
                <p className="text-xl font-bold font-mono text-[#784b00]">
                  {formatRupiah(summary?.netCashFlow || 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Chart Section */}
        <div className="grid grid-cols-1">
          <CashFlowChart />
        </div>

        {/* Connected Wallets & Recent Transactions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <WalletCards wallets={wallets} />
            <RecentTransactions transactions={transactions} />
          </div>

          <div className="space-y-6">
            <BudgetProgress budgets={budgets} />
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
