'use client';

import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const mockData = [
  { name: 'Mar', income: 15000000, expense: 8000000 },
  { name: 'Apr', income: 16500000, expense: 9500000 },
  { name: 'Mei', income: 18000000, expense: 12000000 },
  { name: 'Jun', income: 17500000, expense: 8500000 },
  { name: 'Jul', income: 21000000, expense: 14000000 },
  { name: 'Ags', income: 25000000, expense: 10570000 },
];

const formatCurrency = (value: number) => {
  if (value >= 1000000) {
    return `Rp ${(value / 1000000).toFixed(1)} jt`;
  }
  return `Rp ${value.toLocaleString('id-ID')}`;
};

export const CashFlowChart: React.FC = () => {
  return (
    <div className="bg-white border border-[#e2e8f0] rounded-2xl p-6 shadow-sm">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-[#0f172a]">Arus Kas 6 Bulan Terakhir</h3>
        <p className="text-xs text-[#64748b]">Perbandingan total pemasukan dan pengeluaran</p>
      </div>
      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={mockData}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
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
              tick={{ fontSize: 12, fill: '#64748b' }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#64748b' }}
              tickFormatter={formatCurrency}
              width={80}
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
