'use client';

import React from 'react';
import { Budget } from '@/domain/entities/budget';
import { formatRupiah } from '@/presentation/utils/formatters';
import { PieChart, AlertCircle } from 'lucide-react';

interface BudgetProgressProps {
  budgets: Budget[];
}

export const BudgetProgress: React.FC<BudgetProgressProps> = ({ budgets }) => {
  return (
    <div className="rounded-2xl bg-white border border-[#e2e8f0] p-5 space-y-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <PieChart className="h-5 w-5 text-[#004ac6]" />
          <h2 className="text-lg font-bold text-[#0f172a]">Anggaran Bulanan</h2>
        </div>
        <span className="text-xs font-semibold text-[#64748b]">Agustus 2026</span>
      </div>

      <div className="space-y-4">
        {budgets.map((budget) => {
          const percentage = Math.min(
            Math.round((budget.spentAmount / budget.limitAmount) * 100),
            100
          );
          const isWarning = percentage >= 80;
          const isDanger = percentage >= 95;

          return (
            <div key={budget.id} className="space-y-1.5 group">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 font-bold text-[#0f172a] group-hover:text-[#004ac6] transition-colors">
                  <span>{budget.category}</span>
                  {isWarning && (
                    <AlertCircle
                      className={`h-3.5 w-3.5 ${
                        isDanger ? 'text-rose-500' : 'text-amber-500'
                      }`}
                    />
                  )}
                </div>
                <div className="text-[#64748b]">
                  <span className="font-bold text-[#0f172a]">
                    {formatRupiah(budget.spentAmount)}
                  </span>{' '}
                  / {formatRupiah(budget.limitAmount)}
                </div>
              </div>

              <div className="h-2 w-full rounded-full bg-[#f1f5f9] overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isDanger
                      ? 'bg-rose-500'
                      : isWarning
                      ? 'bg-amber-500'
                      : 'bg-[#004ac6]'
                  }`}
                  style={{ width: `${percentage}%` }}
                />
              </div>

              <div className="flex justify-between text-[10px] font-semibold text-[#64748b]">
                <span>{percentage}% terpakai</span>
                <span>
                  Sisa: {formatRupiah(budget.limitAmount - budget.spentAmount)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
