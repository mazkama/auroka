import { IWalletRepository } from '../../domain/repositories/IWalletRepository';
import { Wallet } from '../../domain/entities/wallet';

export class CreateWallet {
  constructor(private walletRepository: IWalletRepository) {}

  async execute(walletData: Partial<Wallet>): Promise<Wallet> {
    if (!walletData.name || !walletData.type) {
      throw new Error('Name and Type are required to create a wallet.');
    }
    
    // Default values for new wallets
    const newWallet: Partial<Wallet> = {
      id: `w-${Date.now()}`,
      userId: walletData.userId || 'u-1',
      name: walletData.name,
      type: walletData.type,
      balance: walletData.balance || 0,
      accountNumber: walletData.accountNumber || '',
      iconName: walletData.iconName || 'Wallet',
      color: walletData.color || '#004ac6',
    };
    
    return await this.walletRepository.createWallet(newWallet);
  }
}
