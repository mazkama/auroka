import { IBillRepository } from '@/domain/repositories/IBillRepository';
import { Bill, UpdateBillDTO } from '@/domain/entities/bill';

export class UpdateBillUseCase {
  constructor(private billRepository: IBillRepository) {}

  async execute(dto: UpdateBillDTO): Promise<Bill> {
    return await this.billRepository.updateBill(dto);
  }
}
