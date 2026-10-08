'use client';

import React, { useState, useMemo } from 'react';
import { AppLayout } from '@/presentation/components/layout/AppLayout';
import { useFinance } from '@/presentation/hooks/useFinance';
import { Bill, CreateBillDTO, UpdateBillDTO } from '@/domain/entities/bill';
import { formatRupiah } from '@/presentation/utils/formatters';
import { BillModal } from '@/presentation/components/features/BillModal';
import { AddTransactionModal } from '@/presentation/components/features/AddTransactionModal';
import { ConfirmModal, PageHeader, Button, Badge, EmptyState } from '@/presentation/components/ui';
import { useTranslation } from '@/presentation/i18n/I18nContext';
import {
  CalendarClock,
  Plus,
  CheckCircle2,
  Clock,
  Calendar,
  CreditCard,
  Edit2,
  Trash2,
  Check,
  Search,
  Sparkles,
  Layers,
} from 'lucide-react';

export default function BillsPage() {
  const { t } = useTranslation();
  const {
    bills,
    wallets,
    addBill,
    editBill,
    removeBill,
    payBill,
    addTransaction,
    transferFunds,
  } = useFinance();

  const [isBillModalOpen, setIsBillModalOpen] = useState(false);
  const [billToEdit, setBillToEdit] = useState<Bill | null>(null);
  const [billToDelete, setBillToDelete] = useState<Bill | null>(null);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);

  const [activeTab, setActiveTab] = useState<'ALL' | 'PENDING' | 'PAID'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [payingBillId, setPayingBillId] = useState<string | number | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // KPI Calculations
  const stats = useMemo(() => {
    const totalBills = bills.length;
    const totalAmount = bills.reduce((acc, b) => acc + (b.amount || 0), 0);

    const paidBills = bills.filter((b) => b.status === 'PAID');
    const paidCount = paidBills.length;
    const paidAmount = paidBills.reduce((acc, b) => acc + (b.amount || 0), 0);

    const pendingBills = bills.filter((b) => b.status === 'PENDING');
    const pendingCount = pendingBills.length;
    const pendingAmount = pendingBills.reduce((acc, b) => acc + (b.amount || 0), 0);

    return {
      totalBills,
      totalAmount,
      paidCount,
      paidAmount,
      pendingCount,
      pendingAmount,
    };
  }, [bills]);

  // Filtered Bills
  const filteredBills = useMemo(() => {
    return bills.filter((bill: Bill) => {
      // Status Filter
      if (activeTab === 'PENDING' && bill.status !== 'PENDING') return false;
      if (activeTab === 'PAID' && bill.status !== 'PAID') return false;

      // Search Filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const nameMatch = bill.name.toLowerCase().includes(query);
        const categoryMatch = bill.category?.toLowerCase().includes(query);
        return nameMatch || categoryMatch;
      }

      return true;
    });
  }, [bills, activeTab, searchQuery]);

  const handleOpenAdd = () => {
    setBillToEdit(null);
    setIsBillModalOpen(true);
  };

  const handleOpenEdit = (bill: Bill) => {
    setBillToEdit(bill);
    setIsBillModalOpen(true);
  };

  const handleDeleteRequest = (bill: Bill) => {
    setBillToDelete(bill);
  };

  const handleSaveBill = async (data: CreateBillDTO | UpdateBillDTO) => {
    if (billToEdit) {
      await editBill(data as UpdateBillDTO);
      showToast('Tagihan berhasil diperbarui.');
    } else {
      await addBill(data as CreateBillDTO);
      showToast('Tagihan baru berhasil ditambahkan.');
    }
  };

  const handlePayNow = async (bill: Bill) => {
    try {
      setPayingBillId(bill.id);
      await payBill(String(bill.id));
      showToast(`Pembayaran "${bill.name}" berhasil dicatat.`);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Gagal memproses pembayaran tagihan.';
      showToast(errMsg);
    } finally {
      setPayingBillId(null);
    }
  };

  return (
    <AppLayout onOpenAddModal={() => setIsTransactionModalOpen(true)}>
      <div className="space-y-6">
        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed top-20 right-6 z-50 flex items-center gap-2 bg-[#0b1c30] text-white px-4 py-3 rounded-2xl shadow-xl text-xs font-semibold animate-in fade-in slide-in-from-top-3 duration-200 border border-slate-700">
            <Sparkles className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Page Header */}
        <PageHeader
          title={t('bills.title')}
          subtitle={t('bills.subtitle')}
          icon={CalendarClock}
          actions={
            <Button
              variant="primary"
              size="md"
              leftIcon={<Plus className="h-4 w-4" />}
              onClick={handleOpenAdd}
            >
              {t('bills.add')}
            </Button>
          }
        />

        {/* KPI Cards Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white border border-[#e2e8f0] rounded-2xl p-5 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-bold text-[#64748b]">Total Semua Tagihan</p>
              <h3 className="text-xl sm:text-2xl font-extrabold text-[#0b1c30] tracking-tight">
                {formatRupiah(stats.totalAmount)}
              </h3>
              <p className="text-[11px] text-[#94a3b8]">{stats.totalBills} tagihan terdaftar</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#eff4ff] text-[#004ac6] flex items-center justify-center shrink-0">
              <Layers className="h-6 w-6" />
            </div>
          </div>

          <div className="bg-white border border-[#e2e8f0] rounded-2xl p-5 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-bold text-amber-700">Belum Dibayar (Pending)</p>
              <h3 className="text-xl sm:text-2xl font-extrabold text-amber-600 tracking-tight">
                {formatRupiah(stats.pendingAmount)}
              </h3>
              <p className="text-[11px] text-amber-800/80">{stats.pendingCount} tagihan perlu diselesaikan</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Clock className="h-6 w-6" />
            </div>
          </div>

          <div className="bg-white border border-[#e2e8f0] rounded-2xl p-5 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-bold text-[#059669]">Sudah Lunas (Paid)</p>
              <h3 className="text-xl sm:text-2xl font-extrabold text-[#059669] tracking-tight">
                {formatRupiah(stats.paidAmount)}
              </h3>
              <p className="text-[11px] text-emerald-700/80">{stats.paidCount} tagihan selesai</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#ecfdf5] text-[#059669] flex items-center justify-center shrink-0">
              <CheckCircle2 className="h-6 w-6" />
            </div>
          </div>
        </div>

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
              Semua ({stats.totalBills})
            </button>
            <button
              onClick={() => setActiveTab('PENDING')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'PENDING'
                  ? 'bg-white text-amber-600 shadow-xs'
                  : 'text-[#64748b] hover:text-amber-600'
              }`}
            >
              Belum Bayar ({stats.pendingCount})
            </button>
            <button
              onClick={() => setActiveTab('PAID')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'PAID'
                  ? 'bg-white text-[#059669] shadow-xs'
                  : 'text-[#64748b] hover:text-[#059669]'
              }`}
            >
              Lunas ({stats.paidCount})
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94a3b8]" />
            <input
              type="text"
              placeholder="Cari tagihan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl text-xs text-[#0b1c30] placeholder-[#94a3b8] focus:bg-white focus:border-[#004ac6] outline-none transition-all"
            />
          </div>
        </div>

        {/* Bills List / Cards */}
        {filteredBills.length === 0 ? (
          <EmptyState
            icon={CalendarClock}
            title={t('bills.emptyTitle')}
            description={t('bills.emptyDesc')}
            actionLabel={t('bills.add')}
            onAction={handleOpenAdd}
            actionIcon={<Plus className="h-4 w-4" />}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBills.map((bill) => {
              const isPaid = bill.status === 'PAID';
              const isPaying = payingBillId === bill.id;

              return (
                <div
                  key={bill.id}
                  className={`bg-white border rounded-2xl p-5 shadow-xs transition-all hover:shadow-md relative flex flex-col justify-between ${
                    isPaid ? 'border-[#e2e8f0] bg-[#f8fafc]/50' : 'border-[#cbd5e1] hover:border-[#004ac6]/40'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748b]">
                          {bill.category || 'Tagihan Rutin'}
                        </span>
                        <h3 className="font-extrabold text-base text-[#0b1c30] truncate mt-0.5">
                          {bill.name}
                        </h3>
                      </div>

                      {isPaid ? (
                        <Badge variant="success" size="sm" icon={<Check className="h-3 w-3" />}>
                          {t('bills.paid')}
                        </Badge>
                      ) : (
                        <Badge variant="warning" size="sm" icon={<Clock className="h-3 w-3" />}>
                          {t('bills.unpaid')}
                        </Badge>
                      )}
                    </div>

                    <div className="mt-4">
                      <p className="text-2xl font-black text-[#0b1c30] tracking-tight">
                        {formatRupiah(bill.amount)}
                      </p>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-xs text-[#64748b] pt-3 border-t border-[#f1f5f9]">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-[#94a3b8]" />
                        <span>Jatuh Tempo: Setiap tgl {bill.dueDay}</span>
                      </div>
                    </div>

                    {bill.walletName && (
                      <div className="mt-2 flex items-center gap-1.5 text-[11px] text-[#475569] bg-[#f8fafc] px-2.5 py-1 rounded-lg border border-[#f1f5f9]">
                        <CreditCard className="h-3.5 w-3.5 text-[#004ac6]" />
                        <span className="truncate">Auto Potong: {bill.walletName}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-5 pt-3 border-t border-[#f1f5f9] flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(bill)}
                        className="p-1.5 text-[#64748b] hover:text-[#004ac6] hover:bg-[#eff4ff] rounded-lg transition-colors"
                        title="Edit Tagihan"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteRequest(bill)}
                        className="p-1.5 text-[#64748b] hover:text-[#ef4444] hover:bg-[#fef2f2] rounded-lg transition-colors"
                        title="Hapus Tagihan"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {!isPaid ? (
                      <Button
                        variant="primary"
                        size="sm"
                        isLoading={isPaying}
                        onClick={() => handlePayNow(bill)}
                        leftIcon={<CheckCircle2 className="h-3.5 w-3.5" />}
                      >
                        {t('bills.pay')}
                      </Button>
                    ) : (
                      <span className="text-[11px] font-bold text-[#059669] flex items-center gap-1">
                        <Check className="h-3.5 w-3.5" /> Terbayar
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Bill Add/Edit Modal */}
      <BillModal
        isOpen={isBillModalOpen}
        onClose={() => setIsBillModalOpen(false)}
        onAddBill={handleSaveBill}
        onEditBill={handleSaveBill}
        billToEdit={billToEdit}
        wallets={wallets}
      />

      {/* Quick Add Transaction Modal */}
      <AddTransactionModal
        isOpen={isTransactionModalOpen}
        onClose={() => setIsTransactionModalOpen(false)}
        onAddTransaction={addTransaction}
        onTransferFunds={transferFunds}
        wallets={wallets}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!billToDelete}
        onClose={() => setBillToDelete(null)}
        onConfirm={async () => {
          if (billToDelete) {
            await removeBill(String(billToDelete.id));
            setBillToDelete(null);
            showToast('Tagihan berhasil dihapus.');
          }
        }}
        title="Hapus Tagihan Ini?"
        itemName={billToDelete?.name}
        description={`Anda yakin ingin menghapus jadwal tagihan "${billToDelete?.name}" sebesar ${formatRupiah(
          billToDelete?.amount || 0
        )}? Riwayat transaksi sebelumnya yang telah dibayar tidak akan terpengaruh.`}
        confirmText="Ya, Hapus"
        cancelText="Batal"
        variant="danger"
      />
    </AppLayout>
  );
}
