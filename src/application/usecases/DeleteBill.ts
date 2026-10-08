import { IBillRepository } from '@/domain/repositories/IBillRepository';

export class DeleteBillUseCase {
  constructor(private billRepository: IBillRepository) {}

  async execute(billId: string | number): Promise<boolean> {
    return await this.billRepository.deleteBill(billId);
  }
}
