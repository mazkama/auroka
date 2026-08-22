'use client';

import React, { useState } from 'react';
import { AppLayout } from '@/presentation/components/layout/AppLayout';
import { useFinance } from '@/presentation/hooks/useFinance';
import { formatRupiah } from '@/presentation/utils/formatters';
import { AddTransactionModal } from '@/presentation/components/features/AddTransactionModal';
import {
  TrendingUp,
  TrendingDown,
  Star,
  Award,
} from 'lucide-react';

export default function AnalyticsPage() {
  const { summary, wallets, addTransaction } = useFinance();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <AppLayout onOpenAddModal={() => setIsModalOpen(true)}>
      <div className="space-y-6">
        {/* Financial KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-[#c3c6d7]/50 rounded-2xl p-5 shadow-sm space-y-2">
            <span className="text-xs font-semibold text-[#434655] uppercase tracking-wider">
              Savings Rate (Rasio Tabungan)
            </span>
            <div className="flex items-baseline justify-between">
              <h3 className="text-2xl font-extrabold font-mono text-[#006c49]">
                {summary?.savingsRate || 0}%
              </h3>
              <span className="text-[10px] font-bold text-[#006c49] bg-[#006c49]/10 px-2 py-0.5 rounded-full">
                Sangat Sehat
              </span>
            </div>
            <p className="text-[11px] text-[#434655]">
              Persentase pemasukan bersih yang berhasil disisihkan.
            </p>
          </div>

          <div className="bg-white border border-[#c3c6d7]/50 rounded-2xl p-5 shadow-sm space-y-2">
            <span className="text-xs font-semibold text-[#434655] uppercase tracking-wider">
              Pemasukan Bulanan
            </span>
            <div className="flex items-baseline justify-between">
              <h3 className="text-2xl font-extrabold font-mono text-[#006c49]">
                {formatRupiah(summary?.monthlyIncome || 0)}
              </h3>
              <TrendingUp className="h-5 w-5 text-[#006c49]" />
            </div>
            <p className="text-[11px] text-[#434655]">Arus kas masuk bulan ini.</p>
          </div>

          <div className="bg-white border border-[#c3c6d7]/50 rounded-2xl p-5 shadow-sm space-y-2">
            <span className="text-xs font-semibold text-[#434655] uppercase tracking-wider">
              Pengeluaran Bulanan
            </span>
            <div className="flex items-baseline justify-between">
              <h3 className="text-2xl font-extrabold font-mono text-[#ba1a1a]">
                {formatRupiah(summary?.monthlyExpense || 0)}
              </h3>
              <TrendingDown className="h-5 w-5 text-[#ba1a1a]" />
            </div>
            <p className="text-[11px] text-[#434655]">Arus kas keluar bulan ini.</p>
          </div>

          <div className="bg-white border border-[#c3c6d7]/50 rounded-2xl p-5 shadow-sm space-y-2">
            <span className="text-xs font-semibold text-[#434655] uppercase tracking-wider">
              Net Cash Flow
            </span>
            <div className="flex items-baseline justify-between">
              <h3 className="text-2xl font-extrabold font-mono text-[#784b00]">
                {formatRupiah(summary?.netCashFlow || 0)}
              </h3>
              <Award className="h-5 w-5 text-[#784b00]" />
            </div>
            <p className="text-[11px] text-[#434655]">Selisih positif pemasukan & pengeluaran.</p>
          </div>
        </div>

        {/* Charts & Breakdown Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white border border-[#c3c6d7]/50 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#0b1c30]">
                Perbandingan Pemasukan vs Pengeluaran
              </h3>
              <span className="text-xs text-[#434655]">Agustus 2026</span>
            </div>

            <div className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold text-[#434655]">
                  <span>Pemasukan Total</span>
                  <span className="text-[#006c49] font-mono">
                    {formatRupiah(summary?.monthlyIncome || 0)}
                  </span>
                </div>
                <div className="h-4 w-full rounded-full bg-[#eff4ff] overflow-hidden">
                  <div className="h-full rounded-full bg-[#006c49] w-[85%] transition-all duration-500" />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold text-[#434655]">
                  <span>Pengeluaran Total</span>
                  <span className="text-[#ba1a1a] font-mono">
                    {formatRupiah(summary?.monthlyExpense || 0)}
                  </span>
                </div>
                <div className="h-4 w-full rounded-full bg-[#eff4ff] overflow-hidden">
                  <div className="h-full rounded-full bg-[#ba1a1a] w-[45%] transition-all duration-500" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#c3c6d7]/50 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
              <h3 className="text-base font-bold text-[#0b1c30]">
                Analisis Worthiness Rating Pengeluaran
              </h3>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#f8f9ff] border border-[#c3c6d7]/40 text-xs">
                <div className="flex items-center gap-2 font-medium">
                  <span className="flex text-amber-400">★★★★★</span>
                  <span>Worthiness Sangat Tinggi (5/5)</span>
                </div>
                <span className="font-bold font-mono text-[#006c49]">82% Alokasi</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AddTransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        wallets={wallets}
        onAddTransaction={addTransaction}
      />
    </AppLayout>
  );
}
