import { Transaction, CreateTransactionDTO, UpdateTransactionDTO } from '../entities/transaction';
import { FinancialSummary } from '../entities/summary';

export interface ITransactionRepository {
  getAllTransactions(): Promise<Transaction[]>;
  getTransactionById(id: string): Promise<Transaction | null>;
  createTransaction(dto: CreateTransactionDTO): Promise<Transaction>;
  updateTransaction(id: string, dto: UpdateTransactionDTO): Promise<Transaction>;
  deleteTransaction(id: string): Promise<void>;
  getFinancialSummary(): Promise<FinancialSummary>;
}

