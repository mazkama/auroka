'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  actions?: React.ReactNode;
  badge?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  icon: Icon,
  actions,
  badge,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-[#e2e8f0] rounded-2xl p-5 shadow-sm ${className}`}
    >
      <div>
        <div className="flex items-center gap-2.5 flex-wrap">
          {Icon && (
            <div className="w-8 h-8 rounded-xl bg-[#eff4ff] text-[#004ac6] flex items-center justify-center shrink-0 shadow-xs">
              <Icon className="h-4 w-4" />
            </div>
          )}
          <h1 className="text-lg sm:text-2xl font-extrabold text-[#0b1c30] tracking-tight">
            {title}
          </h1>
          {badge && <div>{badge}</div>}
        </div>
        {subtitle && <p className="text-xs text-[#64748b] mt-1.5">{subtitle}</p>}
      </div>

      {actions && (
        <div className="flex items-center gap-2.5 flex-wrap shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
};
