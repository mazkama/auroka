'use client';

import React, { useState } from 'react';
import { AppLayout } from '@/presentation/components/layout/AppLayout';
import { useFinance } from '@/presentation/hooks/useFinance';
import { RecentTransactions } from '@/presentation/components/features/RecentTransactions';
import { AddTransactionModal } from '@/presentation/components/features/AddTransactionModal';

export default function TransactionsPage() {
  const { transactions, wallets, addTransaction } = useFinance();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <AppLayout onOpenAddModal={() => setIsModalOpen(true)}>
      <div className="space-y-6">
        <RecentTransactions transactions={transactions} />
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
