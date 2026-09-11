import { ITransactionRepository } from '@/domain/repositories/ITransactionRepository';
import { IWalletRepository } from '@/domain/repositories/IWalletRepository';

export class DeleteTransactionUseCase {
  constructor(
    private transactionRepo: ITransactionRepository,
    private walletRepo: IWalletRepository
  ) {}

  async execute(id: string): Promise<void> {
    const existingTx = await this.transactionRepo.getTransactionById(id);
    if (!existingTx) {
      throw new Error(`Transaksi dengan ID ${id} tidak ditemukan`);
    }

    // 1. Revert transaction balance effect on the wallet
    const wallet = await this.walletRepo.getWalletById(existingTx.walletId);
    if (wallet) {
      const revertedBalance =
        existingTx.type === 'IN' || existingTx.type === 'INITIAL_BALANCE'
          ? wallet.balance - existingTx.totalAmount
          : wallet.balance + existingTx.totalAmount;
      await this.walletRepo.updateBalance(existingTx.walletId, revertedBalance);
    }

    // 2. Delete transaction from repository
    await this.transactionRepo.deleteTransaction(id);
  }
}
