import { Budget, CreateBudgetDTO, UpdateBudgetDTO } from '../entities/budget';

export interface IBudgetRepository {
  getBudgetsByMonth(month: string): Promise<Budget[]>;
  createBudget(dto: CreateBudgetDTO): Promise<Budget>;
  updateBudget(dto: UpdateBudgetDTO): Promise<Budget>;
  deleteBudget(budgetId: string): Promise<boolean>;
}

