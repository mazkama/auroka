import { IWalletRepository } from '@/domain/repositories/IWalletRepository';
import { Wallet } from '@/domain/entities/wallet';
import { INITIAL_WALLETS } from './mockData';

export class MockWalletRepository implements IWalletRepository {
  private wallets: Wallet[] = [...INITIAL_WALLETS];

  async getAllWallets(): Promise<Wallet[]> {
    await new Promise((res) => setTimeout(res, 150));
    return [...this.wallets];
  }

  async getWalletById(id: string): Promise<Wallet | null> {
    await new Promise((res) => setTimeout(res, 100));
    return this.wallets.find((w) => w.id === id) || null;
  }

  async updateBalance(walletId: string, newBalance: number): Promise<void> {
    await new Promise((res) => setTimeout(res, 100));
    const wallet = this.wallets.find((w) => w.id === walletId);
    if (wallet) {
      wallet.balance = newBalance;
    }
  }

  async createWallet(wallet: Partial<Wallet>): Promise<Wallet> {
    await new Promise((res) => setTimeout(res, 200));
    const newWallet = wallet as Wallet;
    this.wallets.push(newWallet);
    return newWallet;
  }

  async updateWallet(id: string, wallet: Partial<Wallet>): Promise<Wallet> {
    await new Promise((res) => setTimeout(res, 200));
    const index = this.wallets.findIndex((w) => w.id === id);
    if (index === -1) throw new Error('Wallet not found');
    this.wallets[index] = { ...this.wallets[index], ...wallet };
    return this.wallets[index];
  }

  async deleteWallet(id: string): Promise<void> {
    await new Promise((res) => setTimeout(res, 200));
    this.wallets = this.wallets.filter((w) => w.id !== id);
  }
}
