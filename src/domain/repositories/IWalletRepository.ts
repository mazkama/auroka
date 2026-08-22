import { Wallet } from '../entities/wallet';

export interface IWalletRepository {
  getAllWallets(): Promise<Wallet[]>;
  getWalletById(id: string): Promise<Wallet | null>;
  updateBalance(walletId: string, newBalance: number): Promise<void>;
  createWallet(wallet: Partial<Wallet>): Promise<Wallet>;
  updateWallet(id: string, wallet: Partial<Wallet>): Promise<Wallet>;
  deleteWallet(id: string): Promise<void>;
}
