import { Budget } from '../entities/budget';

export interface IBudgetRepository {
  getBudgetsByMonth(month: string): Promise<Budget[]>;
}
