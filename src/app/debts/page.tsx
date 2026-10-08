'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { AppLayout } from '@/presentation/components/layout/AppLayout';
import { useFinance } from '@/presentation/hooks/useFinance';
import { formatRupiah, formatDateID } from '@/presentation/utils/formatters';
import { AddTransactionModal } from '@/presentation/components/features/AddTransactionModal';
import { PageHeader, Button, Badge, EmptyState } from '@/presentation/components/ui';
import { useTranslation } from '@/presentation/i18n/I18nContext';
import {
  Users,
  CheckCircle2,
  Clock,
  Search,
  Sparkles,
  Check,
  RotateCcw,
  Receipt,
  UserCheck,
  ShoppingBag,
  Plus,
} from 'lucide-react';

interface FriendDebtItem {
  id: string;
  transactionId: string;
  transactionTitle: string;
  transactionDate: string;
  friendName: string;
  itemName: string;
  categoryName: string;
  amount: number;
  isSettled: boolean;
}

export default function DebtsPage() {
  const { t } = useTranslation();
  const { transactions, wallets, addTransaction, transferFunds } = useFinance();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'ALL' | 'UNSETTLED' | 'SETTLED'>('ALL');
  const [settledMap, setSettledMap] = useState<Record<string, boolean>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load local settlement status overrides from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('auroka_friend_debts_settled');
        if (stored) {
          setSettledMap(JSON.parse(stored));
        }
      } catch (e) {
        console.error('Failed to load settled debts state', e);
      }
    }
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Extract all friend order items from transactions
  const friendDebts = useMemo<FriendDebtItem[]>(() => {
    const list: FriendDebtItem[] = [];
    transactions.forEach((tx) => {
      if (tx.items && tx.items.length > 0) {
        tx.items.forEach((item) => {
          if (item.isFriendOrder && item.friendName) {
            const compositeId = `${tx.id}-${item.id}`;
            const isSettled = settledMap[compositeId] ?? false;
            list.push({
              id: compositeId,
              transactionId: tx.id,
              transactionTitle: tx.title || 'Belanja Bersama',
              transactionDate: tx.transactionDate,
              friendName: item.friendName,
              itemName: item.itemName,
              categoryName: item.categoryName || 'Belanja',
              amount: item.amount,
              isSettled,
            });
          }
        });
      }
    });
    return list;
  }, [transactions, settledMap]);

  // Aggregate statistics per friend
  const friendSummary = useMemo(() => {
    const map: Record<string, { total: number; unsettled: number; count: number }> = {};
    friendDebts.forEach((d) => {
      if (!map[d.friendName]) {
        map[d.friendName] = { total: 0, unsettled: 0, count: 0 };
      }
      map[d.friendName].total += d.amount;
      map[d.friendName].count += 1;
      if (!d.isSettled) {
        map[d.friendName].unsettled += d.amount;
      }
    });

    return Object.entries(map).map(([name, data]) => ({
      name,
      total: data.total,
      unsettled: data.unsettled,
      count: data.count,
    }));
  }, [friendDebts]);

  // Overall Totals
  const overallStats = useMemo(() => {
    const totalPiutang = friendDebts.reduce((acc, d) => acc + d.amount, 0);
    const unsettledPiutang = friendDebts.filter((d) => !d.isSettled).reduce((acc, d) => acc + d.amount, 0);
    const settledPiutang = friendDebts.filter((d) => d.isSettled).reduce((acc, d) => acc + d.amount, 0);
    const totalFriends = friendSummary.length;

    return {
      totalPiutang,
      unsettledPiutang,
      settledPiutang,
      totalFriends,
      unsettledCount: friendDebts.filter((d) => !d.isSettled).length,
      settledCount: friendDebts.filter((d) => d.isSettled).length,
    };
  }, [friendDebts, friendSummary]);

  // Filtered List
  const filteredDebts = useMemo(() => {
    return friendDebts.filter((d) => {
      if (activeTab === 'UNSETTLED' && d.isSettled) return false;
      if (activeTab === 'SETTLED' && !d.isSettled) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          d.friendName.toLowerCase().includes(q) ||
          d.itemName.toLowerCase().includes(q) ||
          d.transactionTitle.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [friendDebts, activeTab, searchQuery]);

  const toggleSettlement = (id: string, friendName: string, isSettledNow: boolean) => {
    const updatedMap = { ...settledMap, [id]: !isSettledNow };
    setSettledMap(updatedMap);
    if (typeof window !== 'undefined') {
      localStorage.setItem('auroka_friend_debts_settled', JSON.stringify(updatedMap));
    }
    if (!isSettledNow) {
      showToast(`Hore! Titipan ${friendName} berhasil ditandai Lunas.`);
    } else {
      showToast(`Status titipan ${friendName} dikembalikan ke Belum Lunas.`);
    }
  };

  return (
    <AppLayout onOpenAddModal={() => setIsModalOpen(true)}>
      <div className="space-y-6">
        {/* Toast Alert */}
        {toastMessage && (
          <div className="fixed top-20 right-6 z-50 flex items-center gap-2 bg-[#0b1c30] text-white px-4 py-3 rounded-2xl shadow-xl text-xs font-semibold animate-in fade-in slide-in-from-top-3 duration-200 border border-slate-700">
            <Sparkles className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Page Header */}
        <PageHeader
          title={t('debts.title')}
          subtitle={t('debts.subtitle')}
          icon={Users}
          actions={
            <Button
              variant="primary"
              size="md"
              leftIcon={<Plus className="h-4 w-4" />}
              onClick={() => setIsModalOpen(true)}
            >
              Catat Belanja Teman
            </Button>
          }
        />

        {/* Overview KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white border border-[#e2e8f0] rounded-2xl p-5 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-bold text-amber-700">Belum Ditagih (Piutang)</p>
              <h3 className="text-xl sm:text-2xl font-extrabold text-amber-600 tracking-tight">
                {formatRupiah(overallStats.unsettledPiutang)}
              </h3>
              <p className="text-[11px] text-amber-800/80">
                {overallStats.unsettledCount} item dari {overallStats.totalFriends} teman
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Clock className="h-6 w-6" />
            </div>
          </div>

          <div className="bg-white border border-[#e2e8f0] rounded-2xl p-5 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-bold text-[#059669]">Sudah Dilunasi</p>
              <h3 className="text-xl sm:text-2xl font-extrabold text-[#059669] tracking-tight">
                {formatRupiah(overallStats.settledPiutang)}
              </h3>
              <p className="text-[11px] text-emerald-700/80">
                {overallStats.settledCount} item telah selesai
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#ecfdf5] text-[#059669] flex items-center justify-center shrink-0">
              <CheckCircle2 className="h-6 w-6" />
            </div>
          </div>

          <div className="bg-white border border-[#e2e8f0] rounded-2xl p-5 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-bold text-[#004ac6]">Teman Terlibat</p>
              <h3 className="text-xl sm:text-2xl font-extrabold text-[#0b1c30] tracking-tight">
                {overallStats.totalFriends} Orang
              </h3>
              <p className="text-[11px] text-[#64748b]">Total akumulasi piutang patungan</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#eff4ff] text-[#004ac6] flex items-center justify-center shrink-0">
              <UserCheck className="h-6 w-6" />
            </div>
          </div>
        </div>

        {/* Section: Rekap Piutang Per Teman */}
        {friendSummary.length > 0 && (
          <div className="bg-white border border-[#e2e8f0] rounded-2xl p-5 shadow-xs space-y-4">
            <h2 className="text-sm font-extrabold text-[#0b1c30] flex items-center gap-2">
              <Users className="h-4 w-4 text-[#004ac6]" />
              <span>Ringkasan Tagihan Per Teman</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {friendSummary.map((f) => (
                <div
                  key={f.name}
                  className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-3.5 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-[#0b1c30] truncate">{f.name}</span>
                    <span className="text-[10px] text-[#64748b] bg-white px-2 py-0.5 rounded-full border border-[#e2e8f0]">
                      {f.count} item
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-[#64748b] block">Sisa Belum Bayar:</span>
                    <p
                      className={`text-sm font-black ${
                        f.unsettled > 0 ? 'text-amber-600' : 'text-[#059669]'
                      }`}
                    >
                      {f.unsettled > 0 ? formatRupiah(f.unsettled) : 'Lunas ✨'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filter Controls & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-[#e2e8f0] rounded-2xl p-3 shadow-xs">
          <div className="flex items-center gap-1 bg-[#f8fafc] p-1 rounded-xl border border-[#f1f5f9]">
            <button
              onClick={() => setActiveTab('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'ALL'
                  ? 'bg-white text-[#004ac6] shadow-xs'
                  : 'text-[#64748b] hover:text-[#0b1c30]'
              }`}
            >
              Semua ({friendDebts.length})
            </button>
            <button
              onClick={() => setActiveTab('UNSETTLED')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'UNSETTLED'
                  ? 'bg-white text-amber-600 shadow-xs'
                  : 'text-[#64748b] hover:text-amber-600'
              }`}
            >
              Belum Lunas ({overallStats.unsettledCount})
            </button>
            <button
              onClick={() => setActiveTab('SETTLED')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'SETTLED'
                  ? 'bg-white text-[#059669] shadow-xs'
                  : 'text-[#64748b] hover:text-[#059669]'
              }`}
            >
              Lunas ({overallStats.settledCount})
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94a3b8]" />
            <input
              type="text"
              placeholder="Cari teman atau barang..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl text-xs text-[#0b1c30] placeholder-[#94a3b8] focus:bg-white focus:border-[#004ac6] outline-none transition-all"
            />
          </div>
        </div>

        {/* Debts Table List */}
        {filteredDebts.length === 0 ? (
          <EmptyState
            icon={Users}
            title={t('debts.emptyTitle')}
            description={t('debts.emptyDesc')}
            actionLabel="Catat Transaksi Bersama"
            onAction={() => setIsModalOpen(true)}
            actionIcon={<Plus className="h-4 w-4" />}
          />
        ) : (
          <div className="bg-white border border-[#e2e8f0] rounded-2xl shadow-xs overflow-hidden">
            <div className="divide-y divide-[#f1f5f9]">
              {filteredDebts.map((debt) => (
                <div
                  key={debt.id}
                  className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                    debt.isSettled ? 'bg-[#f8fafc]/50' : 'hover:bg-[#f8fafc]'
                  }`}
                >
                  <div className="flex items-start gap-3.5 min-w-0 flex-1">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                        debt.isSettled
                          ? 'bg-[#ecfdf5] text-[#059669]'
                          : 'bg-amber-50 text-amber-600'
                      }`}
                    >
                      {debt.isSettled ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : (
                        <ShoppingBag className="h-5 w-5" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-extrabold text-sm text-[#0b1c30]">
                          {debt.friendName}
                        </span>
                        <span className="text-[11px] text-[#64748b]">menitip</span>
                        <span className="font-bold text-xs text-[#004ac6] bg-[#eff4ff] px-2 py-0.5 rounded-lg">
                          {debt.itemName}
                        </span>
                        {debt.isSettled ? (
                          <Badge variant="success" size="sm">
                            Lunas
                          </Badge>
                        ) : (
                          <Badge variant="warning" size="sm">
                            Belum Bayar
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-[11px] text-[#94a3b8] mt-1.5 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Receipt className="h-3 w-3" />
                          {debt.transactionTitle}
                        </span>
                        <span>•</span>
                        <span>{formatDateID(debt.transactionDate)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#f1f5f9]">
                    <div className="text-left sm:text-right">
                      <span className="text-[10px] text-[#64748b] block">Nominal</span>
                      <p className="text-base sm:text-lg font-black text-[#0b1c30]">
                        {formatRupiah(debt.amount)}
                      </p>
                    </div>

                    <Button
                      variant={debt.isSettled ? 'outline' : 'success'}
                      size="sm"
                      onClick={() => toggleSettlement(debt.id, debt.friendName, debt.isSettled)}
                      leftIcon={
                        debt.isSettled ? (
                          <RotateCcw className="h-3.5 w-3.5" />
                        ) : (
                          <Check className="h-3.5 w-3.5" />
                        )
                      }
                    >
                      {debt.isSettled ? 'Batal Lunas' : 'Tandai Lunas'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Quick Add Transaction Modal */}
      <AddTransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddTransaction={addTransaction}
        onTransferFunds={transferFunds}
        wallets={wallets}
      />
    </AppLayout>
  );
}
