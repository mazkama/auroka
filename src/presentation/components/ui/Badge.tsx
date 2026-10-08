'use client';

import React from 'react';

export type BadgeVariant = 'primary' | 'success' | 'danger' | 'warning' | 'info' | 'neutral';
export type BadgeSize = 'sm' | 'md';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: React.ReactNode;
}

const variantStyles: Record<BadgeVariant, string> = {
  primary: 'bg-[#eff4ff] text-[#004ac6] border-[#bfdbfe]',
  success: 'bg-[#ecfdf5] text-[#059669] border-[#a7f3d0]',
  danger: 'bg-[#fef2f2] text-[#dc2626] border-[#fecaca]',
  warning: 'bg-[#fffbeb] text-[#d97706] border-[#fde68a]',
  info: 'bg-[#f0f9ff] text-[#0284c7] border-[#bae6fd]',
  neutral: 'bg-[#f1f5f9] text-[#475569] border-[#e2e8f0]',
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-[10px] gap-1',
  md: 'px-2.5 py-1 text-xs gap-1.5',
};

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  icon,
  className = '',
  ...props
}) => {
  return (
    <span
      className={`inline-flex items-center font-bold rounded-full border shrink-0 ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
