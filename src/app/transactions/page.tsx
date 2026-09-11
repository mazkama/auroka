'use client';

import React, { useState } from 'react';
import { AppLayout } from '@/presentation/components/layout/AppLayout';
import { useFinance } from '@/presentation/hooks/useFinance';
import { RecentTransactions } from '@/presentation/components/features/RecentTransactions';
import { AddTransactionModal } from '@/presentation/components/features/AddTransactionModal';
import { ConfirmModal } from '@/presentation/components/ui/ConfirmModal';
import { Transaction } from '@/domain/entities/transaction';
import { Plus, ReceiptText } from 'lucide-react';

export default function TransactionsPage() {
  const {
    transactions,
    wallets,
    addTransaction,
    editTransaction,
    removeTransaction,
  } = useFinance();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transactionToEdit, setTransactionToEdit] = useState<Transaction | null>(null);
  const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null);

  const handleOpenAdd = () => {
    setTransactionToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (tx: Transaction) => {
    setTransactionToEdit(tx);
    setIsModalOpen(true);
  };

  const handleDeleteRequest = (id: string) => {
    const target = transactions.find((t) => t.id === id);
    if (target) {
      setTransactionToDelete(target);
    }
  };

  return (
    <AppLayout onOpenAddModal={handleOpenAdd}>
      <div className="space-y-6">
        {/* Top Header Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-[#e2e8f0] rounded-2xl p-5 shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <ReceiptText className="h-5 w-5 text-[#004ac6]" />
              <h1 className="text-xl sm:text-2xl font-extrabold text-[#0b1c30] tracking-tight">
                Histori & Manajemen Transaksi
              </h1>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-[#004ac6]/10 text-[#004ac6] px-2.5 py-0.5 rounded-full border border-[#004ac6]/20">
                CRUD Aktif
              </span>
            </div>
            <p className="text-xs text-[#434655] mt-1">
              Kelola, edit, atau hapus transaksi. Saldo dompet akan disesuaikan otomatis mengikuti kaidah buku besar.
            </p>
          </div>

          <button
            onClick={handleOpenAdd}
            className="flex items-center justify-center gap-2 bg-[#004ac6] hover:bg-[#2563eb] text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md shadow-[#004ac6]/20 active:scale-95 cursor-pointer shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span>+ Catat Transaksi</span>
          </button>
        </div>

        {/* Transaction History with Edit and Delete capability */}
        <RecentTransactions
          transactions={transactions}
          onEdit={handleOpenEdit}
          onDelete={handleDeleteRequest}
        />
      </div>

      {/* Add / Edit Transaction Modal */}
      <AddTransactionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setTransactionToEdit(null);
        }}
        wallets={wallets}
        onAddTransaction={addTransaction}
        transactionToEdit={transactionToEdit}
        onEditTransaction={editTransaction}
      />

      {/* Animated Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={transactionToDelete !== null}
        onClose={() => setTransactionToDelete(null)}
        onConfirm={async () => {
          if (transactionToDelete) {
            await removeTransaction(transactionToDelete.id);
          }
        }}
        title="Hapus Transaksi?"
        itemName={transactionToDelete?.title}
        description="Jejak audit transaksi ini akan dihapus dan saldo rekening dompet terkait akan disesuaikan secara otomatis."
        confirmText="Hapus Transaksi"
        cancelText="Batal"
      />
    </AppLayout>
  );
}

