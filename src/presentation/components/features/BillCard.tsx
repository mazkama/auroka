'use client';

import React from 'react';
import { Bill } from '@/domain/entities/bill';
import { formatRupiah } from '@/presentation/utils/formatters';
import {
  Wifi,
  Zap,
  Droplets,
  Tv,
  Home,
  ShieldCheck,
  Code2,
  GraduationCap,
  Smartphone,
  Receipt,
  CheckCircle2,
  Clock,
  AlertTriangle,
  CreditCard,
  Edit2,
  Trash2,
  Check,
  Layers,
} from 'lucide-react';

interface BillCardProps {
  bill: Bill;
  onPay: (bill: Bill) => void;
  onEdit: (bill: Bill) => void;
  onDelete: (bill: Bill) => void;
  isPaying?: boolean;
}

export function getCategoryIcon(category: string) {
  const cat = (category || '').toLowerCase();
  if (cat.includes('wifi') || cat.includes('internet')) return Wifi;
  if (cat.includes('listrik') || cat.includes('pln')) return Zap;
  if (cat.includes('air') || cat.includes('pdam')) return Droplets;
  if (cat.includes('streaming') || cat.includes('hiburan') || cat.includes('netflix') || cat.includes('spotify'))
    return Tv;
  if (cat.includes('sewa') || cat.includes('kos') || cat.includes('rumah') || cat.includes('properti'))
    return Home;
  if (cat.includes('asuransi') || cat.includes('bpjs') || cat.includes('kesehatan'))
    return ShieldCheck;
  if (cat.includes('software') || cat.includes('cloud') || cat.includes('saas') || cat.includes('ai'))
    return Code2;
  if (cat.includes('pendidikan') || cat.includes('kursus') || cat.includes('kuliah') || cat.includes('buku'))
    return GraduationCap;
  if (cat.includes('pulsa') || cat.includes('data') || cat.includes('telko'))
    return Smartphone;
  return Receipt;
}

export function getCategoryTheme(category: string) {
  const cat = (category || '').toLowerCase();
  if (cat.includes('wifi') || cat.includes('internet')) {
    return {
      bg: 'bg-sky-50',
      text: 'text-sky-600',
      border: 'border-sky-100',
    };
  }
  if (cat.includes('listrik') || cat.includes('pln')) {
    return {
      bg: 'bg-amber-50',
      text: 'text-amber-600',
      border: 'border-amber-100',
    };
  }
  if (cat.includes('air') || cat.includes('pdam')) {
    return {
      bg: 'bg-cyan-50',
      text: 'text-cyan-600',
      border: 'border-cyan-100',
    };
  }
  if (cat.includes('streaming') || cat.includes('hiburan')) {
    return {
      bg: 'bg-purple-50',
      text: 'text-purple-600',
      border: 'border-purple-100',
    };
  }
  if (cat.includes('sewa') || cat.includes('kos')) {
    return {
      bg: 'bg-indigo-50',
      text: 'text-indigo-600',
      border: 'border-indigo-100',
    };
  }
  if (cat.includes('asuransi') || cat.includes('bpjs')) {
    return {
      bg: 'bg-emerald-50',
      text: 'text-emerald-600',
      border: 'border-emerald-100',
    };
  }
  return {
    bg: 'bg-[#eff4ff]',
    text: 'text-[#004ac6]',
    border: 'border-[#dce9ff]',
  };
}

export function getDueStatus(dueDay: number, status: 'PENDING' | 'PAID') {
  if (status === 'PAID') {
    return {
      label: 'Sudah Lunas',
      isUrgent: false,
      isPassed: false,
      daysLeft: 0,
    };
  }

  const today = new Date();
  const currentDay = today.getDate();
  const diffDays = dueDay - currentDay;

  if (diffDays < 0) {
    return {
      label: `Lewat ${Math.abs(diffDays)} hari`,
      isUrgent: true,
      isPassed: true,
      daysLeft: diffDays,
    };
  } else if (diffDays === 0) {
    return {
      label: 'Jatuh tempo Hari Ini!',
      isUrgent: true,
      isPassed: false,
      daysLeft: 0,
    };
  } else if (diffDays <= 3) {
    return {
      label: `Segera Bayar (${diffDays} hari lagi)`,
      isUrgent: true,
      isPassed: false,
      daysLeft: diffDays,
    };
  } else {
    return {
      label: `${diffDays} hari lagi`,
      isUrgent: false,
      isPassed: false,
      daysLeft: diffDays,
    };
  }
}

