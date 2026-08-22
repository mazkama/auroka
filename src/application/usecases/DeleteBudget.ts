import { IBudgetRepository } from '@/domain/repositories/IBudgetRepository';

export class DeleteBudgetUseCase {
  constructor(private budgetRepo: IBudgetRepository) {}

  async execute(budgetId: string): Promise<boolean> {
    if (!budgetId) {
      throw new Error('ID Anggaran tidak valid');
    }
    return await this.budgetRepo.deleteBudget(budgetId);
  }
}
