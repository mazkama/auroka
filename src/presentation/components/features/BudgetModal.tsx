'use client';

import React, { useState, useEffect } from 'react';
import { Budget, CreateBudgetDTO, UpdateBudgetDTO } from '@/domain/entities/budget';
import { Category } from '@/domain/entities/transaction';
import { formatRupiah } from '@/presentation/utils/formatters';
import { X, PieChart, Check, AlertCircle } from 'lucide-react';

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  budgetToEdit?: Budget | null;
  onAddBudget: (dto: CreateBudgetDTO) => Promise<void>;
  onEditBudget: (dto: UpdateBudgetDTO) => Promise<void>;
}

const CATEGORY_OPTIONS: Category[] = [
  'Makan & Minum',
  'Belanja',
  'Listrik & Air',
  'Transportasi',
  'Hiburan',
  'Investasi',
  'Kesehatan',
  'Lainnya',
];

export const BudgetModal: React.FC<BudgetModalProps> = ({
  isOpen,
  onClose,
  budgetToEdit,
  onAddBudget,
  onEditBudget,
}) => {
  const [category, setCategory] = useState<Category>('Makan & Minum');
  const [limitAmount, setLimitAmount] = useState<string>('');
  const [month, setMonth] = useState<string>('2026-08');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (budgetToEdit) {
      setCategory(budgetToEdit.category);
      setLimitAmount(budgetToEdit.limitAmount.toString());
      setMonth(budgetToEdit.month);
    } else {
      setCategory('Makan & Minum');
      setLimitAmount('');
      setMonth('2026-08');
    }
    setErrorMsg(null);
  }, [budgetToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const numAmount = parseFloat(limitAmount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setErrorMsg('Batas anggaran harus lebih besar dari Rp 0');
      return;
    }

    try {
      setIsSubmitting(true);
      if (budgetToEdit) {
        await onEditBudget({
          id: budgetToEdit.id,
          category,
          limitAmount: numAmount,
          month,
        });
      } else {
        await onAddBudget({
          category,
          limitAmount: numAmount,
          month,
        });
      }
      onClose();
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Gagal menyimpan anggaran'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const setQuickAmount = (val: number) => {
    setLimitAmount(val.toString());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0b1c30]/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-md rounded-3xl bg-white border border-[#e2e8f0] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#f1f5f9] bg-[#f8fafc]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#004ac6]/10 text-[#004ac6]">
              <PieChart className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-[#0f172a]">
                {budgetToEdit ? 'Edit Batas Anggaran' : 'Set Anggaran Bulanan'}
              </h3>
              <p className="text-xs text-[#64748b]">
                Kendalikan pengeluaran kategori dengan batas otomatis
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#64748b] hover:bg-[#e2e8f0] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {errorMsg && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Category Select */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#0f172a]">
              Kategori Pengeluaran
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
              className="w-full rounded-xl bg-[#f8fafc] border border-[#e2e8f0] px-3.5 py-2.5 text-xs font-semibold text-[#0f172a] focus:outline-none focus:border-[#004ac6] focus:bg-white transition-all"
            >
              {CATEGORY_OPTIONS.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Limit Amount */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#0f172a]">
              Batas Maksimal Anggaran (Rp)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#64748b]">
                Rp
              </span>
              <input
                type="number"
                value={limitAmount}
                onChange={(e) => setLimitAmount(e.target.value)}
                placeholder="misal: 3500000"
                className="w-full rounded-xl bg-[#f8fafc] border border-[#e2e8f0] pl-10 pr-3.5 py-2.5 text-sm font-mono font-bold text-[#0f172a] placeholder-[#94a3b8] focus:outline-none focus:border-[#004ac6] focus:bg-white transition-all"
                required
              />
            </div>

            {/* Formatted Preview */}
            {limitAmount && !isNaN(parseFloat(limitAmount)) && (
              <p className="text-[11px] font-semibold text-[#004ac6] text-right">
                {formatRupiah(parseFloat(limitAmount))}
              </p>
            )}

            {/* Quick Amount Buttons */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {[1000000, 2500000, 5000000, 10000000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setQuickAmount(amt)}
                  className="px-2.5 py-1 rounded-lg bg-[#f1f5f9] hover:bg-[#e2e8f0] text-[10px] font-bold text-[#475569] transition-colors"
                >
                  +{formatRupiah(amt)}
                </button>
              ))}
            </div>
          </div>

          {/* Month Selection */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#0f172a]">
              Bulan Periode
            </label>
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="w-full rounded-xl bg-[#f8fafc] border border-[#e2e8f0] px-3.5 py-2 text-xs font-semibold text-[#0f172a] focus:outline-none focus:border-[#004ac6] transition-all"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-[#64748b] hover:bg-[#f1f5f9] transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 bg-[#004ac6] hover:bg-[#2563eb] text-white px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-md shadow-[#004ac6]/20 disabled:opacity-50"
            >
              <Check className="h-4 w-4" />
              <span>{budgetToEdit ? 'Simpan Perubahan' : 'Tambah Anggaran'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
