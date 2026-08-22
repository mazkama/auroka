import { ITransactionRepository } from '@/domain/repositories/ITransactionRepository';
import { IWalletRepository } from '@/domain/repositories/IWalletRepository';
import { Transaction, CreateTransactionDTO } from '@/domain/entities/transaction';

export class CreateTransactionUseCase {
  constructor(
    private transactionRepo: ITransactionRepository,
    private walletRepo: IWalletRepository
  ) {}

  async execute(dto: CreateTransactionDTO): Promise<Transaction> {
    const transaction = await this.transactionRepo.createTransaction(dto);
    const wallet = await this.walletRepo.getWalletById(dto.walletId);

    if (wallet) {
      // Ledger System Rule: Adjust balance according to debit/credit
      const newBalance =
        dto.type === 'IN' || dto.type === 'INITIAL_BALANCE'
          ? wallet.balance + dto.totalAmount
          : wallet.balance - dto.totalAmount;
      await this.walletRepo.updateBalance(dto.walletId, newBalance);
    }

    return transaction;
  }
}
