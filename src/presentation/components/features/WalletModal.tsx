'use client';

import React, { useState, useEffect } from 'react';
import { Wallet, AccountType } from '@/domain/entities/wallet';
import { X, Plus, Save, Palette, Sliders } from 'lucide-react';

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

const PRESET_COLORS = [
  '#004ac6',
  '#006c49',
  '#ba1a1a',
  '#784b00',
  '#2563eb',
  '#7c3aed',
  '#0284c7',
  '#0f172a',
  '#16a34a',
  '#d97706',
];

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  let cleanHex = hex.replace('#', '');
  if (cleanHex.length === 3) {
    cleanHex = cleanHex
      .split('')
      .map((c) => c + c)
      .join('');
  }
  const num = parseInt(cleanHex, 16);
  if (isNaN(num)) {
    return { r: 0, g: 74, b: 198 };
  }
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (n: number) => Math.max(0, Math.min(255, Math.round(n)));
  const toHex = (n: number) => clamp(n).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

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
  const [rgb, setRgb] = useState({ r: 0, g: 74, b: 198 });
  const [showRgbSliders, setShowRgbSliders] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (walletToEdit) {
      setName(walletToEdit.name);
      setType(walletToEdit.type);
      setBalance(walletToEdit.balance.toString());
      setAccountNumber(walletToEdit.accountNumber || '');
      setColor(walletToEdit.color);
      setRgb(hexToRgb(walletToEdit.color));
    } else {
      setName('');
      setType('BANK');
      setBalance('');
      setAccountNumber('');
      setColor('#004ac6');
      setRgb({ r: 0, g: 74, b: 198 });
    }
  }, [walletToEdit, isOpen]);

  const handleColorPresetChange = (newHex: string) => {
    setColor(newHex);
    setRgb(hexToRgb(newHex));
  };

  const handleRgbChange = (channel: 'r' | 'g' | 'b', value: number) => {
    const clamped = Math.max(0, Math.min(255, isNaN(value) ? 0 : value));
    const nextRgb = { ...rgb, [channel]: clamped };
    setRgb(nextRgb);
    setColor(rgbToHex(nextRgb.r, nextRgb.g, nextRgb.b));
  };

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

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-[#64748b] uppercase tracking-wider">
                Warna Kartu
              </label>
              <button
                type="button"
                onClick={() => setShowRgbSliders(!showRgbSliders)}
                className="flex items-center gap-1 text-[11px] font-bold text-[#004ac6] hover:underline"
              >
                <Sliders className="h-3 w-3" />
                <span>{showRgbSliders ? 'Tampilkan Palet Preset' : 'Pilih Warna Kustom (RGB)'}</span>
              </button>
            </div>

            {/* Live Color Preview Bar */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-[#e2e8f0] shadow-2xs">
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-xl shadow-inner border border-black/10 transition-colors"
                  style={{ backgroundColor: color }}
                />
                <div>
                  <span className="text-xs font-bold text-[#0f172a] block font-mono">
                    rgb({rgb.r}, {rgb.g}, {rgb.b})
                  </span>
                  <span className="text-[10px] font-mono text-[#64748b] uppercase">
                    {color}
                  </span>
                </div>
              </div>

              {/* Native Color Pipette Trigger */}
              <div className="relative">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => handleColorPresetChange(e.target.value)}
                  className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                  title="Pilih warna kustom dengan Color Picker"
                />
                <button
                  type="button"
                  className="p-2 rounded-xl bg-[#eff4ff] text-[#004ac6] hover:bg-[#dce9ff] transition-colors"
                  title="Buka Color Wheel / Eyedropper"
                >
                  <Palette className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* RGB Sliders & Number Controls */}
            {showRgbSliders ? (
              <div className="p-4 rounded-xl bg-white border border-[#e2e8f0] space-y-3 animate-in fade-in duration-200">
                {/* Red Channel */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-rose-600">Red (R): {rgb.r}</span>
                    <input
                      type="number"
                      min="0"
                      max="255"
                      value={rgb.r}
                      onChange={(e) => handleRgbChange('r', parseInt(e.target.value))}
                      className="w-14 text-right px-1.5 py-0.5 rounded border border-[#cbd5e1] text-xs font-mono font-bold text-rose-600 focus:outline-none focus:border-rose-500"
                    />
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="255"
                    value={rgb.r}
                    onChange={(e) => handleRgbChange('r', parseInt(e.target.value))}
                    className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-rose-600 bg-rose-100"
                  />
                </div>

                {/* Green Channel */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-emerald-600">Green (G): {rgb.g}</span>
                    <input
                      type="number"
                      min="0"
                      max="255"
                      value={rgb.g}
                      onChange={(e) => handleRgbChange('g', parseInt(e.target.value))}
                      className="w-14 text-right px-1.5 py-0.5 rounded border border-[#cbd5e1] text-xs font-mono font-bold text-emerald-600 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="255"
                    value={rgb.g}
                    onChange={(e) => handleRgbChange('g', parseInt(e.target.value))}
                    className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-emerald-600 bg-emerald-100"
                  />
                </div>

                {/* Blue Channel */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-blue-600">Blue (B): {rgb.b}</span>
                    <input
                      type="number"
                      min="0"
                      max="255"
                      value={rgb.b}
                      onChange={(e) => handleRgbChange('b', parseInt(e.target.value))}
                      className="w-14 text-right px-1.5 py-0.5 rounded border border-[#cbd5e1] text-xs font-mono font-bold text-blue-600 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="255"
                    value={rgb.b}
                    onChange={(e) => handleRgbChange('b', parseInt(e.target.value))}
                    className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-blue-600 bg-blue-100"
                  />
                </div>
              </div>
            ) : (
              /* Preset Swatches */
              <div className="flex gap-2 flex-wrap pt-1">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => handleColorPresetChange(c)}
                    className={`w-7 h-7 rounded-full border-2 transition-all ${
                      color.toLowerCase() === c.toLowerCase()
                        ? 'border-[#0f172a] scale-110 shadow-md ring-2 ring-[#004ac6]/30'
                        : 'border-transparent hover:scale-110'
                    }`}
                    style={{ backgroundColor: c }}
                    aria-label={`Pilih warna ${c}`}
                  />
                ))}
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
            {walletToEdit ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            <span>{submitting ? 'Menyimpan...' : 'Simpan Dompet'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