export const BillCard: React.FC<BillCardProps> = ({
  bill,
  onPay,
  onEdit,
  onDelete,
  isPaying = false,
}) => {
  const Icon = getCategoryIcon(bill.category);
  const theme = getCategoryTheme(bill.category);
  const dueInfo = getDueStatus(bill.dueDay, bill.status);
  const isPaid = bill.status === 'PAID';

  return (
    <div
      className={`group relative rounded-2xl bg-white border p-5 transition-all duration-200 hover:shadow-lg ${
        isPaid
          ? 'border-[#e2e8f0]/80 bg-white/70'
          : dueInfo.isUrgent
          ? 'border-amber-300 shadow-md shadow-amber-500/5 ring-1 ring-amber-300/60'
          : 'border-[#e2e8f0] shadow-sm hover:border-[#004ac6]/30'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        {/* Left Side: Icon, Name, Category & Due */}
        <div className="flex items-start gap-3.5">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border transition-transform group-hover:scale-105 ${theme.bg} ${theme.text} ${theme.border}`}
          >
            <Icon className="h-6 w-6" />
          </div>

          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-extrabold text-sm sm:text-base text-[#0b1c30]">
                {bill.name}
              </h3>

              {/* Status Badge */}
              {isPaid ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-[#006c49]">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>LUNAS</span>
                </span>
              ) : dueInfo.isUrgent ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500 text-white px-2 py-0.5 text-[10px] font-bold shadow-xs animate-pulse">
                  <AlertTriangle className="h-3 w-3" />
                  <span>{dueInfo.label}</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 border border-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                  <Clock className="h-3 w-3" />
                  <span>{dueInfo.label}</span>
                </span>
              )}

              {/* Cycle Badge */}
              <span className="rounded-md bg-[#f1f5f9] px-2 py-0.5 text-[10px] font-bold text-[#475569] uppercase tracking-wide">
                {bill.cycle === 'YEARLY' ? 'Tahunan' : 'Bulanan'}
              </span>
            </div>

            {/* Sub-info: Category & Source Wallet */}
            <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-[#64748b]">
              <span className="font-medium">{bill.category}</span>
              <span className="h-1 w-1 rounded-full bg-slate-300" />
              <span className="flex items-center gap-1 font-semibold text-[#004ac6]">
                <Clock className="h-3 w-3" />
                <span>Jatuh tempo tgl {bill.dueDay}</span>
              </span>
              {bill.walletName && (
                <>
                  <span className="h-1 w-1 rounded-full bg-slate-300" />
                  <span className="flex items-center gap-1 text-[#475569]">
                    <CreditCard className="h-3 w-3 text-slate-400" />
                    <span>{bill.walletName}</span>
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Amount & Controls */}
        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#f1f5f9]">
          <div className="text-left sm:text-right">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#64748b] block">
              Nominal Tagihan
            </span>
            <span className="font-mono text-base sm:text-lg font-extrabold text-[#0b1c30]">
              {formatRupiah(bill.amount)}
            </span>
          </div>

          {/* Action Row */}
          <div className="flex items-center gap-1.5">
            {/* Pay Button */}
            {!isPaid ? (
              <button
                type="button"
                onClick={() => onPay(bill)}
                disabled={isPaying}
                className="flex items-center gap-1.5 bg-[#004ac6] hover:bg-[#2563eb] text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm hover:shadow-md shadow-[#004ac6]/20 disabled:opacity-50"
              >
                <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                <span>{isPaying ? 'Memproses...' : 'Bayar Sekarang'}</span>
              </button>
            ) : (
              <div className="flex items-center gap-1 text-[11px] font-semibold text-[#006c49] bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Terbayar</span>
              </div>
            )}

            {/* Edit Button */}
            <button
              type="button"
              onClick={() => onEdit(bill)}
              className="p-1.5 rounded-xl text-slate-400 hover:text-[#004ac6] hover:bg-[#eff4ff] transition-colors"
              title="Ubah Tagihan"
            >
              <Edit2 className="h-4 w-4" />
            </button>

            {/* Delete Button */}
            <button
              type="button"
              onClick={() => onDelete(bill)}
              className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              title="Hapus Tagihan"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
