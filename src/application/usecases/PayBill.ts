import { IBillRepository } from '@/domain/repositories/IBillRepository';
import { Bill } from '@/domain/entities/bill';

export class PayBillUseCase {
  constructor(private billRepository: IBillRepository) {}

  async execute(billId: string | number): Promise<{ success: boolean; message: string; data: Bill }> {
    return await this.billRepository.payBill(billId);
  }
}
