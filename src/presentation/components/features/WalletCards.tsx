'use client';

import React from 'react';
import { Wallet as WalletEntity } from '@/domain/entities/wallet';
import { formatRupiah } from '@/presentation/utils/formatters';
import { Building2, CreditCard, Smartphone, TrendingUp, Banknote, Edit2, Trash2 } from 'lucide-react';

interface WalletCardsProps {
  wallets: WalletEntity[];
  onEdit?: (wallet: WalletEntity) => void;
  onDelete?: (id: string) => void;
}

const getWalletIcon = (type: string) => {
  switch (type) {
    case 'BANK':
      return Building2;
    case 'E_WALLET':
      return Smartphone;
    case 'INVESTMENT':
      return TrendingUp;
    case 'CASH':
      return Banknote;
    default:
      return CreditCard;
  }
};

export const WalletCards: React.FC<WalletCardsProps> = ({ wallets, onEdit, onDelete }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-lg font-bold text-[#0f172a]">Dompet & Rekening</h2>
        <span className="text-xs text-[#64748b] font-bold">
          {wallets.length} Akun Terhubung
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {wallets.map((wallet) => {
          const Icon = getWalletIcon(wallet.type);
          return (
            <div
              key={wallet.id}
              className="group relative rounded-2xl bg-white border border-[#e2e8f0] p-4 hover:border-[#cbd5e1] hover:shadow-md transition-all duration-200 shadow-sm overflow-hidden"
            >
              {/* Action Buttons on Hover */}
              <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {onEdit && (
                  <button
                    onClick={() => onEdit(wallet)}
                    className="p-1.5 bg-[#f1f5f9] hover:bg-[#e2e8f0] text-[#64748b] hover:text-[#004ac6] rounded-lg transition-colors"
                    aria-label="Edit Wallet"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => onDelete(wallet.id)}
                    className="p-1.5 bg-[#f1f5f9] hover:bg-[#fee2e2] text-[#64748b] hover:text-[#ba1a1a] rounded-lg transition-colors"
                    aria-label="Delete Wallet"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-sm"
                    style={{ backgroundColor: wallet.color }}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="pr-12">
                    <h4 className="text-sm font-bold text-[#0f172a] group-hover:text-[#004ac6] transition-colors truncate max-w-[120px]">
                      {wallet.name}
                    </h4>
                    {wallet.accountNumber && (
                      <p className="text-xs text-[#64748b] font-mono">
                        {wallet.accountNumber}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#f1f5f9] flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider mb-0.5">
                    {wallet.type.replace('_', ' ')}
                  </span>
                  <span className="text-xs font-semibold text-[#64748b]">Saldo</span>
                </div>
                <span className="text-base font-bold text-[#0f172a]">
                  {formatRupiah(wallet.balance)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
