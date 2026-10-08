export type BillCycle = 'MONTHLY' | 'YEARLY';
export type BillStatus = 'PENDING' | 'PAID';

export interface Bill {
  id: string | number;
  userId?: string | number;
  name: string;
  category: string;
  amount: number;
  dueDay: number; // 1 - 31
  cycle: BillCycle;
  walletId?: string;
  walletName?: string;
  status: BillStatus;
  lastPaidAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateBillDTO {
  name: string;
  category: string;
  amount: number;
  dueDay: number;
  cycle?: BillCycle;
  walletId?: string;
  status?: BillStatus;
}

export interface UpdateBillDTO {
  id: string | number;
  name?: string;
  category?: string;
  amount?: number;
  dueDay?: number;
  cycle?: BillCycle;
  walletId?: string;
  status?: BillStatus;
}
