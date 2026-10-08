'use client';

import React, { useState, useEffect } from 'react';
import { Bill, CreateBillDTO, UpdateBillDTO, BillCycle, BillStatus } from '@/domain/entities/bill';
import { Wallet } from '@/domain/entities/wallet';
import { formatRupiah } from '@/presentation/utils/formatters';
import {
  X,
  ReceiptText,
  Check,
  AlertCircle,
  Calendar,
  Wallet as WalletIcon,
  Layers,
  Sparkles,
} from 'lucide-react';

interface BillModalProps {
  isOpen: boolean;
  onClose: () => void;
  billToEdit?: Bill | null;
  wallets: Wallet[];
  onAddBill: (dto: CreateBillDTO) => Promise<void>;
  onEditBill: (dto: UpdateBillDTO) => Promise<void>;
}

export const BILL_CATEGORIES = [
  'WiFi & Internet',
  'Listrik PLN',
  'Air PDAM',
  'Streaming & Hiburan',
  'Sewa Kos & Properti',
  'Asuransi & BPJS',
  'Software & Cloud',
  'Pendidikan / Kursus',
  'Pulsa & Paket Data',
  'Lainnya',
];

export const BillModal: React.FC<BillModalProps> = ({
  isOpen,
  onClose,
  billToEdit,
  wallets,
  onAddBill,
  onEditBill,
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('WiFi & Internet');
  const [amount, setAmount] = useState('');
  const [dueDay, setDueDay] = useState('1');
  const [cycle, setCycle] = useState<BillCycle>('MONTHLY');
  const [walletId, setWalletId] = useState('');
  const [status, setStatus] = useState<BillStatus>('PENDING');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (billToEdit) {
      setName(billToEdit.name);
      setCategory(billToEdit.category || 'WiFi & Internet');
      setAmount(billToEdit.amount.toString());
      setDueDay(billToEdit.dueDay.toString());
      setCycle(billToEdit.cycle || 'MONTHLY');
      setWalletId(billToEdit.walletId || (wallets[0]?.id ?? ''));
      setStatus(billToEdit.status || 'PENDING');
    } else {
      setName('');
      setCategory('WiFi & Internet');
      setAmount('');
      setDueDay('1');
      setCycle('MONTHLY');
      setWalletId(wallets[0]?.id ?? '');
      setStatus('PENDING');
    }
    setErrorMsg(null);
  }, [billToEdit, isOpen, wallets]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setErrorMsg('Nominal tagihan harus lebih besar dari Rp 0');
      return;
    }

    const numDueDay = parseInt(dueDay, 10);
    if (isNaN(numDueDay) || numDueDay < 1 || numDueDay > 31) {
      setErrorMsg('Tanggal jatuh tempo harus antara 1 sampai 31');
      return;
    }

    if (!name.trim()) {
      setErrorMsg('Nama tagihan / langganan wajib diisi');
      return;
    }

    try {
      setIsSubmitting(true);
      if (billToEdit) {
        await onEditBill({
          id: billToEdit.id,
          name: name.trim(),
          category,
          amount: numAmount,
          dueDay: numDueDay,
          cycle,
          walletId: walletId || undefined,
          status,
        });
      } else {
        await onAddBill({
          name: name.trim(),
          category,
          amount: numAmount,
          dueDay: numDueDay,
          cycle,
          walletId: walletId || undefined,
          status,
        });
      }
      onClose();
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Gagal menyimpan tagihan'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const setQuickAmount = (val: number) => {
    setAmount(val.toString());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0b1c30]/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-lg rounded-3xl bg-white border border-[#e2e8f0] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#f1f5f9] bg-gradient-to-r from-[#f8f9ff] to-[#eff4ff]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#004ac6]/10 text-[#004ac6]">
              <ReceiptText className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-[#0f172a]">
                {billToEdit ? 'Ubah Tagihan / Langganan' : 'Tambah Tagihan Baru'}
              </h3>
              <p className="text-xs text-[#64748b]">
                Otomatiskan pengingat jatuh tempo & potong saldo dompet
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

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {errorMsg && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Nama Tagihan */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#0f172a]">
              Nama Tagihan / Layanan
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="misal: IndiHome Fiber 100Mbps / Netflix 4K"
              className="w-full rounded-xl bg-[#f8fafc] border border-[#e2e8f0] px-3.5 py-2.5 text-xs font-semibold text-[#0f172a] placeholder-[#94a3b8] focus:outline-none focus:border-[#004ac6] focus:bg-white transition-all"
              required
            />
          </div>

          {/* Kategori & Siklus Pembayaran Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#0f172a]">
                Kategori Tagihan
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl bg-[#f8fafc] border border-[#e2e8f0] px-3.5 py-2.5 text-xs font-semibold text-[#0f172a] focus:outline-none focus:border-[#004ac6] focus:bg-white transition-all"
              >
                {BILL_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#0f172a]">
                Siklus Pembayaran
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setCycle('MONTHLY')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                    cycle === 'MONTHLY'
                      ? 'bg-[#004ac6] text-white border-[#004ac6] shadow-sm'
                      : 'bg-[#f8fafc] text-[#64748b] border-[#e2e8f0] hover:bg-[#eff4ff]'
                  }`}
                >
                  Bulanan
                </button>
                <button
                  type="button"
                  onClick={() => setCycle('YEARLY')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                    cycle === 'YEARLY'
                      ? 'bg-[#004ac6] text-white border-[#004ac6] shadow-sm'
                      : 'bg-[#f8fafc] text-[#64748b] border-[#e2e8f0] hover:bg-[#eff4ff]'
                  }`}
                >
                  Tahunan
                </button>
              </div>
            </div>
          </div>

          {/* Nominal Biaya Tagihan */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#0f172a]">
              Nominal Tagihan (Rp)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#64748b]">
                Rp
              </span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="misal: 350000"
                className="w-full rounded-xl bg-[#f8fafc] border border-[#e2e8f0] pl-10 pr-3.5 py-2.5 text-sm font-mono font-bold text-[#0f172a] placeholder-[#94a3b8] focus:outline-none focus:border-[#004ac6] focus:bg-white transition-all"
                required
              />
            </div>

            {/* Live Formatted IDR */}
            {amount && !isNaN(parseFloat(amount)) && (
              <p className="text-[11px] font-semibold text-[#004ac6] text-right">
                {formatRupiah(parseFloat(amount))}
              </p>
            )}

            {/* Quick Amount Buttons */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {[50000, 150000, 350000, 500000, 1000000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setQuickAmount(amt)}
                  className="px-2 py-0.5 rounded-lg bg-[#f1f5f9] hover:bg-[#e2e8f0] text-[10px] font-bold text-[#475569] transition-colors"
                >
                  +{formatRupiah(amt)}
                </button>
              ))}
            </div>
          </div>

          {/* Tanggal Jatuh Tempo (1 - 31) & Dompet Sumber */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#0f172a] flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-[#004ac6]" />
                <span>Tanggal Jatuh Tempo</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={dueDay}
                  onChange={(e) => setDueDay(e.target.value)}
                  placeholder="1 - 31"
                  className="w-full rounded-xl bg-[#f8fafc] border border-[#e2e8f0] px-3.5 py-2.5 text-xs font-bold text-[#0f172a] focus:outline-none focus:border-[#004ac6] focus:bg-white transition-all"
                  required
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] text-[#64748b]">
                  Tiap tgl {dueDay || '-'}
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#0f172a] flex items-center gap-1.5">
                <WalletIcon className="h-3.5 w-3.5 text-[#006c49]" />
                <span>Sumber Rekening / Dompet</span>
              </label>
              <select
                value={walletId}
                onChange={(e) => setWalletId(e.target.value)}
                className="w-full rounded-xl bg-[#f8fafc] border border-[#e2e8f0] px-3.5 py-2.5 text-xs font-semibold text-[#0f172a] focus:outline-none focus:border-[#004ac6] focus:bg-white transition-all"
              >
                <option value="">-- Pilih Dompet Auto-Debet --</option>
                {wallets.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} ({formatRupiah(w.balance)})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Status Switch if Editing */}
          {billToEdit && (
            <div className="space-y-1.5 pt-1">
              <label className="block text-xs font-bold text-[#0f172a]">
                Status Pembayaran Periode Ini
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setStatus('PENDING')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                    status === 'PENDING'
                      ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                      : 'bg-[#f8fafc] text-[#64748b] border-[#e2e8f0] hover:bg-[#eff4ff]'
                  }`}
                >
                  Belum Lunas (Pending)
                </button>
                <button
                  type="button"
                  onClick={() => setStatus('PAID')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                    status === 'PAID'
                      ? 'bg-[#006c49] text-white border-[#006c49] shadow-sm'
                      : 'bg-[#f8fafc] text-[#64748b] border-[#e2e8f0] hover:bg-[#eff4ff]'
                  }`}
                >
                  Sudah Lunas (Paid)
                </button>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-[#f1f5f9]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#64748b] hover:bg-[#f1f5f9] transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 bg-[#004ac6] hover:bg-[#2563eb] text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md shadow-[#004ac6]/20 disabled:opacity-50"
            >
              <Check className="h-4 w-4" />
              <span>{billToEdit ? 'Simpan Perubahan' : 'Tambah Tagihan'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
