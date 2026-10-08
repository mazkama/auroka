import { IBillRepository } from '@/domain/repositories/IBillRepository';
import { Bill, CreateBillDTO } from '@/domain/entities/bill';

export class CreateBillUseCase {
  constructor(private billRepository: IBillRepository) {}

  async execute(dto: CreateBillDTO): Promise<Bill> {
    return await this.billRepository.createBill(dto);
  }
}
