'use client';

import React, { useState } from 'react';
import { AppLayout } from '@/presentation/components/layout/AppLayout';
import { useFinance } from '@/presentation/hooks/useFinance';
import { formatRupiah } from '@/presentation/utils/formatters';
import { BudgetAllocationChart } from '@/presentation/components/features/BudgetAllocationChart';
import { BudgetProgress } from '@/presentation/components/features/BudgetProgress';
import { AddTransactionModal } from '@/presentation/components/features/AddTransactionModal';
import { PieChart, Plus, Wallet, ShieldCheck, ArrowRight, Target } from 'lucide-react';

export default function BudgetsPage() {
  const {
    summary,
    budgets,
    wallets,
    addTransaction,
    addBudget,
    editBudget,
    removeBudget,
  } = useFinance();

  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);

  const monthlyIncome = summary?.monthlyIncome || 18500000;
  const totalBudgeted = budgets.reduce((acc, b) => acc + b.limitAmount, 0);
  const totalSpent = budgets.reduce((acc, b) => acc + b.spentAmount, 0);
  const unallocatedAmount = Math.max(0, monthlyIncome - totalBudgeted);

  return (
    <AppLayout onOpenAddModal={() => setIsTransactionModalOpen(true)}>
      <div className="space-y-6">
        {/* Top Header Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-[#e2e8f0] rounded-2xl p-5 shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-[#0b1c30] tracking-tight">
                Manajemen Anggaran Bulanan
              </h1>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-[#004ac6]/10 text-[#004ac6] px-2.5 py-0.5 rounded-full border border-[#004ac6]/20">
                Agustus 2026
              </span>
            </div>
            <p className="text-xs text-[#434655] mt-1">
              Alokasi persentase gaji bulanan dan pemantauan batas pengeluaran kategori
            </p>
          </div>

          {/* Stat Summary Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="bg-[#f8fafc] border border-[#e2e8f0] px-3.5 py-2 rounded-xl text-xs">
              <span className="text-[#64748b] block text-[10px] font-medium">Gaji Bulanan</span>
              <span className="font-bold font-mono text-[#006c49] text-sm">
                {formatRupiah(monthlyIncome)}
              </span>
            </div>
            <div className="bg-[#f8fafc] border border-[#e2e8f0] px-3.5 py-2 rounded-xl text-xs">
              <span className="text-[#64748b] block text-[10px] font-medium">Total Anggaran</span>
              <span className="font-bold font-mono text-[#004ac6] text-sm">
                {formatRupiah(totalBudgeted)}
              </span>
            </div>
            <div className="bg-[#f8fafc] border border-[#e2e8f0] px-3.5 py-2 rounded-xl text-xs">
              <span className="text-[#64748b] block text-[10px] font-medium">Total Terpakai</span>
              <span className="font-bold font-mono text-[#ba1a1a] text-sm">
                {formatRupiah(totalSpent)}
              </span>
            </div>
          </div>
        </div>

        {/* Donut Chart Visualizing 100% Monthly Income Breakdown */}
        <BudgetAllocationChart budgets={budgets} monthlyIncome={monthlyIncome} />

        {/* Detailed Category Progress Bars & Full CRUD Controls */}
        <div className="grid grid-cols-1">
          <BudgetProgress
            budgets={budgets}
            onAddBudget={addBudget}
            onEditBudget={editBudget}
            onDeleteBudget={removeBudget}
          />
        </div>
      </div>

      <AddTransactionModal
        isOpen={isTransactionModalOpen}
        onClose={() => setIsTransactionModalOpen(false)}
        wallets={wallets}
        onAddTransaction={addTransaction}
      />
    </AppLayout>
  );
}
