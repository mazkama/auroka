export type TransactionType = 'IN' | 'OUT' | 'TRANSFER' | 'ADJUSTMENT' | 'INITIAL_BALANCE';

export type Category =
  | 'Gaji'
  | 'Investasi'
  | 'Makan & Minum'
  | 'Belanja'
  | 'Listrik & Air'
  | 'Transportasi'
  | 'Hiburan'
  | 'Kesehatan'
  | 'Lainnya';

export interface TransactionItem {
  id: string;
  transactionId: string;
  itemName: string;
  categoryId: string;
  categoryName: Category;
  amount: number;
  isFriendOrder?: boolean; // Opsi Nitip Teman
  friendName?: string;
  rating?: number; // Worthiness rating 1-5
}

export interface Transaction {
  id: string;
  userId: string;
  walletId: string;
  walletName: string;
  type: TransactionType;
  totalAmount: number;
  transactionDate: string; // ISO format YYYY-MM-DD
  locationName?: string;
  cityName?: string;
  title: string;
  note?: string;
  items?: TransactionItem[]; // Detail granular (Header-Detail)
}

export interface CreateTransactionDTO {
  userId: string;
  walletId: string;
  type: TransactionType;
  title: string;
  totalAmount: number;
  locationName?: string;
  cityName?: string;
  note?: string;
  items?: Omit<TransactionItem, 'id' | 'transactionId'>[];
}
