import { IBudgetRepository } from '@/domain/repositories/IBudgetRepository';
import { Budget, CreateBudgetDTO } from '@/domain/entities/budget';

export class CreateBudgetUseCase {
  constructor(private budgetRepo: IBudgetRepository) {}

  async execute(dto: CreateBudgetDTO): Promise<Budget> {
    if (!dto.category) {
      throw new Error('Kategori anggaran wajib dipilih');
    }
    if (!dto.limitAmount || dto.limitAmount <= 0) {
      throw new Error('Batas anggaran harus lebih besar dari Rp 0');
    }
    return await this.budgetRepo.createBudget(dto);
  }
}
