'use client';

import React, { useState, useEffect } from 'react';
import { Wallet, AccountType } from '@/domain/entities/wallet';
import { X, Plus, Save } from 'lucide-react';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (wallet: Partial<Wallet>) => Promise<void>;
  walletToEdit?: Wallet | null;
}

const ACCOUNT_TYPES: { value: AccountType; label: string }[] = [
  { value: 'BANK', label: 'Bank (Rekening)' },
  { value: 'E_WALLET', label: 'E-Wallet (GoPay, OVO, dll)' },
  { value: 'CRYPTO', label: 'Kripto / Investasi' },
  { value: 'CASH', label: 'Uang Tunai (Cash)' },
];

const COLORS = ['#004ac6', '#006c49', '#ba1a1a', '#784b00', '#2563eb', '#0f172a', '#16a34a', '#d97706'];

export const WalletModal: React.FC<WalletModalProps> = ({
  isOpen,
  onClose,
  onSave,
  walletToEdit,
}) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<AccountType>('BANK');
  const [balance, setBalance] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [color, setColor] = useState('#004ac6');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (walletToEdit) {
      setName(walletToEdit.name);
      setType(walletToEdit.type);
      setBalance(walletToEdit.balance.toString());
      setAccountNumber(walletToEdit.accountNumber || '');
      setColor(walletToEdit.color);
    } else {
      // Reset form on open for new wallet
      setName('');
      setType('BANK');
      setBalance('');
      setAccountNumber('');
      setColor('#004ac6');
    }
  }, [walletToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      setError('Nama dompet wajib diisi');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      await onSave({
        name,
        type,
        balance: balance ? parseFloat(balance) : 0,
        accountNumber,
        color,
      });
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan dompet');
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
      <div className="relative bg-white rounded-2xl w-full max-w-md flex flex-col shadow-2xl overflow-hidden border border-[#e2e8f0]">
        <div className="flex items-center justify-between p-5 border-b border-[#f1f5f9] bg-white">
          <div>
            <h3 className="text-lg font-bold text-[#0f172a]">
              {walletToEdit ? 'Ubah Dompet' : 'Tambah Dompet Baru'}
            </h3>
            <p className="text-[11px] text-[#64748b]">
              Pilih kategori seperti Bank atau E-Wallet
            </p>
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

        <form onSubmit={handleSubmit} className="p-5 space-y-5 bg-[#f8fafc]">
          <div>
            <label className="block text-xs font-semibold text-[#64748b] uppercase tracking-wider mb-2">
              Kategori Dompet
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as AccountType)}
              className="w-full rounded-xl bg-white border border-[#e2e8f0] px-3.5 py-2.5 text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-[#004ac6]/20 focus:border-[#004ac6] transition-shadow text-sm"
            >
              {ACCOUNT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#64748b] uppercase tracking-wider mb-2">
              Nama Dompet
            </label>
            <input
              type="text"
              placeholder="Contoh: BCA Pribadi / GoPay"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full rounded-xl bg-white border border-[#e2e8f0] px-3.5 py-2.5 text-[#0f172a] placeholder-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#004ac6]/20 focus:border-[#004ac6] transition-shadow text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#64748b] uppercase tracking-wider mb-2">
              Nomor Rekening (Opsional)
            </label>
            <input
              type="text"
              placeholder="Contoh: 1234567890"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              className="w-full rounded-xl bg-white border border-[#e2e8f0] px-3.5 py-2.5 text-[#0f172a] placeholder-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#004ac6]/20 focus:border-[#004ac6] transition-shadow text-sm"
            />
          </div>

          {!walletToEdit && (
            <div>
              <label className="block text-xs font-semibold text-[#64748b] uppercase tracking-wider mb-2">
                Saldo Awal (Opsional)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-[#64748b] font-mono text-sm">Rp</span>
                <input
                  type="number"
                  placeholder="0"
                  value={balance}
                  onChange={(e) => setBalance(e.target.value)}
                  className="w-full rounded-xl bg-white border border-[#e2e8f0] pl-10 pr-3.5 py-2.5 text-[#0f172a] font-mono placeholder-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#004ac6]/20 focus:border-[#004ac6] transition-shadow text-sm"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#64748b] uppercase tracking-wider mb-2">
              Warna Kartu
            </label>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full border-2 transition-transform ${
                    color === c ? 'border-[#0f172a] scale-110' : 'border-transparent hover:scale-110'
                  }`}
                  style={{ backgroundColor: c }}
                  aria-label={`Pilih warna ${c}`}
                />
              ))}
            </div>
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
            {walletToEdit ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            <span>{submitting ? 'Menyimpan...' : 'Simpan Dompet'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
