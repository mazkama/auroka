'use client';

import React, { useState } from 'react';
import { useFinance } from '@/presentation/hooks/useFinance';
import { StatCard } from '../ui/StatCard';
import { WalletCards } from './WalletCards';
import { RecentTransactions } from './RecentTransactions';
import { BudgetProgress } from './BudgetProgress';
import { AddTransactionModal } from './AddTransactionModal';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Scale,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';

export const DashboardOverview: React.FC = () => {
  const {
    summary,
    transactions,
    wallets,
    budgets,
    loading,
    error,
    refreshData,
    addTransaction,
  } = useFinance();

  const [isModalOpen, setIsModalOpen] = useState(false);

  if (loading && !summary) {
    return (
      <div className="flex h-96 w-full items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <RefreshCw className="h-8 w-8 animate-spin text-indigo-500" />
          <p className="text-sm font-medium">Memuat data manajemen keuangan...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl bg-rose-500/10 border border-rose-500/20 p-6 text-center space-y-3">
        <AlertTriangle className="h-10 w-10 text-rose-400 mx-auto" />
        <h3 className="text-base font-bold text-white">Gagal Memuat Data</h3>
        <p className="text-xs text-rose-300">{error}</p>
        <button
          onClick={refreshData}
          className="rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-500"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner Info */}
      <div className="rounded-2xl bg-gradient-to-r from-indigo-900/40 via-purple-900/20 to-slate-900 border border-indigo-500/20 p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">
              Ringkasan Keuangan Personal
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Sistem Clean Architecture terhubung ke Mock Data Layer. Backend API dapat di-switch dengan mudah.
            </p>
          </div>
          <button
            onClick={refreshData}
            className="flex items-center gap-2 self-start md:self-auto rounded-xl bg-slate-800/80 px-3.5 py-2 text-xs font-medium text-slate-300 border border-slate-700/60 hover:bg-slate-700 transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Sync Mock Data</span>
          </button>
        </div>
      </div>

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Saldo Bersih"
          amount={summary?.totalBalance || 0}
          icon={Wallet}
          trend="Gabungan 5 Dompet/Rekening"
          gradient="from-indigo-900/40 to-slate-900"
        />
        <StatCard
          title="Pemasukan Bulan Ini"
          amount={summary?.monthlyIncome || 0}
          icon={TrendingUp}
          trend="+12% dari bulan lalu"
          trendType="positive"
          gradient="from-emerald-900/30 to-slate-900"
        />
        <StatCard
          title="Pengeluaran Bulan Ini"
          amount={summary?.monthlyExpense || 0}
          icon={TrendingDown}
          trend="-5% dari bulan lalu"
          trendType="positive"
          gradient="from-rose-900/30 to-slate-900"
        />
        <StatCard
          title="Net Cash Flow"
          amount={summary?.netCashFlow || 0}
          icon={Scale}
          trend={`Savings Rate: ${summary?.savingsRate || 0}%`}
          trendType="positive"
          gradient="from-purple-900/30 to-slate-900"
        />
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <WalletCards wallets={wallets} />
          <RecentTransactions transactions={transactions} />
        </div>

        <div className="space-y-6">
          <BudgetProgress budgets={budgets} />
        </div>
      </div>

      <AddTransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        wallets={wallets}
        onAddTransaction={addTransaction}
      />
    </div>
  );
};
