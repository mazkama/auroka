import { ITransactionRepository } from '@/domain/repositories/ITransactionRepository';
import { Transaction, CreateTransactionDTO, UpdateTransactionDTO, TransferDTO } from '@/domain/entities/transaction';
import { FinancialSummary } from '@/domain/entities/summary';
import { apiFetch } from './apiClient';

export class ApiTransactionRepository implements ITransactionRepository {
  async getAllTransactions(): Promise<Transaction[]> {
    return await apiFetch<Transaction[]>('/transactions');
  }

  async getTransactionById(id: string): Promise<Transaction | null> {
    try {
      return await apiFetch<Transaction>(`/transactions/${id}`);
    } catch {
      return null;
    }
  }

  async createTransaction(dto: CreateTransactionDTO): Promise<Transaction> {
    return await apiFetch<Transaction>('/transactions', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  }

  async updateTransaction(id: string, dto: UpdateTransactionDTO): Promise<Transaction> {
    return await apiFetch<Transaction>(`/transactions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(dto),
    });
  }

  async deleteTransaction(id: string): Promise<void> {
    await apiFetch(`/transactions/${id}`, {
      method: 'DELETE',
    });
  }

  async transferFunds(dto: TransferDTO): Promise<{ sourceTransactionId: string; destTransactionId: string; amount: number; adminFee?: number }> {
    return await apiFetch<{ sourceTransactionId: string; destTransactionId: string; amount: number; adminFee?: number }>('/transactions/transfer', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  }

  async getFinancialSummary(): Promise<FinancialSummary> {
    return await apiFetch<FinancialSummary>('/analytics/summary');
  }
}
