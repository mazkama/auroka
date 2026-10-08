'use client';

import React, { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options?: SelectOption[];
  leftIcon?: React.ReactNode;
  containerClassName?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      error,
      helperText,
      options = [],
      leftIcon,
      containerClassName = '',
      className = '',
      children,
      disabled,
      id,
      ...props
    },
    ref
  ) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className={`space-y-1.5 w-full ${containerClassName}`}>
        {label && (
          <label htmlFor={selectId} className="block text-xs font-bold text-[#0b1c30]">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3.5 flex items-center pointer-events-none text-[#64748b]">
              {leftIcon}
            </div>
          )}
          <select
            ref={ref}
            id={selectId}
            disabled={disabled}
            className={`w-full bg-white border text-[#0b1c30] text-xs sm:text-sm rounded-xl py-2.5 appearance-none pr-10 transition-all outline-none disabled:bg-[#f8fafc] disabled:cursor-not-allowed cursor-pointer ${
              leftIcon ? 'pl-10' : 'pl-3.5'
            } ${
              error
                ? 'border-[#ef4444] focus:border-[#ef4444] focus:ring-2 focus:ring-[#ef4444]/20'
                : 'border-[#cbd5e1] focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/15'
            } ${className}`}
            {...props}
          >
            {children ? (
              children
            ) : (
              options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))
            )}
          </select>
          <div className="absolute right-3.5 pointer-events-none text-[#64748b]">
            <ChevronDown className="h-4 w-4" />
          </div>
        </div>
        {error ? (
          <p className="text-[11px] font-medium text-[#ef4444] animate-in fade-in duration-200">
            {error}
          </p>
        ) : helperText ? (
          <p className="text-[11px] text-[#64748b]">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Select.displayName = 'Select';
