import { IBudgetRepository } from '@/domain/repositories/IBudgetRepository';
import { Budget, CreateBudgetDTO, UpdateBudgetDTO } from '@/domain/entities/budget';
import { apiFetch } from './apiClient';

export class ApiBudgetRepository implements IBudgetRepository {
  async getBudgetsByMonth(month: string): Promise<Budget[]> {
    return await apiFetch<Budget[]>(`/budgets?month=${encodeURIComponent(month)}`);
  }

  async createBudget(dto: CreateBudgetDTO): Promise<Budget> {
    return await apiFetch<Budget>('/budgets', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  }

  async updateBudget(dto: UpdateBudgetDTO): Promise<Budget> {
    return await apiFetch<Budget>(`/budgets/${dto.id}`, {
      method: 'PUT',
      body: JSON.stringify(dto),
    });
  }

  async deleteBudget(budgetId: string): Promise<boolean> {
    try {
      await apiFetch(`/budgets/${budgetId}`, {
        method: 'DELETE',
      });
      return true;
    } catch {
      return false;
    }
  }
}
