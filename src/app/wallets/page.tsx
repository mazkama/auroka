'use client';

import React, { useState } from 'react';
import { AppLayout } from '@/presentation/components/layout/AppLayout';
import { useFinance } from '@/presentation/hooks/useFinance';
import { formatRupiah } from '@/presentation/utils/formatters';
import { WalletCards } from '@/presentation/components/features/WalletCards';
import { BudgetAllocationChart } from '@/presentation/components/features/BudgetAllocationChart';
import { BudgetProgress } from '@/presentation/components/features/BudgetProgress';
import { AddTransactionModal } from '@/presentation/components/features/AddTransactionModal';
import { WalletModal } from '@/presentation/components/features/WalletModal';
import { Wallet } from '@/domain/entities/wallet';
import {
  Wallet as WalletIcon,
  PieChart as PieIcon,
  Plus,
  TrendingDown,
  Coins,
  ShieldCheck,
} from 'lucide-react';

export default function WalletsPage() {
  const {
    summary,
    wallets,
    budgets,
    addTransaction,
    addWallet,
    editWallet,
    removeWallet,
    addBudget,
    editBudget,
    removeBudget,
  } = useFinance();

  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [walletToEdit, setWalletToEdit] = useState<Wallet | null>(null);

  const monthlyIncome = summary?.monthlyIncome || 18500000;
  const totalBalance = summary?.totalBalance || wallets.reduce((acc, w) => acc + w.balance, 0);
  const totalBudgeted = budgets.reduce((acc, b) => acc + b.limitAmount, 0);
  const totalSpent = budgets.reduce((acc, b) => acc + b.spentAmount, 0);

  const handleEditWallet = (wallet: Wallet) => {
    setWalletToEdit(wallet);
    setIsWalletModalOpen(true);
  };

  const handleAddWallet = () => {
    setWalletToEdit(null);
    setIsWalletModalOpen(true);
  };

  const handleSaveWallet = async (walletData: Partial<Wallet>) => {
    if (walletToEdit) {
      await editWallet(walletToEdit.id, walletData);
    } else {
      await addWallet(walletData);
    }
  };

  const handleDeleteWallet = async (id: string) => {
    if (
      confirm(
        'Apakah Anda yakin ingin menghapus dompet ini? Semua transaksi terkait akan kehilangan referensinya.'
      )
    ) {
      await removeWallet(id);
    }
  };

  return (
    <AppLayout onOpenAddModal={() => setIsTransactionModalOpen(true)}>
      <div className="space-y-6">
        {/* Top Header Banner with Stats */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white border border-[#e2e8f0] rounded-2xl p-5 shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-[#0b1c30] tracking-tight">
                Dompet Digital & Anggaran
              </h1>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-[#004ac6]/10 text-[#004ac6] px-2.5 py-0.5 rounded-full border border-[#004ac6]/20">
                Pusat Rekening
              </span>
            </div>
            <p className="text-xs text-[#434655] mt-1">
              Kelola seluruh rekening dompet, uang tunai, dan batas alokasi anggaran bulanan secara terpadu.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Quick Stat Pill 1: Total Saldo */}
            <div className="flex items-center gap-2 bg-[#f8fafc] border border-[#e2e8f0] px-3.5 py-2 rounded-xl text-xs">
              <WalletIcon className="h-4 w-4 text-[#004ac6]" />
              <div>
                <span className="text-[#64748b] block text-[10px] font-medium leading-none">Total Saldo</span>
                <span className="font-bold font-mono text-[#0b1c30] text-sm">
                  {formatRupiah(totalBalance)}
                </span>
              </div>
            </div>

            {/* Quick Stat Pill 2: Total Anggaran */}
            <div className="flex items-center gap-2 bg-[#f8fafc] border border-[#e2e8f0] px-3.5 py-2 rounded-xl text-xs">
              <PieIcon className="h-4 w-4 text-[#006c49]" />
              <div>
                <span className="text-[#64748b] block text-[10px] font-medium leading-none">Limit Anggaran</span>
                <span className="font-bold font-mono text-[#006c49] text-sm">
                  {formatRupiah(totalBudgeted)}
                </span>
              </div>
            </div>

            {/* Action Button: Tambah Dompet */}
            <button
              onClick={handleAddWallet}
              className="flex items-center gap-1.5 bg-[#004ac6] hover:bg-[#2563eb] text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-md shadow-[#004ac6]/20 transition-all ml-auto lg:ml-0"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Tambah Dompet</span>
            </button>
          </div>
        </div>

        {/* Section 1: Dompet Digital & Rekening Bank */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <Coins className="h-4 w-4 text-[#004ac6]" />
              <h2 className="text-base font-bold text-[#0f172a]">Daftar Rekening & Dompet ({wallets.length})</h2>
            </div>
            <span className="text-xs text-[#64748b]">The Ledger System</span>
          </div>

          <WalletCards
            wallets={wallets}
            onEdit={handleEditWallet}
            onDelete={handleDeleteWallet}
          />
        </div>

        {/* Section 2: Alokasi & Pengawasan Anggaran Bulanan */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <PieIcon className="h-4 w-4 text-[#004ac6]" />
              <h2 className="text-base font-bold text-[#0f172a]">Alokasi & Pengawasan Anggaran Bulanan</h2>
            </div>
            <span className="text-[10px] font-bold bg-[#006c49]/10 text-[#006c49] border border-[#006c49]/20 px-2 py-0.5 rounded-full">
              Bulan Berjalan
            </span>
          </div>

          {/* Donut Chart Visualizing 100% Monthly Income Breakdown */}
          <BudgetAllocationChart budgets={budgets} monthlyIncome={monthlyIncome} />

          {/* Detailed Category Progress Bars & Full CRUD Controls */}
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

      <WalletModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
        onSave={handleSaveWallet}
        walletToEdit={walletToEdit}
      />
    </AppLayout>
  );
}
