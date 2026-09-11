'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
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
  Edit2,
  Trash2,
  ArrowRight,
} from 'lucide-react';

interface RecentTransactionsProps {
  transactions: Transaction[];
  enablePagination?: boolean;
  initialItemsPerPage?: number;
  maxDisplay?: number;
  showManageLink?: boolean;
  onEdit?: (tx: Transaction) => void;
  onDelete?: (id: string) => void;
}

export const RecentTransactions: React.FC<RecentTransactionsProps> = ({
  transactions,
  enablePagination = true,
  initialItemsPerPage = 5,
  maxDisplay,
  showManageLink = false,
  onEdit,
  onDelete,
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

  // Slice paginated or max-display transactions
  const displayedTransactions = useMemo(() => {
    if (showManageLink && maxDisplay) {
      return filteredTransactions.slice(0, maxDisplay);
    }
    if (!enablePagination) return filteredTransactions;
    const startIndex = (validCurrentPage - 1) * itemsPerPage;
    return filteredTransactions.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredTransactions, showManageLink, maxDisplay, enablePagination, validCurrentPage, itemsPerPage]);

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
    <div className="rounded-2xl bg-white border border-[#e2e8f0] p-4 sm:p-5 space-y-4 shadow-sm overflow-hidden">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-[#0f172a]">Histori Transaksi Terakhir</h2>
            <span className="text-[10px] font-bold bg-[#004ac6]/10 text-[#004ac6] border border-[#004ac6]/20 px-2 py-0.5 rounded-full">
              {showManageLink ? 'Ringkasan' : 'Header-Detail ERD'}
            </span>
          </div>
          <p className="text-xs text-[#64748b]">
            {showManageLink
              ? 'Daftar transaksi terbaru di buku besar Anda'
              : 'Jejak audit otomatis dengan rincian item, opsi Nitip Teman, dan Worthiness Rating'}
          </p>
        </div>

        {showManageLink ? (
          <Link
            href="/transactions"
            className="flex items-center gap-1.5 bg-[#eff4ff] hover:bg-[#dce9ff] text-[#004ac6] border border-[#004ac6]/20 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-2xs self-start sm:self-auto shrink-0"
          >
            <span>Kelola Transaksi</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        ) : (
          /* Search Bar */
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
        )}
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
                onClick={() => onEdit && onEdit(tx)}
                className={`rounded-xl bg-white border border-[#e2e8f0] p-3.5 sm:p-4 space-y-3 hover:border-[#cbd5e1] hover:shadow-md transition-all duration-200 overflow-hidden relative group ${
                  onEdit ? 'cursor-pointer active:scale-[0.99]' : ''
                }`}
              >
                {/* Transaction Header */}
                <div className="flex items-start justify-between gap-2.5 sm:gap-3">
                  <div className="flex items-start sm:items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                    <div
                      className={`flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl shadow-sm ${
                        isIncome
                          ? 'bg-[#f0fdf4] text-[#16a34a] border border-[#bbf7d0]'
                          : 'bg-[#fff1f2] text-[#e11d48] border border-[#fecdd3]'
                      }`}
                    >
                      {isIncome ? (
                        <ArrowDownLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                      ) : (
                        <ArrowUpRight className="h-4 w-4 sm:h-5 sm:w-5" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-[#0f172a] text-xs sm:text-sm break-words leading-tight sm:leading-normal group-hover:text-[#004ac6] transition-colors">
                        {tx.title}
                      </h4>
                      <div className="flex flex-wrap items-center gap-x-1.5 sm:gap-x-2 gap-y-0.5 text-[10px] sm:text-[11px] text-[#64748b] mt-1">
                        <span className="font-medium text-[#475569]">{tx.walletName}</span>
                        <span>•</span>
                        <span>{formatDateID(tx.transactionDate)}</span>
                        {tx.locationName && (
                          <>
                            <span>•</span>
                            <span className="inline-flex items-center gap-1 text-[#475569] truncate max-w-[130px] sm:max-w-none">
                              <MapPin className="h-3 w-3 text-[#94a3b8] shrink-0" />
                              <span className="truncate">{tx.locationName}</span>
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0 flex flex-col items-end">
                    <span
                      className={`text-sm sm:text-base font-bold font-mono tracking-tight whitespace-nowrap block ${
                        isIncome ? 'text-[#16a34a]' : 'text-[#0f172a]'
                      }`}
                    >
                      {isIncome ? '+' : '-'} {formatRupiah(tx.totalAmount)}
                    </span>
                    <div className="mt-1 flex items-center justify-end gap-1.5">
                      <span
                        className={`inline-block rounded-md px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[10px] font-bold ${
                          isIncome
                            ? 'bg-[#f0fdf4] text-[#16a34a] border border-[#bbf7d0]'
                            : 'bg-[#fff1f2] text-[#e11d48] border border-[#fecdd3]'
                        }`}
                      >
                        {tx.type}
                      </span>

                      {/* Action buttons: on mobile delete is always visible, edit icon hidden (direct card click edits). On desktop both appear on hover */}
                      {(onEdit || onDelete) && (
                        <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                          {onEdit && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onEdit(tx);
                              }}
                              title="Edit Transaksi"
                              className="hidden sm:inline-flex p-1 rounded-lg text-[#64748b] hover:text-[#004ac6] hover:bg-[#eff4ff] transition-colors"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                          {onDelete && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onDelete(tx.id);
                              }}
                              title="Hapus Transaksi"
                              className="p-1 rounded-lg text-[#64748b] hover:text-[#ba1a1a] hover:bg-rose-50 transition-colors"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      )}
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
                          className="flex items-center justify-between gap-2 rounded-lg bg-[#f8fafc] p-2 sm:p-2.5 border border-[#e2e8f0] text-xs hover:bg-white transition-colors"
                        >
                          <div className="space-y-1 min-w-0 flex-1">
                            <span className="font-bold text-[#0f172a] block truncate text-[11px] sm:text-xs">
                              {item.itemName}
                            </span>
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="text-[9px] sm:text-[10px] text-[#004ac6] font-bold bg-[#004ac6]/10 px-1.5 py-0.5 rounded shrink-0">
                                {item.categoryName}
                              </span>

                              {/* Nitip Teman Badge */}
                              {item.isFriendOrder && (
                                <span className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] text-[#d97706] bg-[#fef3c7] border border-[#fde68a] px-1.5 py-0.5 rounded font-bold shrink-0">
                                  <UserCheck className="h-3 w-3" />
                                  <span>Nitip {item.friendName}</span>
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="text-right space-y-1 shrink-0">
                            <span className="font-mono font-bold text-[#475569] text-[11px] sm:text-xs block whitespace-nowrap">
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

      {/* Bottom link to view full history on dashboard */}
      {showManageLink && transactions.length > (maxDisplay || 5) && (
        <div className="pt-2">
          <Link
            href="/transactions"
            className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-[#f8fafc] hover:bg-[#eff4ff] border border-[#e2e8f0] hover:border-[#004ac6]/30 text-xs font-bold text-[#004ac6] transition-colors"
          >
            <span>Buka Seluruh Histori Transaksi ({transactions.length} Transaksi)</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}

      {/* Pagination Controls */}
      {!showManageLink && enablePagination && filteredTransactions.length > 0 && (
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

