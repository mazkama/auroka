import { IWalletRepository } from '@/domain/repositories/IWalletRepository';
import { Wallet } from '@/domain/entities/wallet';

export class GetWalletsUseCase {
  constructor(private walletRepo: IWalletRepository) {}

  async execute(): Promise<Wallet[]> {
    return await this.walletRepo.getAllWallets();
  }
}
