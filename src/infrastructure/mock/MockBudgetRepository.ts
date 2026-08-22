import { IBudgetRepository } from '@/domain/repositories/IBudgetRepository';
import { Budget, CreateBudgetDTO, UpdateBudgetDTO } from '@/domain/entities/budget';
import { INITIAL_BUDGETS } from './mockData';

export class MockBudgetRepository implements IBudgetRepository {
  private budgets: Budget[] = [...INITIAL_BUDGETS];

  async getBudgetsByMonth(month: string): Promise<Budget[]> {
    await new Promise((res) => setTimeout(res, 100));
    return this.budgets.filter((b) => b.month === month);
  }

  async createBudget(dto: CreateBudgetDTO): Promise<Budget> {
    await new Promise((res) => setTimeout(res, 150));
    
    // Check if budget for this category & month already exists
    const existingIndex = this.budgets.findIndex(
      (b) => b.category === dto.category && b.month === dto.month
    );

    if (existingIndex !== -1) {
      // Update existing budget limit
      this.budgets[existingIndex] = {
        ...this.budgets[existingIndex],
        limitAmount: dto.limitAmount,
      };
      return this.budgets[existingIndex];
    }

    const newBudget: Budget = {
      id: `b-${Date.now()}`,
      category: dto.category,
      limitAmount: dto.limitAmount,
      spentAmount: 0, // Initially 0 or calculated
      month: dto.month,
    };

    this.budgets.push(newBudget);
    return newBudget;
  }

  async updateBudget(dto: UpdateBudgetDTO): Promise<Budget> {
    await new Promise((res) => setTimeout(res, 150));
    const index = this.budgets.findIndex((b) => b.id === dto.id);
    if (index === -1) {
      throw new Error('Anggaran tidak ditemukan');
    }

    this.budgets[index] = {
      ...this.budgets[index],
      ...(dto.category && { category: dto.category }),
      ...(dto.limitAmount !== undefined && { limitAmount: dto.limitAmount }),
      ...(dto.month && { month: dto.month }),
    };

    return this.budgets[index];
  }

  async deleteBudget(budgetId: string): Promise<boolean> {
    await new Promise((res) => setTimeout(res, 150));
    const initialLen = this.budgets.length;
    this.budgets = this.budgets.filter((b) => b.id !== budgetId);
    return this.budgets.length < initialLen;
  }
}

