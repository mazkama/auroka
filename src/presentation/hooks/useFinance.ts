'use client';

import { useState, useEffect, useCallback } from 'react';
import { container } from '@/infrastructure/di/container';
import { FinancialSummary } from '@/domain/entities/summary';
import { Transaction, CreateTransactionDTO, UpdateTransactionDTO } from '@/domain/entities/transaction';
import { Wallet } from '@/domain/entities/wallet';
import { Budget, CreateBudgetDTO, UpdateBudgetDTO } from '@/domain/entities/budget';
import { Bill, CreateBillDTO, UpdateBillDTO } from '@/domain/entities/bill';

export function useFinance() {
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const getCurrentMonthStr = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  };

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const currentMonth = getCurrentMonthStr();
      const [summaryRes, transactionsRes, walletsRes, budgetsRes, billsRes] =
        await Promise.all([
          container.getFinancialSummaryUseCase().execute(),
          container.getTransactionsUseCase().execute(),
          container.getWalletsUseCase().execute(),
          container.getBudgetsUseCase().execute(currentMonth),
          container.getBillsUseCase().execute(),
        ]);

      setSummary(
        summaryRes || {
          totalBalance: 0,
          monthlyIncome: 0,
          monthlyExpense: 0,
          savingsRate: 0,
          netCashFlow: 0,
        }
      );
      setTransactions(Array.isArray(transactionsRes) ? transactionsRes : []);
      setWallets(Array.isArray(walletsRes) ? walletsRes : []);
      setBudgets(Array.isArray(budgetsRes) ? budgetsRes : []);
      setBills(Array.isArray(billsRes) ? billsRes : []);
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

    const handleAuthChange = () => {
      fetchData();
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('auroka:auth-changed', handleAuthChange);
      window.addEventListener('storage', handleAuthChange);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('auroka:auth-changed', handleAuthChange);
        window.removeEventListener('storage', handleAuthChange);
      }
    };
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

  const editTransaction = async (id: string, dto: UpdateTransactionDTO) => {
    try {
      await container.getUpdateTransactionUseCase().execute(id, dto);
      await fetchData();
    } catch (err: unknown) {
      throw new Error(
        err instanceof Error ? err.message : 'Gagal mengubah transaksi'
      );
    }
  };

  const removeTransaction = async (id: string) => {
    try {
      await container.getDeleteTransactionUseCase().execute(id);
      await fetchData();
    } catch (err: unknown) {
      throw new Error(
        err instanceof Error ? err.message : 'Gagal menghapus transaksi'
      );
    }
  };

  const transferFunds = async (
    sourceWalletId: string,
    destWalletId: string,
    amount: number,
    adminFee?: number,
    note?: string,
    date?: string
  ) => {
    try {
      await container.getTransferFundsUseCase().execute({
        sourceWalletId,
        destWalletId,
        amount,
        adminFee,
        note,
        transactionDate: date,
      });
      await fetchData();
    } catch (err: unknown) {
      throw new Error(
        err instanceof Error ? err.message : 'Gagal melakukan transfer dana'
      );
    }
  };

  const addWallet = async (dto: Partial<Wallet>) => {
    try {
      await container.getCreateWalletUseCase().execute(dto);
      await fetchData();
    } catch (err: unknown) {
      throw new Error(
        err instanceof Error ? err.message : 'Gagal menambah dompet'
      );
    }
  };

  const editWallet = async (id: string, dto: Partial<Wallet>) => {
    try {
      await container.getUpdateWalletUseCase().execute(id, dto);
      await fetchData();
    } catch (err: unknown) {
      throw new Error(
        err instanceof Error ? err.message : 'Gagal mengubah dompet'
      );
    }
  };

  const removeWallet = async (id: string) => {
    try {
      await container.getDeleteWalletUseCase().execute(id);
      await fetchData();
    } catch (err: unknown) {
      throw new Error(
        err instanceof Error ? err.message : 'Gagal menghapus dompet'
      );
    }
  };

  const addBudget = async (dto: CreateBudgetDTO) => {
    try {
      await container.getCreateBudgetUseCase().execute(dto);
      await fetchData();
    } catch (err: unknown) {
      throw new Error(
        err instanceof Error ? err.message : 'Gagal menambah anggaran'
      );
    }
  };

  const editBudget = async (dto: UpdateBudgetDTO) => {
    try {
      await container.getUpdateBudgetUseCase().execute(dto);
      await fetchData();
    } catch (err: unknown) {
      throw new Error(
        err instanceof Error ? err.message : 'Gagal mengubah anggaran'
      );
    }
  };

  const removeBudget = async (id: string) => {
    try {
      await container.getDeleteBudgetUseCase().execute(id);
      await fetchData();
    } catch (err: unknown) {
      throw new Error(
        err instanceof Error ? err.message : 'Gagal menghapus anggaran'
      );
    }
  };

  const addBill = async (dto: CreateBillDTO) => {
    try {
      await container.getCreateBillUseCase().execute(dto);
      await fetchData();
    } catch (err: unknown) {
      throw new Error(
        err instanceof Error ? err.message : 'Gagal menambah tagihan'
      );
    }
  };

  const editBill = async (dto: UpdateBillDTO) => {
    try {
      await container.getUpdateBillUseCase().execute(dto);
      await fetchData();
    } catch (err: unknown) {
      throw new Error(
        err instanceof Error ? err.message : 'Gagal mengubah tagihan'
      );
    }
  };

  const removeBill = async (id: string) => {
    try {
      await container.getDeleteBillUseCase().execute(id);
      await fetchData();
    } catch (err: unknown) {
      throw new Error(
        err instanceof Error ? err.message : 'Gagal menghapus tagihan'
      );
    }
  };

  const payBill = async (id: string | number) => {
    try {
      await container.getPayBillUseCase().execute(String(id));
      await fetchData();
    } catch (err: unknown) {
      throw new Error(
        err instanceof Error ? err.message : 'Gagal membayar tagihan'
      );
    }
  };

  return {
    summary,
    transactions,
    wallets,
    budgets,
    bills,
    loading,
    error,
    refreshData: fetchData,
    addTransaction,
    editTransaction,
    removeTransaction,
    transferFunds,
    addWallet,
    editWallet,
    removeWallet,
    addBudget,
    editBudget,
    removeBudget,
    addBill,
    editBill,
    removeBill,
    payBill,
  };
}
