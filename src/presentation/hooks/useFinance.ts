'use client';

import { useState, useEffect, useCallback } from 'react';
import { container } from '@/infrastructure/di/container';
import { FinancialSummary } from '@/domain/entities/summary';
import { Transaction, CreateTransactionDTO } from '@/domain/entities/transaction';
import { Wallet } from '@/domain/entities/wallet';
import { Budget } from '@/domain/entities/budget';

export function useFinance() {
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [summaryRes, transactionsRes, walletsRes, budgetsRes] =
        await Promise.all([
          container.getFinancialSummaryUseCase().execute(),
          container.getTransactionsUseCase().execute(),
          container.getWalletsUseCase().execute(),
          container.getBudgetsUseCase().execute('2026-08'),
        ]);

      setSummary(summaryRes);
      setTransactions(transactionsRes);
      setWallets(walletsRes);
      setBudgets(budgetsRes);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : 'Gagal memuat data keuangan'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const addTransaction = async (dto: CreateTransactionDTO) => {
    try {
      await container.getCreateTransactionUseCase().execute(dto);
      await fetchData(); // Refresh data
    } catch (err: unknown) {
      throw new Error(
        err instanceof Error ? err.message : 'Gagal menambah transaksi'
      );
    }
  };

  const addWallet = async (walletData: Partial<Wallet>) => {
    try {
      await container.getCreateWalletUseCase().execute(walletData);
      await fetchData();
    } catch (err: unknown) {
      throw new Error(err instanceof Error ? err.message : 'Gagal menambah dompet');
    }
  };

  const editWallet = async (id: string, walletData: Partial<Wallet>) => {
    try {
      await container.getUpdateWalletUseCase().execute(id, walletData);
      await fetchData();
    } catch (err: unknown) {
      throw new Error(err instanceof Error ? err.message : 'Gagal mengubah dompet');
    }
  };

  const removeWallet = async (id: string) => {
    try {
      await container.getDeleteWalletUseCase().execute(id);
      await fetchData();
    } catch (err: unknown) {
      throw new Error(err instanceof Error ? err.message : 'Gagal menghapus dompet');
    }
  };

  return {
    summary,
    transactions,
    wallets,
    budgets,
    loading,
    error,
    refreshData: fetchData,
    addTransaction,
    addWallet,
    editWallet,
    removeWallet,
  };
}
