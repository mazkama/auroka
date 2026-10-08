'use client';

import React, { useState } from 'react';
import { AppLayout } from '@/presentation/components/layout/AppLayout';
import { useFinance } from '@/presentation/hooks/useFinance';
import { RecentTransactions } from '@/presentation/components/features/RecentTransactions';
import { AddTransactionModal } from '@/presentation/components/features/AddTransactionModal';
import { ConfirmModal } from '@/presentation/components/ui';
import { PageHeader, Button } from '@/presentation/components/ui';
import { Transaction } from '@/domain/entities/transaction';
import { useTranslation } from '@/presentation/i18n/I18nContext';
import { Plus, ReceiptText } from 'lucide-react';

export default function TransactionsPage() {
  const { t } = useTranslation();
  const {
    transactions,
    wallets,
    addTransaction,
    editTransaction,
    removeTransaction,
    transferFunds,
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
        <PageHeader
          title={t('transactions.title')}
          subtitle={t('transactions.subtitle')}
          icon={ReceiptText}
          actions={
            <Button
              variant="primary"
              size="md"
              leftIcon={<Plus className="h-4 w-4" />}
              onClick={handleOpenAdd}
            >
              {t('transactions.add')}
            </Button>
          }
        />

        {/* Transaction History with Edit and Delete capability */}
        <RecentTransactions
          transactions={transactions}
          onEdit={handleOpenEdit}
          onDelete={handleDeleteRequest}
        />
      </div>

      {/* Reusable Add / Edit Transaction Modal */}
      <AddTransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddTransaction={addTransaction}
        onEditTransaction={editTransaction}
        onTransferFunds={transferFunds}
        wallets={wallets}
        transactionToEdit={transactionToEdit}
      />

      {/* Reusable Delete Confirmation Dialog */}
      <ConfirmModal
        isOpen={!!transactionToDelete}
        onClose={() => setTransactionToDelete(null)}
        onConfirm={() => {
          if (transactionToDelete) {
            removeTransaction(transactionToDelete.id);
            setTransactionToDelete(null);
          }
        }}
        title="Hapus Transaksi Ini?"
        itemName={transactionToDelete?.title}
        description={`Anda yakin ingin menghapus transaksi "${transactionToDelete?.title}" sebesar Rp ${transactionToDelete?.totalAmount?.toLocaleString(
          'id-ID'
        )}? Saldo dompet akan disesuaikan kembali secara otomatis.`}
        confirmText="Ya, Hapus"
        cancelText="Batal"
        variant="danger"
      />
    </AppLayout>
  );
}
