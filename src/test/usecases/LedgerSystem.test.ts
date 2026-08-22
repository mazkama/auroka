import { describe, it, expect } from 'vitest';
import { container } from '@/infrastructure/di/container';
import { CreateTransactionDTO } from '@/domain/entities/transaction';

describe('Ledger System Integration Test', () => {
  it('calculates financial summary correctly from mock repository', async () => {
    const summaryUseCase = container.getFinancialSummaryUseCase();
    const summary = await summaryUseCase.execute();

    expect(summary).toBeDefined();
    expect(summary.totalBalance).toBeGreaterThan(0);
    expect(summary.monthlyIncome).toBeGreaterThan(0);
    expect(summary.monthlyExpense).toBeGreaterThan(0);
    expect(summary.netCashFlow).toBe(summary.monthlyIncome - summary.monthlyExpense);
  });

  it('adds a transaction and updates wallet balance according to ledger rules', async () => {
    const walletsUseCase = container.getWalletsUseCase();
    const initialWallets = await walletsUseCase.execute();
    const targetWallet = initialWallets[0]; // BCA
    const initialBalance = targetWallet.balance;

    const createTxUseCase = container.getCreateTransactionUseCase();
    const newTxDTO: CreateTransactionDTO = {
      userId: 'usr-test',
      walletId: targetWallet.id,
      type: 'IN',
      title: 'Test Dividend Income',
      totalAmount: 1000000,
    };

    const createdTx = await createTxUseCase.execute(newTxDTO);
    expect(createdTx).toBeDefined();
    expect(createdTx.totalAmount).toBe(1000000);

    const updatedWallets = await walletsUseCase.execute();
    const updatedTargetWallet = updatedWallets.find((w) => w.id === targetWallet.id);
    expect(updatedTargetWallet?.balance).toBe(initialBalance + 1000000);
  });
});
