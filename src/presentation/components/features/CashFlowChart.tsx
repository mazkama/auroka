'use client';

import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

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

const DATA_MAP: Record<TimeRange, Array<{ name: string; income: number; expense: number }>> = {
  '1M': [
    { name: 'Mgg 1', income: 5500000, expense: 2400000 },
    { name: 'Mgg 2', income: 6000000, expense: 3100000 },
    { name: 'Mgg 3', income: 4500000, expense: 2170000 },
    { name: 'Mgg 4', income: 9000000, expense: 2900000 },
  ],
  '3M': [
    { name: 'Jun', income: 17500000, expense: 8500000 },
    { name: 'Jul', income: 21000000, expense: 14000000 },
    { name: 'Ags', income: 25000000, expense: 10570000 },
  ],
  '6M': [
    { name: 'Mar', income: 15000000, expense: 8000000 },
    { name: 'Apr', income: 16500000, expense: 9500000 },
    { name: 'Mei', income: 18000000, expense: 12000000 },
    { name: 'Jun', income: 17500000, expense: 8500000 },
    { name: 'Jul', income: 21000000, expense: 14000000 },
    { name: 'Ags', income: 25000000, expense: 10570000 },
  ],
  '1Y': [
    { name: 'Sep', income: 14000000, expense: 7500000 },
    { name: 'Okt', income: 14500000, expense: 8200000 },
    { name: 'Nov', income: 15200000, expense: 8900000 },
    { name: 'Des', income: 22000000, expense: 16500000 },
    { name: 'Jan', income: 15000000, expense: 7800000 },
    { name: 'Feb', income: 15500000, expense: 8100000 },
    { name: 'Mar', income: 15000000, expense: 8000000 },
    { name: 'Apr', income: 16500000, expense: 9500000 },
    { name: 'Mei', income: 18000000, expense: 12000000 },
    { name: 'Jun', income: 17500000, expense: 8500000 },
    { name: 'Jul', income: 21000000, expense: 14000000 },
    { name: 'Ags', income: 25000000, expense: 10570000 },
  ],
};

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

  const currentOption =
    PERIOD_OPTIONS.find((opt) => opt.key === selectedPeriod) || PERIOD_OPTIONS[2];
  const chartData = DATA_MAP[selectedPeriod];

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

        {/* Period Selector Tabs */}
        <div className="flex items-center gap-1 bg-[#f1f5f9] p-1 rounded-xl self-start sm:self-auto border border-[#e2e8f0]">
          {PERIOD_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              onClick={() => setSelectedPeriod(opt.key)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                selectedPeriod === opt.key
                  ? 'bg-[#004ac6] text-white shadow-sm'
                  : 'text-[#64748b] hover:text-[#0b1c30] hover:bg-white/70'
              }`}
            >
              <span className="sm:hidden">{opt.shortLabel}</span>
              <span className="hidden sm:inline">{opt.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -4, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#006c49" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#006c49" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ba1a1a" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#ba1a1a" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#64748b' }}
              dy={8}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#64748b' }}
              tickFormatter={formatCurrency}
              width={70}
              dx={-2}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                fontSize: '12px',
              }}
              formatter={(value: any) => [`Rp ${Number(value).toLocaleString('id-ID')}`, '']}
              labelStyle={{ fontWeight: 'bold', color: '#0f172a', marginBottom: '4px' }}
            />
            <Area
              type="monotone"
              dataKey="income"
              name="Pemasukan"
              stroke="#006c49"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorIncome)"
            />
            <Area
              type="monotone"
              dataKey="expense"
              name="Pengeluaran"
              stroke="#ba1a1a"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorExpense)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
