import { Category } from './transaction';

export interface Budget {
  id: string;
  category: Category;
  limitAmount: number;
  spentAmount: number;
  month: string; // YYYY-MM format
}
