import { ITransactionRepository } from '@/domain/repositories/ITransactionRepository';
import { IWalletRepository } from '@/domain/repositories/IWalletRepository';
import { TransferDTO } from '@/domain/entities/transaction';

export class TransferFundsUseCase {
  constructor(
    private transactionRepo: ITransactionRepository,
    private walletRepo: IWalletRepository
  ) {}

  async execute(dto: TransferDTO) {
    if (dto.sourceWalletId === dto.destWalletId) {
      throw new Error('Dompet asal dan dompet tujuan tidak boleh sama');
    }

    if (dto.amount <= 0) {
      throw new Error('Nominal transfer harus lebih dari 0');
    }

    const result = await this.transactionRepo.transferFunds(dto);

    // Ledger balance reconciliation in Mock/Client-side
    const sourceWallet = await this.walletRepo.getWalletById(dto.sourceWalletId);
    const destWallet = await this.walletRepo.getWalletById(dto.destWalletId);

    const fee = dto.adminFee || 0;

    if (sourceWallet) {
      await this.walletRepo.updateBalance(
        dto.sourceWalletId,
        sourceWallet.balance - dto.amount - fee
      );
    }

    if (destWallet) {
      await this.walletRepo.updateBalance(
        dto.destWalletId,
        destWallet.balance + dto.amount
      );
    }

    return result;
  }
}
