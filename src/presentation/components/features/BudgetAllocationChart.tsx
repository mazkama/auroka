'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Budget } from '@/domain/entities/budget';
import { formatRupiah } from '@/presentation/utils/formatters';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { PieChart as PieIcon, Wallet } from 'lucide-react';

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
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const legendContainerRef = useRef<HTMLDivElement>(null);

  // Close blur mode when clicking anywhere outside the chart sectors or legend
  useEffect(() => {
    if (activeIndex === null) return;

    const handleClickOutside = (event: Event) => {
      const target = event.target as Element | null;
      if (!target) return;

      // Ignore if clicked on a pie chart sector
      if (
        typeof target.closest === 'function' &&
        (target.closest('.recharts-sector') || target.closest('.recharts-pie-sector'))
      ) {
        return;
      }

      // Ignore if clicked on a legend item
      if (legendContainerRef.current && legendContainerRef.current.contains(target)) {
        return;
      }

      setActiveIndex(null);
    };

    const timer = setTimeout(() => {
      document.addEventListener('pointerdown', handleClickOutside);
    }, 50);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('pointerdown', handleClickOutside);
    };
  }, [activeIndex]);

  // If no budgets and no income
  if (budgets.length === 0 && monthlyIncome <= 0) {
    return (
      <div className="rounded-3xl bg-white border border-[#e2e8f0] p-6 space-y-4 shadow-xs">
        <div className="flex items-center justify-between gap-3 border-b border-[#f1f5f9] pb-4">
          <div className="flex items-center gap-2">
            <PieIcon className="h-5 w-5 text-[#004ac6]" />
            <h2 className="text-base sm:text-lg font-extrabold text-[#0b1c30]">
              Persentase Alokasi Gaji Bulanan (100%)
            </h2>
          </div>
        </div>
        <div className="py-12 flex flex-col items-center justify-center text-center space-y-3 bg-[#f8fafc] rounded-2xl border border-dashed border-[#cbd5e1]">
          <div className="p-3 bg-[#eff4ff] text-[#004ac6] rounded-2xl">
            <PieIcon className="h-8 w-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-[#0b1c30]">Belum Ada Data Anggaran & Pemasukan</h3>
            <p className="text-xs text-[#64748b] max-w-sm">
              Tambahkan data transaksi pemasukan atau atur batas anggaran bulanan untuk melihat visualisasi alokasi donat 100%.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // If monthly income is 0 or less, fallback to total budgeted limit
  const totalBudgeted = budgets.reduce((acc, b) => acc + b.limitAmount, 0);
  const baseIncome = monthlyIncome > 0 ? monthlyIncome : totalBudgeted;

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

  const handlePieClick = (_: unknown, index: number) => {
    setActiveIndex((prev) => (prev === index ? null : index));
  };

  return (
    <div className="rounded-3xl bg-white border border-[#e2e8f0] p-5 sm:p-6 space-y-5 shadow-xs flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#f1f5f9] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <PieIcon className="h-5 w-5 text-[#004ac6]" />
            <h2 className="text-base sm:text-lg font-extrabold text-[#0b1c30]">
              Persentase Alokasi Gaji (100%)
            </h2>
            <span className="text-[10px] font-bold bg-[#004ac6]/10 text-[#004ac6] border border-[#004ac6]/20 px-2 py-0.5 rounded-full">
              Donut
            </span>
          </div>
          <p className="text-xs text-[#64748b] mt-0.5">
            Total Gaji: <strong className="text-[#0b1c30]">{formatRupiah(baseIncome)}</strong>
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-[#f8fafc] border border-[#e2e8f0] px-3 py-1.5 rounded-xl text-xs font-bold text-[#0b1c30] self-start sm:self-auto">
          <Wallet className="h-3.5 w-3.5 text-[#004ac6]" />
          <span>{formatRupiah(baseIncome)}</span>
        </div>
      </div>

      {/* Donut Chart Visual Area - Perfectly Centered & Constrained to Prevent Squishing */}
      <div className="w-full flex flex-col items-center justify-center relative min-h-[220px] h-[220px] select-none outline-none overflow-visible">
        <ResponsiveContainer width="100%" height={220} className="outline-none focus:outline-none">
          <PieChart className="outline-none focus:outline-none">
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={82}
              paddingAngle={3}
              dataKey="value"
              onClick={handlePieClick}
              style={{ outline: 'none', cursor: 'pointer' }}
            >
              {chartData.map((entry, index) => {
                const isSelected = activeIndex === index;
                const isDimmed = activeIndex !== null && !isSelected;

                return (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    stroke="#ffffff"
                    strokeWidth={isSelected ? 3 : 2}
                    opacity={isDimmed ? 0.45 : 1}
                    style={{
                      outline: 'none',
                      cursor: 'pointer',
                      filter: isDimmed ? 'blur(0.7px)' : 'none',
                      transition: 'opacity 0.25s ease, filter 0.25s ease',
                      WebkitTapHighlightColor: 'transparent',
                    }}
                  />
                );
              })}
            </Pie>
            <Tooltip
              cursor={false}
              wrapperStyle={{ outline: 'none' }}
              contentStyle={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
                fontSize: '12px',
                outline: 'none',
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
          <div
            onClick={() => setActiveIndex(null)}
            className={`flex flex-col items-center justify-center transition-all ${
              activeIndex !== null ? 'pointer-events-auto cursor-pointer p-1 rounded-full hover:bg-slate-50' : ''
            }`}
            title={activeIndex !== null ? 'Klik untuk reset pilihan' : undefined}
          >
            {activeIndex !== null && chartData[activeIndex] ? (
              <>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#004ac6] truncate max-w-[100px]">
                  {chartData[activeIndex].name}
                </span>
                <span className="text-lg font-black font-mono text-[#0b1c30]">
                  {chartData[activeIndex].percentage}%
                </span>
                <span className="text-[10px] text-[#64748b] font-bold">
                  {formatRupiah(chartData[activeIndex].value)}
                </span>
                <span className="text-[9px] text-[#94a3b8] mt-0.5 font-medium hover:text-[#004ac6]">
                  (reset)
                </span>
              </>
            ) : (
              <>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#64748b]">
                  Dialokasikan
                </span>
                <span className="text-lg font-black font-mono text-[#0b1c30]">
                  {(((totalBudgeted / baseIncome) * 100) || 0).toFixed(0)}%
                </span>
                <span className="text-[10px] text-[#006c49] font-bold">
                  {formatRupiah(totalBudgeted)}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Legend & Breakdown List */}
      <div ref={legendContainerRef} className="space-y-2 pt-2 border-t border-[#f1f5f9]">
        <div className="grid grid-cols-1 gap-2 max-h-[220px] overflow-y-auto pr-1">
          {chartData.map((item, index) => {
            const isSelected = activeIndex === index;
            const isDimmed = activeIndex !== null && !isSelected;

            return (
              <div
                key={item.name}
                onClick={() => setActiveIndex((prev) => (prev === index ? null : index))}
                className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-blue-50/80 border-[#004ac6] shadow-xs ring-1 ring-[#004ac6]/30'
                    : isDimmed
                    ? 'bg-[#f8fafc]/50 border-[#e2e8f0] opacity-55 hover:opacity-85'
                    : 'bg-[#f8fafc] border-[#e2e8f0] hover:bg-white hover:shadow-xs'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className="w-3 h-3 rounded-full shrink-0 shadow-xs transition-transform duration-200"
                    style={{
                      backgroundColor: item.color,
                      transform: isSelected ? 'scale(1.2)' : 'scale(1)',
                    }}
                  />
                  <div className="truncate">
                    <h4 className="text-xs font-bold text-[#0b1c30] truncate">{item.name}</h4>
                    <p className="text-[10px] text-[#64748b]">{formatRupiah(item.value)}</p>
                  </div>
                </div>

                <div className="text-right shrink-0 pl-2">
                  <span
                    className={`text-xs font-mono font-bold px-2 py-0.5 rounded-lg border transition-all ${
                      isSelected
                        ? 'bg-white border-[#004ac6] text-[#004ac6] shadow-xs'
                        : 'bg-white border-[#e2e8f0] text-[#0b1c30]'
                    }`}
                  >
                    {item.percentage}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
