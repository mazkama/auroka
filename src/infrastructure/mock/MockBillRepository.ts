import { IBillRepository } from '@/domain/repositories/IBillRepository';
import { Bill, CreateBillDTO, UpdateBillDTO } from '@/domain/entities/bill';
import { INITIAL_BILLS, INITIAL_WALLETS, INITIAL_TRANSACTIONS, CURRENT_USER_ID } from './mockData';

export class MockBillRepository implements IBillRepository {
  private bills: Bill[] = [...INITIAL_BILLS];

  async getBills(status?: string, category?: string): Promise<Bill[]> {
    await new Promise((res) => setTimeout(res, 100));
    let filtered = [...this.bills];
    if (status) {
      filtered = filtered.filter((b) => b.status === status);
    }
    if (category) {
      filtered = filtered.filter((b) => b.category === category);
    }
    return filtered.sort((a, b) => a.dueDay - b.dueDay);
  }

  async createBill(dto: CreateBillDTO): Promise<Bill> {
    await new Promise((res) => setTimeout(res, 150));
    const wallet = INITIAL_WALLETS.find((w) => w.id === dto.walletId);

    const newBill: Bill = {
      id: `bill-${Date.now()}`,
      name: dto.name,
      category: dto.category,
      amount: dto.amount,
      dueDay: dto.dueDay,
      cycle: dto.cycle || 'MONTHLY',
      walletId: dto.walletId,
      walletName: wallet?.name,
      status: dto.status || 'PENDING',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.bills.push(newBill);
    return newBill;
  }

  async updateBill(dto: UpdateBillDTO): Promise<Bill> {
    await new Promise((res) => setTimeout(res, 150));
    const index = this.bills.findIndex((b) => String(b.id) === String(dto.id));
    if (index === -1) {
      throw new Error('Tagihan tidak ditemukan');
    }

    const wallet = dto.walletId
      ? INITIAL_WALLETS.find((w) => w.id === dto.walletId)
      : undefined;

    this.bills[index] = {
      ...this.bills[index],
      ...(dto.name && { name: dto.name }),
      ...(dto.category && { category: dto.category }),
      ...(dto.amount !== undefined && { amount: dto.amount }),
      ...(dto.dueDay !== undefined && { dueDay: dto.dueDay }),
      ...(dto.cycle && { cycle: dto.cycle }),
      ...(dto.walletId && { walletId: dto.walletId, walletName: wallet?.name }),
      ...(dto.status && { status: dto.status }),
      updatedAt: new Date().toISOString(),
    };

    return this.bills[index];
  }

  async deleteBill(billId: string | number): Promise<boolean> {
    await new Promise((res) => setTimeout(res, 150));
    const initLen = this.bills.length;
    this.bills = this.bills.filter((b) => String(b.id) !== String(billId));
    return this.bills.length < initLen;
  }

  async payBill(billId: string | number): Promise<{ success: boolean; message: string; data: Bill }> {
    await new Promise((res) => setTimeout(res, 200));
    const index = this.bills.findIndex((b) => String(b.id) === String(billId));
    if (index === -1) {
      throw new Error('Tagihan tidak ditemukan');
    }

    const bill = this.bills[index];
    const now = new Date();
    const nowDate = now.toISOString().split('T')[0];

    // Target wallet
    let targetWallet = INITIAL_WALLETS.find((w) => w.id === bill.walletId);
    if (!targetWallet && INITIAL_WALLETS.length > 0) {
      targetWallet = INITIAL_WALLETS[0];
    }

    if (targetWallet) {
      targetWallet.balance = Math.max(0, targetWallet.balance - bill.amount);
    }

    // Mark as PAID
    this.bills[index] = {
      ...bill,
      status: 'PAID',
      lastPaidAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    // Record out transaction
    const txId = `t-bill-${Date.now()}`;
    INITIAL_TRANSACTIONS.unshift({
      id: txId,
      userId: CURRENT_USER_ID,
      title: `Pembayaran ${bill.name}`,
      totalAmount: bill.amount,
      type: 'OUT',
      transactionDate: nowDate,
      walletId: targetWallet ? targetWallet.id : (bill.walletId || 'w-1'),
      walletName: targetWallet ? targetWallet.name : (bill.walletName || 'Bank BCA Utama'),
      locationName: 'Pembayaran Tagihan',
      cityName: 'Online',
      note: `Pembayaran rutin tagihan (${bill.cycle || 'MONTHLY'})`,
      items: [
        {
          id: `ti-${txId}-1`,
          transactionId: txId,
          itemName: bill.name,
          categoryId: 'cat-bills',
          categoryName: 'Tagihan & Langganan',
          amount: bill.amount,
          rating: 5,
        },
      ],
    });

    return {
      success: true,
      message: `Tagihan '${this.bills[index].name}' berhasil dibayar`,
      data: this.bills[index],
    };
  }
}
