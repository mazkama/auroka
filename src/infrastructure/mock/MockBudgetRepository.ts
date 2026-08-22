import { IBudgetRepository } from '@/domain/repositories/IBudgetRepository';
import { Budget } from '@/domain/entities/budget';
import { INITIAL_BUDGETS } from './mockData';

export class MockBudgetRepository implements IBudgetRepository {
  private budgets: Budget[] = [...INITIAL_BUDGETS];

  async getBudgetsByMonth(month: string): Promise<Budget[]> {
    await new Promise((res) => setTimeout(res, 150));
    return this.budgets.filter((b) => b.month === month);
  }
}
