import { IBillRepository } from '@/domain/repositories/IBillRepository';
import { Bill } from '@/domain/entities/bill';

export class GetBillsUseCase {
  constructor(private billRepository: IBillRepository) {}

  async execute(status?: string, category?: string): Promise<Bill[]> {
    return await this.billRepository.getBills(status, category);
  }
}
