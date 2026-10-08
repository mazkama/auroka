'use client';

import React, { useState, useEffect } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { apiFetch } from '@/infrastructure/api/apiClient';

type TimeRange = '1M' | '3M' | '6M' | '1Y';

interface PeriodOption {
  key: TimeRange;
  label: string;
  shortLabel: string;
  title: string;
}

const PERIOD_OPTIONS: PeriodOption[] = [
  { key: '1M', label: '1 Bulan', shortLabel: '1B', title: 'Arus Kas 1 Bulan Terakhir' },
  { key: '3M', label: '3 Bulan', shortLabel: '3B', title: 'Arus Kas 3 Bulan Terakhir' },
  { key: '6M', label: '6 Bulan', shortLabel: '6B', title: 'Arus Kas 6 Bulan Terakhir' },
  { key: '1Y', label: 'Setahun', shortLabel: '1T', title: 'Arus Kas 1 Tahun Terakhir' },
];

interface TrendItem {
  month: string;
  income: number;
  expense: number;
  net?: number;
}

const formatCurrency = (value: number) => {
  if (value === 0) return 'Rp 0';
  if (value >= 1000000) {
    const inMillions = value / 1000000;
    return `Rp ${inMillions % 1 === 0 ? inMillions : inMillions.toFixed(1)} jt`;
  }
  return `Rp ${value.toLocaleString('id-ID')}`;
};

export const CashFlowChart: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<TimeRange>('6M');
  const [trendData, setTrendData] = useState<TrendItem[]>([]);
  const [loading, setLoading] = useState(true);

  const currentOption =
    PERIOD_OPTIONS.find((opt) => opt.key === selectedPeriod) || PERIOD_OPTIONS[2];

  useEffect(() => {
    let isMounted = true;
    const fetchTrends = async () => {
      try {
        setLoading(true);
        const res = await apiFetch<TrendItem[]>('/analytics/trend');
        if (isMounted && Array.isArray(res)) {
          setTrendData(res);
        }
      } catch {
        if (isMounted) {
          setTrendData([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchTrends();

    const handleAuthChange = () => {
      fetchTrends();
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('auroka:auth-changed', handleAuthChange);
      window.addEventListener('storage', handleAuthChange);
    }

    return () => {
      isMounted = false;
      if (typeof window !== 'undefined') {
        window.removeEventListener('auroka:auth-changed', handleAuthChange);
        window.removeEventListener('storage', handleAuthChange);
      }
    };
  }, []);

  // Filter trend data according to selected period
  const displayData = React.useMemo(() => {
    if (!trendData || trendData.length === 0) {
      return [];
    }

    if (selectedPeriod === '1M') {
      return trendData.slice(-1);
    } else if (selectedPeriod === '3M') {
      return trendData.slice(-3);
    } else if (selectedPeriod === '6M') {
      return trendData.slice(-6);
    }
    return trendData;
  }, [trendData, selectedPeriod]);

  return (
    <div className="bg-white border border-[#e2e8f0] rounded-2xl p-3.5 sm:p-5 shadow-sm">
      {/* Header with Dynamic Title & Time Range Filter Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-[#0f172a]">
            {currentOption.title}
          </h3>
          <div className="flex items-center gap-3 text-xs text-[#64748b] mt-0.5">
            <p>Perbandingan total pemasukan dan pengeluaran</p>
            <div className="hidden md:flex items-center gap-3 pl-3 border-l border-[#e2e8f0]">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#006c49]" />
                <span className="text-[#475569] font-medium text-[11px]">Pemasukan</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#ba1a1a]" />
                <span className="text-[#475569] font-medium text-[11px]">Pengeluaran</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Period Filter Buttons */}
        <div className="flex items-center gap-1 bg-[#f8fafc] p-1 rounded-xl border border-[#f1f5f9] self-start sm:self-auto">
          {PERIOD_OPTIONS.map((period) => (
            <button
              key={period.key}
              onClick={() => setSelectedPeriod(period.key)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all duration-200 ${
                selectedPeriod === period.key
                  ? 'bg-white text-[#004ac6] shadow-xs ring-1 ring-black/5 font-extrabold'
                  : 'text-[#64748b] hover:text-[#0b1c30] hover:bg-white/50'
              }`}
            >
              <span className="hidden sm:inline">{period.label}</span>
              <span className="sm:hidden">{period.shortLabel}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Chart Canvas Area */}
      <div className="h-[240px] sm:h-[280px] w-full pt-2 select-none outline-none">
        {loading ? (
          <div className="h-full w-full flex items-center justify-center">
            <div className="flex items-center gap-2 text-xs font-bold text-[#64748b]">
              <div className="w-4 h-4 border-2 border-[#004ac6] border-t-transparent rounded-full animate-spin" />
              <span>Memuat data tren keuangan...</span>
            </div>
          </div>
        ) : displayData.length === 0 ? (
          <div className="h-full w-full flex flex-col items-center justify-center text-center p-4 bg-[#f8fafc] rounded-xl border border-dashed border-[#e2e8f0]">
            <p className="text-xs font-bold text-[#0b1c30]">Belum ada riwayat transaksi</p>
            <p className="text-[11px] text-[#64748b] mt-0.5">
              Catat transaksi pemasukan atau pengeluaran untuk melihat grafik tren arus kas.
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%" className="outline-none focus:outline-none">
            <AreaChart
              data={displayData}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              className="outline-none focus:outline-none"
            >
              <defs>
                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#006c49" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#006c49" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ba1a1a" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#ba1a1a" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748b', fontSize: 11, fontWeight: 500 }}
                dy={8}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748b', fontSize: 10 }}
                tickFormatter={formatCurrency}
                width={65}
              />
              <Tooltip
                cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }}
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
                  fontSize: '12px',
                  outline: 'none',
                }}
                formatter={(value: any, name: any) => [
                  `Rp ${Number(value || 0).toLocaleString('id-ID')}`,
                  name === 'income' ? 'Pemasukan' : 'Pengeluaran',
                ]}
              />
              <Area
                type="monotone"
                dataKey="income"
                name="income"
                stroke="#006c49"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorIncome)"
              />
              <Area
                type="monotone"
                dataKey="expense"
                name="expense"
                stroke="#ba1a1a"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorExpense)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
