'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Budget, CreateBudgetDTO, UpdateBudgetDTO } from '@/domain/entities/budget';
import { formatRupiah } from '@/presentation/utils/formatters';
import { PieChart, AlertCircle, Plus, Edit2, Trash2, ArrowRight } from 'lucide-react';
import { BudgetModal } from './BudgetModal';
import { ConfirmModal } from '../ui/ConfirmModal';

interface BudgetProgressProps {
  budgets: Budget[];
  onAddBudget?: (dto: CreateBudgetDTO) => Promise<void>;
  onEditBudget?: (dto: UpdateBudgetDTO) => Promise<void>;
  onDeleteBudget?: (id: string) => Promise<void>;
  showManageLink?: boolean;
}

export const BudgetProgress: React.FC<BudgetProgressProps> = ({
  budgets,
  onAddBudget,
  onEditBudget,
  onDeleteBudget,
  showManageLink = false,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [budgetToDelete, setBudgetToDelete] = useState<{ id: string; category: string } | null>(null);

  const handleOpenAdd = () => {
    setEditingBudget(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (budget: Budget) => {
    setEditingBudget(budget);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, category: string) => {
    setBudgetToDelete({ id, category });
  };

  return (
    <div className="rounded-2xl bg-white border border-[#e2e8f0] p-5 space-y-4 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <PieChart className="h-5 w-5 text-[#004ac6]" />
          <h2 className="text-lg font-bold text-[#0f172a]">Anggaran Bulanan</h2>
        </div>

        {showManageLink ? (
          <Link
            href="/wallets#anggaran-bulanan"
            className="flex items-center gap-1 bg-[#eff4ff] hover:bg-[#dce9ff] text-[#004ac6] border border-[#004ac6]/20 px-2.5 py-1 rounded-xl text-xs font-bold transition-all shadow-2xs"
          >
            <span>Kelola</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        ) : onAddBudget ? (
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1 bg-[#eff4ff] hover:bg-[#dce9ff] text-[#004ac6] border border-[#004ac6]/20 px-2.5 py-1 rounded-xl text-xs font-bold transition-all shadow-2xs"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Set Anggaran</span>
          </button>
        ) : null}
      </div>

      {/* List */}
      <div className="space-y-4">
        {budgets.length === 0 ? (
          <div className="py-6 text-center text-xs text-[#64748b] bg-[#f8fafc] rounded-xl border border-dashed border-[#cbd5e1]">
            <p>Belum ada batas anggaran yang diatur.</p>
            {showManageLink ? (
              <Link
                href="/wallets#anggaran-bulanan"
                className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-[#004ac6] hover:underline"
              >
                <span>Atur Anggaran di Dompet Digital</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            ) : onAddBudget ? (
              <button
                onClick={handleOpenAdd}
                className="mt-2 text-xs font-bold text-[#004ac6] hover:underline"
              >
                + Buat Anggaran Pertama
              </button>
            ) : null}
          </div>
        ) : (
          budgets.map((budget) => {
            const percentage = Math.min(
              Math.round((budget.spentAmount / budget.limitAmount) * 100),
              100
            );
            const isWarning = percentage >= 80;
            const isDanger = percentage >= 95;

            return (
              <div
                key={budget.id}
                onClick={() => onEditBudget && handleOpenEdit(budget)}
                className={`space-y-1.5 group relative p-2 -mx-2 rounded-xl transition-all ${
                  onEditBudget ? 'cursor-pointer hover:bg-[#f8fafc] active:scale-[0.99]' : ''
                }`}
              >
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

                  <div className="flex items-center gap-2 text-[#64748b]">
                    <div>
                      <span className="font-bold text-[#0f172a]">
                        {formatRupiah(budget.spentAmount)}
                      </span>{' '}
                      / {formatRupiah(budget.limitAmount)}
                    </div>

                    {/* Action Buttons: on mobile delete is always visible, edit icon is hidden (direct row click edits). On desktop both appear on hover */}
                    {(onEditBudget || onDeleteBudget) && (
                      <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        {onEditBudget && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenEdit(budget);
                            }}
                            title="Edit Anggaran"
                            className="hidden sm:inline-flex p-1 rounded text-[#64748b] hover:text-[#004ac6] hover:bg-[#eff4ff] transition-colors"
                          >
                            <Edit2 className="h-3 w-3" />
                          </button>
                        )}
                        {onDeleteBudget && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(budget.id, budget.category);
                            }}
                            title="Hapus Anggaran"
                            className="p-1 rounded text-[#64748b] hover:text-[#ba1a1a] hover:bg-rose-50 transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5 sm:h-3 sm:w-3" />
                          </button>
                        )}
                      </div>
                    )}
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
          })
        )}
      </div>

      {/* Budget Modal */}
      {onAddBudget && onEditBudget && (
        <BudgetModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          budgetToEdit={editingBudget}
          onAddBudget={onAddBudget}
          onEditBudget={onEditBudget}
        />
      )}

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={budgetToDelete !== null}
        onClose={() => setBudgetToDelete(null)}
        onConfirm={async () => {
          if (budgetToDelete && onDeleteBudget) {
            await onDeleteBudget(budgetToDelete.id);
          }
        }}
        title="Hapus Anggaran?"
        itemName={budgetToDelete?.category}
        description="Batas alokasi untuk kategori ini akan dihapus dari pengawasan anggaran bulanan Anda."
        confirmText="Hapus Anggaran"
        cancelText="Batal"
      />
    </div>
  );
};

