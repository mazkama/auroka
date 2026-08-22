import { IBudgetRepository } from '@/domain/repositories/IBudgetRepository';
import { Budget, UpdateBudgetDTO } from '@/domain/entities/budget';

export class UpdateBudgetUseCase {
  constructor(private budgetRepo: IBudgetRepository) {}

  async execute(dto: UpdateBudgetDTO): Promise<Budget> {
    if (!dto.id) {
      throw new Error('ID Anggaran tidak valid');
    }
    if (dto.limitAmount !== undefined && dto.limitAmount <= 0) {
      throw new Error('Batas anggaran harus lebih besar dari Rp 0');
    }
    return await this.budgetRepo.updateBudget(dto);
  }
}
