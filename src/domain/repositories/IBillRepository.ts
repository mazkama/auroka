import { Bill, CreateBillDTO, UpdateBillDTO } from '../entities/bill';

export interface IBillRepository {
  getBills(status?: string, category?: string): Promise<Bill[]>;
  createBill(dto: CreateBillDTO): Promise<Bill>;
  updateBill(dto: UpdateBillDTO): Promise<Bill>;
  deleteBill(billId: string | number): Promise<boolean>;
  payBill(billId: string | number): Promise<{ success: boolean; message: string; data: Bill }>;
}
