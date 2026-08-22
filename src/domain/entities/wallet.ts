export type AccountType = 'BANK' | 'E_WALLET' | 'CRYPTO' | 'CASH';

export interface Wallet {
  id: string;
  userId: string;
  name: string;
  type: AccountType;
  balance: number; // Hasil kalkulasi Ledger SUM(IN/INITIAL_BALANCE) - SUM(OUT)
  accountNumber?: string;
  iconName: string;
  color: string;
}
