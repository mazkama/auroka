import { ITransactionRepository } from '@/domain/repositories/ITransactionRepository';
import { Transaction, CreateTransactionDTO, UpdateTransactionDTO } from '@/domain/entities/transaction';
import { FinancialSummary } from '@/domain/entities/summary';
import { INITIAL_TRANSACTIONS, INITIAL_WALLETS, CURRENT_USER_ID } from './mockData';

export class MockTransactionRepository implements ITransactionRepository {
  private transactions: Transaction[] = [...INITIAL_TRANSACTIONS];

  async getAllTransactions(): Promise<Transaction[]> {
    await new Promise((res) => setTimeout(res, 150));
    return [...this.transactions].sort(
      (a, b) =>
        new Date(b.transactionDate).getTime() -
        new Date(a.transactionDate).getTime()
    );
  }

  async getTransactionById(id: string): Promise<Transaction | null> {
    await new Promise((res) => setTimeout(res, 100));
    return this.transactions.find((t) => t.id === id) || null;
  }

  async createTransaction(dto: CreateTransactionDTO): Promise<Transaction> {
    await new Promise((res) => setTimeout(res, 200));
    const wallet = INITIAL_WALLETS.find((w) => w.id === dto.walletId);

    const newTx: Transaction = {
      id: `t-${Date.now()}`,
      userId: dto.userId || CURRENT_USER_ID,
      title: dto.title,
      totalAmount: dto.totalAmount,
      type: dto.type,
      transactionDate: new Date().toISOString().split('T')[0],
      walletId: dto.walletId,
      walletName: wallet ? wallet.name : 'Unknown Wallet',
      locationName: dto.locationName,
      cityName: dto.cityName,
      note: dto.note,
      items: dto.items?.map((item, idx) => ({
        ...item,
        id: `ti-${Date.now()}-${idx}`,
        transactionId: `t-${Date.now()}`,
      })),
    };

    this.transactions.unshift(newTx);
    return newTx;
  }

  async updateTransaction(id: string, dto: UpdateTransactionDTO): Promise<Transaction> {
    await new Promise((res) => setTimeout(res, 150));
    const index = this.transactions.findIndex((t) => t.id === id);
    if (index === -1) {
      throw new Error(`Transaction with ID ${id} not found`);
    }

    const currentTx = this.transactions[index];
    const wallet = dto.walletId ? INITIAL_WALLETS.find((w) => w.id === dto.walletId) : undefined;

    const updatedTx: Transaction = {
      ...currentTx,
      title: dto.title !== undefined ? dto.title : currentTx.title,
      totalAmount: dto.totalAmount !== undefined ? dto.totalAmount : currentTx.totalAmount,
      type: dto.type !== undefined ? dto.type : currentTx.type,
      walletId: dto.walletId !== undefined ? dto.walletId : currentTx.walletId,
      walletName: wallet ? wallet.name : currentTx.walletName,
      transactionDate: dto.transactionDate !== undefined ? dto.transactionDate : currentTx.transactionDate,
      locationName: dto.locationName !== undefined ? dto.locationName : currentTx.locationName,
      cityName: dto.cityName !== undefined ? dto.cityName : currentTx.cityName,
      note: dto.note !== undefined ? dto.note : currentTx.note,
      items: dto.items !== undefined
        ? dto.items.map((item, idx) => ({
            ...item,
            id: (item as any).id || `ti-${id}-${idx}`,
            transactionId: id,
          }))
        : currentTx.items,
    };

    this.transactions[index] = updatedTx;
    return updatedTx;
  }

  async deleteTransaction(id: string): Promise<void> {
    await new Promise((res) => setTimeout(res, 150));
    const index = this.transactions.findIndex((t) => t.id === id);
    if (index === -1) {
      throw new Error(`Transaction with ID ${id} not found`);
    }
    this.transactions.splice(index, 1);
  }

  async getFinancialSummary(): Promise<FinancialSummary> {
    await new Promise((res) => setTimeout(res, 150));

    // Ledger Calculation Rule: Total Balance is SUM(Wallets)
    const totalBalance = INITIAL_WALLETS.reduce((sum, w) => sum + w.balance, 0);

    const monthlyIncome = this.transactions
      .filter((t) => t.type === 'IN' || t.type === 'INITIAL_BALANCE')
      .reduce((sum, t) => sum + t.totalAmount, 0);

    const monthlyExpense = this.transactions
      .filter((t) => t.type === 'OUT')
      .reduce((sum, t) => sum + t.totalAmount, 0);

    const netCashFlow = monthlyIncome - monthlyExpense;
    const savingsRate =
      monthlyIncome > 0 ? (netCashFlow / monthlyIncome) * 100 : 0;

    return {
      totalBalance,
      monthlyIncome,
      monthlyExpense,
      netCashFlow,
      savingsRate: Math.round(savingsRate * 10) / 10,
    };
  }
}
