'use client';

import React, { forwardRef } from 'react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  containerClassName?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      error,
      helperText,
      containerClassName = '',
      className = '',
      disabled,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className={`space-y-1.5 w-full ${containerClassName}`}>
        {label && (
          <label htmlFor={inputId} className="block text-xs font-bold text-[#0b1c30]">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          disabled={disabled}
          className={`w-full bg-white border text-[#0b1c30] placeholder-[#94a3b8] text-xs sm:text-sm rounded-xl p-3 transition-all outline-none disabled:bg-[#f8fafc] disabled:cursor-not-allowed resize-none ${
            error
              ? 'border-[#ef4444] focus:border-[#ef4444] focus:ring-2 focus:ring-[#ef4444]/20'
              : 'border-[#cbd5e1] focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/15'
          } ${className}`}
          {...props}
        />
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

Textarea.displayName = 'Textarea';
