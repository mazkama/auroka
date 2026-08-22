import { IWalletRepository } from '../../domain/repositories/IWalletRepository';

export class DeleteWallet {
  constructor(private walletRepository: IWalletRepository) {}

  async execute(id: string): Promise<void> {
    if (!id) {
      throw new Error('Wallet ID is required for deletion.');
    }
    
    return await this.walletRepository.deleteWallet(id);
  }
}
