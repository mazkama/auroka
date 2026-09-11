import { ITransactionRepository } from '@/domain/repositories/ITransactionRepository';
import { IWalletRepository } from '@/domain/repositories/IWalletRepository';
import { Transaction, UpdateTransactionDTO } from '@/domain/entities/transaction';

export class UpdateTransactionUseCase {
  constructor(
    private transactionRepo: ITransactionRepository,
    private walletRepo: IWalletRepository
  ) {}

  async execute(id: string, dto: UpdateTransactionDTO): Promise<Transaction> {
    const existingTx = await this.transactionRepo.getTransactionById(id);
    if (!existingTx) {
      throw new Error(`Transaksi dengan ID ${id} tidak ditemukan`);
    }

    // 1. Revert previous transaction balance effect on the original wallet
    const oldWallet = await this.walletRepo.getWalletById(existingTx.walletId);
    if (oldWallet) {
      const revertedBalance =
        existingTx.type === 'IN' || existingTx.type === 'INITIAL_BALANCE'
          ? oldWallet.balance - existingTx.totalAmount
          : oldWallet.balance + existingTx.totalAmount;
      await this.walletRepo.updateBalance(existingTx.walletId, revertedBalance);
    }

    // 2. Perform the update in the transaction repository
    const updatedTx = await this.transactionRepo.updateTransaction(id, dto);

    // 3. Apply new transaction balance effect on the target wallet
    const targetWalletId = dto.walletId || existingTx.walletId;
    const targetWallet = await this.walletRepo.getWalletById(targetWalletId);
    if (targetWallet) {
      const newType = dto.type || existingTx.type;
      const newAmount = dto.totalAmount !== undefined ? dto.totalAmount : existingTx.totalAmount;
      const appliedBalance =
        newType === 'IN' || newType === 'INITIAL_BALANCE'
          ? targetWallet.balance + newAmount
          : targetWallet.balance - newAmount;
      await this.walletRepo.updateBalance(targetWalletId, appliedBalance);
    }

    return updatedTx;
  }
}
