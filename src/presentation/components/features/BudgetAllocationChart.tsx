'use client';

import React from 'react';
import { Budget } from '@/domain/entities/budget';
import { formatRupiah } from '@/presentation/utils/formatters';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { PieChart as PieIcon, Wallet, ShieldCheck } from 'lucide-react';

interface BudgetAllocationChartProps {
  budgets: Budget[];
  monthlyIncome: number;
}

const CATEGORY_COLORS: Record<string, string> = {
  'Makan & Minum': '#004ac6',
  'Belanja': '#2563eb',
  'Listrik & Air': '#0284c7',
  'Transportasi': '#0d9488',
  'Hiburan': '#7c3aed',
  'Investasi': '#d97706',
  'Kesehatan': '#e11d48',
  'Lainnya': '#64748b',
};

const DEFAULT_UNALLOCATED_COLOR = '#006c49'; // Auroka Emerald Green for Savings / Unallocated

export const BudgetAllocationChart: React.FC<BudgetAllocationChartProps> = ({
  budgets,
  monthlyIncome,
}) => {
  // If monthly income is 0 or less, fallback to total budgeted limit
  const totalBudgeted = budgets.reduce((acc, b) => acc + b.limitAmount, 0);
  const baseIncome = monthlyIncome > 0 ? monthlyIncome : Math.max(totalBudgeted * 1.25, 15000000);

  const unallocatedAmount = Math.max(0, baseIncome - totalBudgeted);

  // Prepare chart data segments
  const chartData = [
    ...budgets.map((b) => ({
      name: b.category,
      value: b.limitAmount,
      percentage: ((b.limitAmount / baseIncome) * 100).toFixed(1),
      color: CATEGORY_COLORS[b.category] || '#64748b',
    })),
    ...(unallocatedAmount > 0
      ? [
          {
            name: 'Sisa Alokasi / Tabungan',
            value: unallocatedAmount,
            percentage: ((unallocatedAmount / baseIncome) * 100).toFixed(1),
            color: DEFAULT_UNALLOCATED_COLOR,
          },
        ]
      : []),
  ];

  return (
    <div className="rounded-2xl bg-white border border-[#e2e8f0] p-6 space-y-6 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#f1f5f9] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <PieIcon className="h-5 w-5 text-[#004ac6]" />
            <h2 className="text-lg font-bold text-[#0f172a]">
              Persentase Alokasi Gaji Bulanan (100%)
            </h2>
            <span className="text-[10px] font-bold bg-[#004ac6]/10 text-[#004ac6] border border-[#004ac6]/20 px-2 py-0.5 rounded-full">
              Donut Breakdown
            </span>
          </div>
          <p className="text-xs text-[#64748b] mt-0.5">
            Pembagian total pemasukan bulanan ({formatRupiah(baseIncome)}) ke dalam batas kategori anggaran
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[#f8fafc] border border-[#e2e8f0] px-3.5 py-1.5 rounded-xl text-xs font-bold text-[#0f172a]">
          <Wallet className="h-4 w-4 text-[#004ac6]" />
          <span>Total Gaji: {formatRupiah(baseIncome)}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Donut Chart Visual */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center relative min-h-[260px]">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={105}
                paddingAngle={4}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="#ffffff" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
                  fontSize: '12px',
                }}
                formatter={(value: any, name: any, props: any) => [
                  `${formatRupiah(Number(value))} (${props.payload.percentage}%)`,
                  name,
                ]}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Center Badge overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#64748b]">
              Dialokasikan
            </span>
            <span className="text-xl font-extrabold font-mono text-[#0f172a]">
              {(((totalBudgeted / baseIncome) * 100) || 0).toFixed(0)}%
            </span>
            <span className="text-[10px] text-[#006c49] font-bold">
              {formatRupiah(totalBudgeted)}
            </span>
          </div>
        </div>

        {/* Legend & Percentage List Grid */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {chartData.map((item) => (
            <div
              key={item.name}
              className="flex items-center justify-between p-3 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] hover:bg-white hover:shadow-sm transition-all"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span
                  className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs"
                  style={{ backgroundColor: item.color }}
                />
                <div className="truncate">
                  <h4 className="text-xs font-bold text-[#0f172a] truncate">{item.name}</h4>
                  <p className="text-[10px] text-[#64748b]">{formatRupiah(item.value)}</p>
                </div>
              </div>

              <div className="text-right shrink-0 pl-2">
                <span
                  className="text-xs font-mono font-bold px-2 py-0.5 rounded-lg bg-white border border-[#e2e8f0]"
                  style={{ color: item.color }}
                >
                  {item.percentage}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
