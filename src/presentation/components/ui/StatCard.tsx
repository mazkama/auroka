'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';
import { formatRupiah } from '@/presentation/utils/formatters';

interface StatCardProps {
  title: string;
  amount: number;
  icon: LucideIcon;
  trend?: string;
  trendType?: 'positive' | 'negative' | 'neutral';
  gradient: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  amount,
  icon: Icon,
  trend,
  trendType = 'neutral',
  gradient,
}) => {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl p-5 border border-slate-800 bg-gradient-to-br ${gradient} shadow-lg transition-transform hover:-translate-y-0.5 duration-200`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          {title}
        </span>
        <div className="rounded-xl bg-slate-800/80 p-2.5 text-slate-200 border border-slate-700/50">
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-4">
        <h3 className="text-2xl font-bold text-white tracking-tight">
          {formatRupiah(amount)}
        </h3>

        {trend && (
          <p
            className={`mt-2 text-xs font-medium ${
              trendType === 'positive'
                ? 'text-emerald-400'
                : trendType === 'negative'
                ? 'text-rose-400'
                : 'text-slate-400'
            }`}
          >
            {trend}
          </p>
        )}
      </div>
    </div>
  );
};
