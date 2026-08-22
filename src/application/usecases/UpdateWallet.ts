import { IWalletRepository } from '../../domain/repositories/IWalletRepository';
import { Wallet } from '../../domain/entities/wallet';

export class UpdateWallet {
  constructor(private walletRepository: IWalletRepository) {}

  async execute(id: string, walletData: Partial<Wallet>): Promise<Wallet> {
    if (!id) {
      throw new Error('Wallet ID is required for update.');
    }
    
    return await this.walletRepository.updateWallet(id, walletData);
  }
}
