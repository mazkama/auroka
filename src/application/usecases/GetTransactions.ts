import { ITransactionRepository } from '@/domain/repositories/ITransactionRepository';
import { Transaction } from '@/domain/entities/transaction';

export class GetTransactionsUseCase {
  constructor(private transactionRepo: ITransactionRepository) {}

  async execute(): Promise<Transaction[]> {
    return await this.transactionRepo.getAllTransactions();
  }
}
