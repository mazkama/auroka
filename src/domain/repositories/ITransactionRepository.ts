import { Transaction, CreateTransactionDTO, UpdateTransactionDTO, TransferDTO } from '../entities/transaction';
import { FinancialSummary } from '../entities/summary';

export interface ITransactionRepository {
  getAllTransactions(): Promise<Transaction[]>;
  getTransactionById(id: string): Promise<Transaction | null>;
  createTransaction(dto: CreateTransactionDTO): Promise<Transaction>;
  updateTransaction(id: string, dto: UpdateTransactionDTO): Promise<Transaction>;
  deleteTransaction(id: string): Promise<void>;
  transferFunds(dto: TransferDTO): Promise<{ sourceTransactionId: string; destTransactionId: string; amount: number; adminFee?: number }>;
  getFinancialSummary(): Promise<FinancialSummary>;
}

