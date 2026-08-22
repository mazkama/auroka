import { Category } from './transaction';

export interface Budget {
  id: string;
  category: Category;
  limitAmount: number;
  spentAmount: number;
  month: string; // YYYY-MM format
}

export interface CreateBudgetDTO {
  category: Category;
  limitAmount: number;
  month: string;
}

export interface UpdateBudgetDTO {
  id: string;
  category?: Category;
  limitAmount?: number;
  month?: string;
}

