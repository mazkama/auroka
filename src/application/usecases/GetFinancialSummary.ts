import { ITransactionRepository } from '@/domain/repositories/ITransactionRepository';
import { FinancialSummary } from '@/domain/entities/summary';

export class GetFinancialSummaryUseCase {
  constructor(private transactionRepo: ITransactionRepository) {}

  async execute(): Promise<FinancialSummary> {
    return await this.transactionRepo.getFinancialSummary();
  }
}
