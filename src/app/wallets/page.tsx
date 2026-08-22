'use client';

import React, { useState } from 'react';
import { AppLayout } from '@/presentation/components/layout/AppLayout';
import { useFinance } from '@/presentation/hooks/useFinance';
import { WalletCards } from '@/presentation/components/features/WalletCards';
import { BudgetProgress } from '@/presentation/components/features/BudgetProgress';
import { AddTransactionModal } from '@/presentation/components/features/AddTransactionModal';
import { WalletModal } from '@/presentation/components/features/WalletModal';
import { Wallet } from '@/domain/entities/wallet';
import { Plus } from 'lucide-react';

export default function WalletsPage() {
  const {
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
    if (confirm('Apakah Anda yakin ingin menghapus dompet ini? Semua transaksi terkait akan kehilangan referensinya.')) {
      await removeWallet(id);
    }
  };

  return (
    <AppLayout onOpenAddModal={() => setIsTransactionModalOpen(true)}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-[#0b1c30] tracking-tight">Manajemen Dompet</h1>
            <p className="text-sm text-[#434655]">Kelola rekening bank, e-wallet, dan uang tunai Anda</p>
          </div>
          <button
            onClick={handleAddWallet}
            className="flex items-center gap-2 bg-[#004ac6] hover:bg-[#2563eb] text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Tambah Dompet</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <WalletCards 
              wallets={wallets} 
              onEdit={handleEditWallet}
              onDelete={handleDeleteWallet}
            />
          </div>
          <div>
            <BudgetProgress
              budgets={budgets}
              onAddBudget={addBudget}
              onEditBudget={editBudget}
              onDeleteBudget={removeBudget}
            />
          </div>
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
