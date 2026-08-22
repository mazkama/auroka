import { Transaction, CreateTransactionDTO } from '../entities/transaction';
import { FinancialSummary } from '../entities/summary';

export interface ITransactionRepository {
  getAllTransactions(): Promise<Transaction[]>;
  getTransactionById(id: string): Promise<Transaction | null>;
  createTransaction(dto: CreateTransactionDTO): Promise<Transaction>;
  getFinancialSummary(): Promise<FinancialSummary>;
}
