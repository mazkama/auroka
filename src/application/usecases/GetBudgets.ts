import { IBudgetRepository } from '@/domain/repositories/IBudgetRepository';
import { Budget } from '@/domain/entities/budget';

export class GetBudgetsUseCase {
  constructor(private budgetRepo: IBudgetRepository) {}

  async execute(month: string): Promise<Budget[]> {
    return await this.budgetRepo.getBudgetsByMonth(month);
  }
}
