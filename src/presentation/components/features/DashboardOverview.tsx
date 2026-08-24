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
    addTransaction,
  } = useFinance();

  const [isModalOpen, setIsModalOpen] = useState(false);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
          <p className="text-sm font-medium text-slate-400">
            Sinkronisasi data buku besar (Ledger)...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-500/20 bg-red-950/20 p-6 text-red-400">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-6 w-6" />
          <h3 className="font-semibold">Terjadi Kesalahan Sistem</h3>
        </div>
        <p className="mt-2 text-sm text-red-400/80">{error}</p>
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
