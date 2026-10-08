'use client';

import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/presentation/components/layout/AppLayout';
import { useFinance } from '@/presentation/hooks/useFinance';
import { formatRupiah } from '@/presentation/utils/formatters';
import { WalletCards } from '@/presentation/components/features/WalletCards';
import { BudgetAllocationChart } from '@/presentation/components/features/BudgetAllocationChart';
import { BudgetProgress } from '@/presentation/components/features/BudgetProgress';
import { AddTransactionModal } from '@/presentation/components/features/AddTransactionModal';
import { WalletModal } from '@/presentation/components/features/WalletModal';
import { ConfirmModal, PageHeader, Button } from '@/presentation/components/ui';
import { Wallet } from '@/domain/entities/wallet';
import { useTranslation } from '@/presentation/i18n/I18nContext';
import {
  Wallet as WalletIcon,
  PieChart as PieIcon,
  Plus,
  TrendingDown,
  Coins,
  ShieldCheck,
} from 'lucide-react';

export default function WalletsPage() {
  const { t } = useTranslation();
  const {
    summary,
    wallets,
    budgets,
    addTransaction,
    transferFunds,
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
  const [walletToDelete, setWalletToDelete] = useState<Wallet | null>(null);
  const [highlightBudget, setHighlightBudget] = useState(false);

  useEffect(() => {
    const handleHashNavigation = () => {
      if (typeof window !== 'undefined' && window.location.hash === '#anggaran-bulanan') {
        const element = document.getElementById('anggaran-bulanan');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          setHighlightBudget(true);
          const timer = setTimeout(() => {
            setHighlightBudget(false);
          }, 2500);
          return () => clearTimeout(timer);
        }
      }
    };

    const timeout = setTimeout(handleHashNavigation, 150);
    window.addEventListener('hashchange', handleHashNavigation);

    return () => {
      clearTimeout(timeout);
      window.removeEventListener('hashchange', handleHashNavigation);
    };
  }, []);

  const monthlyIncome = summary?.monthlyIncome || 0;
  const totalBalance = summary?.totalBalance || wallets.reduce((acc, w) => acc + w.balance, 0);
  const totalBudgeted = budgets.reduce((acc, b) => acc + b.limitAmount, 0);
  const totalSpentInBudgets = budgets.reduce((acc, b) => acc + b.spentAmount, 0);
  const budgetUtilization = totalBudgeted > 0 ? Math.round((totalSpentInBudgets / totalBudgeted) * 100) : 0;

  const handleOpenAddWallet = () => {
    setWalletToEdit(null);
    setIsWalletModalOpen(true);
  };

  const handleOpenEditWallet = (wallet: Wallet) => {
    setWalletToEdit(wallet);
    setIsWalletModalOpen(true);
  };

  const handleDeleteWalletRequest = (id: string) => {
    const target = wallets.find((w) => w.id === id);
    if (target) {
      setWalletToDelete(target);
    }
  };

  const handleSaveWallet = async (walletData: Partial<Wallet>) => {
    if (walletToEdit) {
      await editWallet(walletToEdit.id, walletData);
    } else {
      await addWallet(walletData);
    }
  };

  return (
    <AppLayout onOpenAddModal={() => setIsTransactionModalOpen(true)}>
      <div className="space-y-8">
        {/* Top Header Banner */}
        <PageHeader
          title={t('wallets.title')}
          subtitle={t('wallets.subtitle')}
          icon={WalletIcon}
          actions={
            <Button
              variant="primary"
              size="md"
              leftIcon={<Plus className="h-4 w-4" />}
              onClick={handleOpenAddWallet}
            >
              {t('wallets.add')}
            </Button>
          }
        />

        {/* Top Metrics Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white border border-[#e2e8f0] rounded-2xl p-5 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold text-[#64748b]">Total Saldo Semua Akun</span>
              <h3 className="text-xl sm:text-2xl font-black text-[#0b1c30] tracking-tight font-mono">
                {formatRupiah(totalBalance)}
              </h3>
              <p className="text-[11px] text-[#004ac6] font-semibold flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>{wallets.length} Akun & Rekening Aktif</span>
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#eff4ff] text-[#004ac6] flex items-center justify-center shrink-0">
              <Coins className="h-6 w-6" />
            </div>
          </div>

          <div className="bg-white border border-[#e2e8f0] rounded-2xl p-5 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold text-[#64748b]">Total Batas Anggaran</span>
              <h3 className="text-xl sm:text-2xl font-black text-[#006c49] tracking-tight font-mono">
                {formatRupiah(totalBudgeted)}
              </h3>
              <p className="text-[11px] text-[#64748b]">
                {budgets.length} Kategori Anggaran Aktif
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#006c49]/10 text-[#006c49] flex items-center justify-center shrink-0">
              <PieIcon className="h-6 w-6" />
            </div>
          </div>

          <div className="bg-white border border-[#e2e8f0] rounded-2xl p-5 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold text-[#64748b]">Penggunaan Budget</span>
              <h3 className="text-xl sm:text-2xl font-black text-[#0b1c30] tracking-tight font-mono">
                {budgetUtilization}%
              </h3>
              <p className="text-[11px] text-[#ba1a1a] font-semibold flex items-center gap-1">
                <TrendingDown className="h-3.5 w-3.5" />
                <span>{formatRupiah(totalSpentInBudgets)} terpakai</span>
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#eff4ff] text-[#004ac6] flex items-center justify-center shrink-0">
              <TrendingDown className="h-6 w-6" />
            </div>
          </div>
        </div>

        {/* Section 1: Dompet Digital & Rekening Bank */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-[#0b1c30] tracking-tight">
                Daftar Rekening & Dompet
              </h2>
              <p className="text-xs text-[#434655] mt-0.5">
                Pilih atau kelola saldo awal rekening Anda untuk akurasi arus kas.
              </p>
            </div>
          </div>

          <WalletCards
            wallets={wallets}
            onEdit={handleOpenEditWallet}
            onDelete={handleDeleteWalletRequest}
          />
        </section>

        {/* Section 2: Budget Allocation & Tracking */}
        <section
          id="anggaran-bulanan"
          className={`space-y-6 pt-4 border-t border-[#c3c6d7]/30 transition-all duration-700 rounded-2xl p-2 ${
            highlightBudget ? 'ring-4 ring-[#004ac6]/30 bg-[#eff4ff]/40' : ''
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <PieIcon className="h-5 w-5 text-[#004ac6]" />
                <h2 className="text-lg sm:text-xl font-extrabold text-[#0b1c30] tracking-tight">
                  Alokasi Anggaran Bulanan
                </h2>
              </div>
              <p className="text-xs text-[#434655] mt-0.5">
                Pastikan seluruh porsi pengeluaran Anda terkontrol dan tidak melebihi batas yang direncanakan.
              </p>
            </div>
          </div>

          {/* Visualization & Detail Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
            <div className="lg:col-span-1 h-full">
              <BudgetAllocationChart
                budgets={budgets}
                monthlyIncome={monthlyIncome}
              />
            </div>

            <div className="lg:col-span-2 h-full">
              <BudgetProgress
                budgets={budgets}
                onAddBudget={addBudget}
                onEditBudget={editBudget}
                onDeleteBudget={removeBudget}
              />
            </div>
          </div>
        </section>
      </div>

      {/* Reusable Wallet Create / Edit Modal */}
      <WalletModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
        onSave={handleSaveWallet}
        walletToEdit={walletToEdit}
      />

      {/* Quick Add Transaction Modal */}
      <AddTransactionModal
        isOpen={isTransactionModalOpen}
        onClose={() => setIsTransactionModalOpen(false)}
        onAddTransaction={addTransaction}
        onTransferFunds={transferFunds}
        wallets={wallets}
      />

      {/* Delete Wallet Confirmation Modal */}
      <ConfirmModal
        isOpen={!!walletToDelete}
        onClose={() => setWalletToDelete(null)}
        onConfirm={() => {
          if (walletToDelete) {
            removeWallet(walletToDelete.id);
            setWalletToDelete(null);
          }
        }}
        title="Hapus Rekening Dompet?"
        itemName={walletToDelete?.name}
        description={`Anda yakin ingin menghapus rekening "${walletToDelete?.name}"? Transaksi yang terhubung dengan dompet ini tetap tersimpan namun dompet tidak akan muncul lagi di daftar.`}
        confirmText="Ya, Hapus Dompet"
        cancelText="Batal"
        variant="danger"
      />
    </AppLayout>
  );
}
