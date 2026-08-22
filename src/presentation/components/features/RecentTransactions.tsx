'use client';

import React, { useState } from 'react';
import { Transaction } from '@/domain/entities/transaction';
import { formatRupiah, formatDateID } from '@/presentation/utils/formatters';
import { ArrowUpRight, ArrowDownLeft, Search, Star, UserCheck, MapPin } from 'lucide-react';

interface RecentTransactionsProps {
  transactions: Transaction[];
}

export const RecentTransactions: React.FC<RecentTransactionsProps> = ({
  transactions,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTransactions = transactions.filter(
    (t) =>
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.walletName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.items &&
        t.items.some((item) =>
          item.itemName.toLowerCase().includes(searchTerm.toLowerCase())
        ))
  );

  return (
    <div className="rounded-2xl bg-white border border-[#e2e8f0] p-5 space-y-4 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-[#0f172a]">Histori Ledger Transaksi</h2>
            <span className="text-[10px] font-bold bg-[#004ac6]/10 text-[#004ac6] border border-[#004ac6]/20 px-2 py-0.5 rounded-full">
              Header-Detail ERD
            </span>
          </div>
          <p className="text-xs text-[#64748b]">
            Jejak audit otomatis dengan rincian item, opsi Nitip Teman, dan Worthiness Rating
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#94a3b8]" />
          <input
            type="text"
            placeholder="Cari item, lokasi, teman..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl bg-[#f8fafc] border border-[#e2e8f0] pl-9 pr-3 py-2 text-xs text-[#0f172a] placeholder-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#004ac6]/20 focus:border-[#004ac6] transition-shadow"
          />
        </div>
      </div>

      <div className="space-y-3">
        {filteredTransactions.length === 0 ? (
          <div className="py-8 text-center text-[#64748b] text-xs">
            Tidak ada transaksi yang ditemukan.
          </div>
        ) : (
          filteredTransactions.map((tx) => {
            const isIncome = tx.type === 'IN' || tx.type === 'INITIAL_BALANCE';
            return (
              <div
                key={tx.id}
                className="rounded-xl bg-white border border-[#e2e8f0] p-4 space-y-3 hover:border-[#cbd5e1] hover:shadow-md transition-all duration-200"
              >
                {/* Transaction Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl shadow-sm ${
                        isIncome
                          ? 'bg-[#f0fdf4] text-[#16a34a] border border-[#bbf7d0]'
                          : 'bg-[#fff1f2] text-[#e11d48] border border-[#fecdd3]'
                      }`}
                    >
                      {isIncome ? (
                        <ArrowDownLeft className="h-5 w-5" />
                      ) : (
                        <ArrowUpRight className="h-5 w-5" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-[#0f172a] text-sm">
                        {tx.title}
                      </h4>
                      <div className="flex items-center gap-2 text-[11px] text-[#64748b] mt-0.5">
                        <span className="font-medium text-[#475569]">{tx.walletName}</span>
                        <span>•</span>
                        <span>{formatDateID(tx.transactionDate)}</span>
                        {tx.locationName && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1 text-[#475569]">
                              <MapPin className="h-3 w-3 text-[#94a3b8]" />
                              {tx.locationName}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`text-base font-bold font-mono tracking-tight ${
                        isIncome ? 'text-[#16a34a]' : 'text-[#0f172a]'
                      }`}
                    >
                      {isIncome ? '+' : '-'} {formatRupiah(tx.totalAmount)}
                    </span>
                    <div className="mt-0.5">
                      <span className="inline-block rounded-md bg-[#f1f5f9] px-2 py-0.5 text-[10px] font-bold text-[#64748b]">
                        {tx.type}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Transaction Items (Granular Header-Detail) */}
                {tx.items && tx.items.length > 0 && (
                  <div className="pt-3 border-t border-[#f1f5f9] space-y-2">
                    <p className="text-[10px] uppercase font-bold text-[#94a3b8] tracking-wider">
                      Rincian Item ({tx.items.length})
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {tx.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between rounded-lg bg-[#f8fafc] p-2.5 border border-[#e2e8f0] text-xs hover:bg-white transition-colors"
                        >
                          <div className="space-y-0.5">
                            <span className="font-bold text-[#0f172a]">
                              {item.itemName}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-[#004ac6] font-bold bg-[#004ac6]/10 px-1.5 py-0.5 rounded">
                                {item.categoryName}
                              </span>

                              {/* Nitip Teman Badge */}
                              {item.isFriendOrder && (
                                <span className="flex items-center gap-1 text-[10px] text-[#d97706] bg-[#fef3c7] border border-[#fde68a] px-1.5 py-0.5 rounded font-bold">
                                  <UserCheck className="h-3 w-3" />
                                  <span>Nitip {item.friendName}</span>
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="text-right space-y-1">
                            <span className="font-mono font-bold text-[#475569]">
                              {formatRupiah(item.amount)}
                            </span>
                            {item.rating && (
                              <div className="flex items-center justify-end gap-0.5">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-2.5 w-2.5 ${
                                      i < (item.rating || 0)
                                        ? 'text-amber-400 fill-amber-400'
                                        : 'text-[#cbd5e1]'
                                    }`}
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
