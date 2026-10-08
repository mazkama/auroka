import { IWalletRepository } from '@/domain/repositories/IWalletRepository';
import { Wallet } from '@/domain/entities/wallet';
import { apiFetch } from './apiClient';

export class ApiWalletRepository implements IWalletRepository {
  async getAllWallets(): Promise<Wallet[]> {
    return await apiFetch<Wallet[]>('/wallets');
  }

  async getWalletById(id: string): Promise<Wallet | null> {
    try {
      return await apiFetch<Wallet>(`/wallets/${id}`);
    } catch {
      return null;
    }
  }

  async updateBalance(walletId: string, newBalance: number): Promise<void> {
    // In Ledger system, balance is recalculated automatically by backend
    await apiFetch(`/wallets/${walletId}`, {
      method: 'PUT',
      body: JSON.stringify({ balance: newBalance }),
    });
  }

  async createWallet(wallet: Partial<Wallet> & { initialBalance?: number }): Promise<Wallet> {
    return await apiFetch<Wallet>('/wallets', {
      method: 'POST',
      body: JSON.stringify({
        name: wallet.name,
        type: wallet.type,
        initialBalance: wallet.balance || 0,
        accountNumber: wallet.accountNumber || '',
        iconName: wallet.iconName || 'BuildingLibrary',
        color: wallet.color || '#005caa',
      }),
    });
  }

  async updateWallet(id: string, wallet: Partial<Wallet>): Promise<Wallet> {
    return await apiFetch<Wallet>(`/wallets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(wallet),
    });
  }

  async deleteWallet(id: string): Promise<void> {
    await apiFetch(`/wallets/${id}`, {
      method: 'DELETE',
    });
  }
}
