'use client';

import React, { useState } from 'react';
import { Wallet } from '@/domain/entities/wallet';
import { Category, TransactionType } from '@/domain/entities/transaction';
import { CURRENT_USER_ID } from '@/infrastructure/mock/mockData';
import { X, Plus, UserCheck } from 'lucide-react';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  wallets: Wallet[];
  onAddTransaction: (data: {
    userId: string;
    walletId: string;
    type: TransactionType;
    title: string;
    totalAmount: number;
    locationName?: string;
    cityName?: string;
    note?: string;
    items?: {
      itemName: string;
      categoryId: string;
      categoryName: Category;
      amount: number;
      isFriendOrder?: boolean;
      friendName?: string;
      rating?: number;
    }[];
  }) => Promise<void>;
}

const CATEGORIES: Category[] = [
  'Gaji',
  'Investasi',
  'Makan & Minum',
  'Belanja',
  'Listrik & Air',
  'Transportasi',
  'Hiburan',
  'Kesehatan',
  'Lainnya',
];

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  isOpen,
  onClose,
  wallets,
  onAddTransaction,
}) => {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>('OUT');
  const [category, setCategory] = useState<Category>('Makan & Minum');
  const [walletId, setWalletId] = useState(wallets[0]?.id || 'w-1');
  const [locationName, setLocationName] = useState('');
  const [isFriendOrder, setIsFriendOrder] = useState(false);
  const [friendName, setFriendName] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !amount) {
      setError('Judul dan nominal transaksi wajib diisi');
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Nominal harus berupa angka valid lebih dari 0');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      await onAddTransaction({
        userId: CURRENT_USER_ID,
        walletId,
        type,
        title,
        totalAmount: numAmount,
        locationName,
        note,
        items: [
          {
            itemName: title,
            categoryId: 'c-1',
            categoryName: category,
            amount: numAmount,
            isFriendOrder,
            friendName: isFriendOrder ? friendName : undefined,
            rating: 5,
          },
        ],
      });

      // Reset
      setTitle('');
      setAmount('');
      setNote('');
      setLocationName('');
      setIsFriendOrder(false);
      setFriendName('');
      onClose();
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : 'Gagal menyimpan transaksi'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-[#0f172a]/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      {/* Modal Body */}
      <div className="relative bg-white rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-[#e2e8f0]">
        <div className="flex items-center justify-between p-5 border-b border-[#f1f5f9] bg-white">
          <div>
            <h3 className="text-lg font-bold text-[#0f172a]">Catat Transaksi Auroka</h3>
            <p className="text-[11px] text-[#64748b]">Arsitektur Header-Detail & Ledger System</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-[#64748b] hover:bg-[#f1f5f9] hover:text-[#0f172a] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mx-5 mt-5 rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-5 bg-[#f8fafc]">
          <div>
            <label className="block text-xs font-semibold text-[#64748b] uppercase tracking-wider mb-2">
              Tipe Transaksi
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setType('OUT')}
                className={`py-2 rounded-xl font-bold text-xs border transition-colors ${
                  type === 'OUT'
                    ? 'bg-rose-50 border-rose-500 text-rose-600 shadow-sm'
                    : 'bg-white border-[#e2e8f0] text-[#64748b] hover:bg-[#f1f5f9]'
                }`}
              >
                Pengeluaran
              </button>
              <button
                type="button"
                onClick={() => setType('IN')}
                className={`py-2 rounded-xl font-bold text-xs border transition-colors ${
                  type === 'IN'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-600 shadow-sm'
                    : 'bg-white border-[#e2e8f0] text-[#64748b] hover:bg-[#f1f5f9]'
                }`}
              >
                Pemasukan
              </button>
              <button
                type="button"
                onClick={() => setType('TRANSFER')}
                className={`py-2 rounded-xl font-bold text-xs border transition-colors ${
                  type === 'TRANSFER'
                    ? 'bg-indigo-50 border-indigo-500 text-indigo-600 shadow-sm'
                    : 'bg-white border-[#e2e8f0] text-[#64748b] hover:bg-[#f1f5f9]'
                }`}
              >
                Transfer
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#64748b] uppercase tracking-wider mb-2">
              Judul / Nama Transaksi
            </label>
            <input
              type="text"
              placeholder="Contoh: Makan Malam Resto & Cafe"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl bg-white border border-[#e2e8f0] px-3.5 py-2.5 text-[#0f172a] placeholder-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#004ac6]/20 focus:border-[#004ac6] transition-shadow text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#64748b] uppercase tracking-wider mb-2">
              Total Nominal (IDR)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-[#64748b] font-mono text-sm">Rp</span>
              <input
                type="number"
                placeholder="Contoh: 150000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full rounded-xl bg-white border border-[#e2e8f0] pl-10 pr-3.5 py-2.5 text-[#0f172a] font-mono placeholder-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#004ac6]/20 focus:border-[#004ac6] transition-shadow text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#64748b] uppercase tracking-wider mb-2">
                Kategori
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                className="w-full rounded-xl bg-white border border-[#e2e8f0] px-3.5 py-2.5 text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-[#004ac6]/20 focus:border-[#004ac6] transition-shadow text-sm"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#64748b] uppercase tracking-wider mb-2">
                Dompet Sumber
              </label>
              <select
                value={walletId}
                onChange={(e) => setWalletId(e.target.value)}
                className="w-full rounded-xl bg-white border border-[#e2e8f0] px-3.5 py-2.5 text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-[#004ac6]/20 focus:border-[#004ac6] transition-shadow text-sm"
              >
                {wallets.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#64748b] uppercase tracking-wider mb-2">
              Lokasi / Tempat (Opsional)
            </label>
            <input
              type="text"
              placeholder="Contoh: SCBD Mall / Tokopedia"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              className="w-full rounded-xl bg-white border border-[#e2e8f0] px-3.5 py-2.5 text-[#0f172a] placeholder-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#004ac6]/20 focus:border-[#004ac6] transition-shadow text-sm"
            />
          </div>

          {/* Opsi Nitip Teman */}
          <div className="rounded-xl bg-white p-4 border border-[#e2e8f0] shadow-sm space-y-3">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={isFriendOrder}
                onChange={(e) => setIsFriendOrder(e.target.checked)}
                className="w-4 h-4 rounded text-[#004ac6] border-[#cbd5e1] focus:ring-[#004ac6]"
              />
              <div className="flex items-center gap-1.5 text-sm font-bold text-[#64748b] group-hover:text-[#0f172a] transition-colors">
                <UserCheck className="h-4 w-4" />
                <span>Opsi &quot;Nitip Teman&quot;</span>
              </div>
            </label>

            {isFriendOrder && (
              <div className="pl-6">
                <input
                  type="text"
                  placeholder="Nama teman yang menitip..."
                  value={friendName}
                  onChange={(e) => setFriendName(e.target.value)}
                  className="w-full rounded-xl bg-[#f8fafc] border border-[#e2e8f0] px-3.5 py-2 text-sm text-[#0f172a] placeholder-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#004ac6]/20 focus:border-[#004ac6] transition-shadow"
                />
              </div>
            )}
          </div>
        </form>

        <div className="p-5 border-t border-[#f1f5f9] bg-white flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-sm font-bold text-[#64748b] hover:bg-[#f1f5f9] hover:text-[#0f172a] transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={submitting}
            className="flex items-center gap-2 rounded-xl bg-[#004ac6] hover:bg-[#2563eb] px-6 py-2.5 text-sm font-bold text-white shadow-md shadow-[#004ac6]/20 hover:shadow-lg transition-all transform hover:-translate-y-0.5 disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            <span>{submitting ? 'Menyimpan...' : 'Simpan Transaksi'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
