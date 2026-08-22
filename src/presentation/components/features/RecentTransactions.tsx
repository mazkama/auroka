'use client';

import React, { useState, useMemo } from 'react';
import { Transaction } from '@/domain/entities/transaction';
import { formatRupiah, formatDateID } from '@/presentation/utils/formatters';
import {
  ArrowUpRight,
  ArrowDownLeft,
  Search,
  Star,
  UserCheck,
  MapPin,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
} from 'lucide-react';

interface RecentTransactionsProps {
  transactions: Transaction[];
  enablePagination?: boolean;
  initialItemsPerPage?: number;
}

export const RecentTransactions: React.FC<RecentTransactionsProps> = ({
  transactions,
  enablePagination = true,
  initialItemsPerPage = 5,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(initialItemsPerPage);

  // Filter transactions based on search query
  const filteredTransactions = useMemo(() => {
    return transactions.filter(
      (t) =>
        t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.walletName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.locationName && t.locationName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (t.items &&
          t.items.some(
            (item) =>
              item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
              item.categoryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
              (item.friendName && item.friendName.toLowerCase().includes(searchTerm.toLowerCase()))
          ))
    );
  }, [transactions, searchTerm]);

  // Total pages calculation
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage) || 1;

  // Ensure current page stays within valid bounds
  const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  // Slice paginated transactions
  const displayedTransactions = useMemo(() => {
    if (!enablePagination) return filteredTransactions;
    const startIndex = (validCurrentPage - 1) * itemsPerPage;
    return filteredTransactions.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredTransactions, enablePagination, validCurrentPage, itemsPerPage]);

  const startIndex = (validCurrentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(validCurrentPage * itemsPerPage, filteredTransactions.length);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page on new search
  };

  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  return (
    <div className="rounded-2xl bg-white border border-[#e2e8f0] p-5 space-y-4 shadow-sm">
      {/* Header & Search Controls */}
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

        {/* Search Bar */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#94a3b8]" />
          <input
            type="text"
            placeholder="Cari item, lokasi, teman..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full rounded-xl bg-[#f8fafc] border border-[#e2e8f0] pl-9 pr-3 py-2 text-xs text-[#0f172a] placeholder-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#004ac6]/20 focus:border-[#004ac6] transition-shadow"
          />
        </div>
      </div>

      {/* Transaction Items List */}
      <div className="space-y-3">
        {displayedTransactions.length === 0 ? (
          <div className="py-8 text-center text-[#64748b] text-xs">
            Tidak ada transaksi yang ditemukan.
          </div>
        ) : (
          displayedTransactions.map((tx) => {
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

      {/* Pagination Controls */}
      {enablePagination && filteredTransactions.length > 0 && (
        <div className="pt-4 border-t border-[#f1f5f9] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#64748b]">
          {/* Left info & items per page select */}
          <div className="flex items-center justify-between sm:justify-start gap-4">
            <div className="flex items-center gap-1.5">
              <SlidersHorizontal className="h-3.5 w-3.5 text-[#94a3b8]" />
              <span>Tampilkan:</span>
              <select
                value={itemsPerPage}
                onChange={handleItemsPerPageChange}
                className="rounded-lg bg-[#f8fafc] border border-[#e2e8f0] px-2 py-1 text-xs font-semibold text-[#0f172a] focus:outline-none focus:border-[#004ac6]"
              >
                <option value={5}>5 / hal</option>
                <option value={10}>10 / hal</option>
                <option value={20}>20 / hal</option>
              </select>
            </div>

            <p className="text-[#64748b]">
              Menampilkan <span className="font-bold text-[#0f172a]">{startIndex}-{endIndex}</span> dari{' '}
              <span className="font-bold text-[#0f172a]">{filteredTransactions.length}</span> transaksi
            </p>
          </div>

          {/* Right Page Buttons */}
          <div className="flex items-center justify-end gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={validCurrentPage === 1}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[#e2e8f0] bg-white text-[#475569] font-medium hover:bg-[#f8fafc] hover:border-[#cbd5e1] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              aria-label="Halaman Sebelumnya"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Sebelumnya</span>
            </button>

            <div className="flex items-center gap-1 px-1">
              {[...Array(totalPages)].map((_, idx) => {
                const pageNum = idx + 1;
                const isActive = pageNum === validCurrentPage;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-[#004ac6] text-white shadow-sm shadow-[#004ac6]/20'
                        : 'bg-white text-[#475569] border border-[#e2e8f0] hover:bg-[#f8fafc]'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={validCurrentPage === totalPages}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[#e2e8f0] bg-white text-[#475569] font-medium hover:bg-[#f8fafc] hover:border-[#cbd5e1] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              aria-label="Halaman Selanjutnya"
            >
              <span className="hidden sm:inline">Selanjutnya</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

