'use client';

import React, { useState } from 'react';
import Image from 'next/image';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface AvatarProps {
  src?: string | null;
  name?: string;
  size?: AvatarSize;
  className?: string;
  alt?: string;
}

const sizeStyles: Record<AvatarSize, { container: string; text: string; px: number }> = {
  xs: { container: 'w-6 h-6 rounded-lg', text: 'text-[10px]', px: 24 },
  sm: { container: 'w-8 h-8 rounded-xl', text: 'text-xs', px: 32 },
  md: { container: 'w-10 h-10 rounded-2xl', text: 'text-sm', px: 40 },
  lg: { container: 'w-14 h-14 rounded-2xl', text: 'text-lg', px: 56 },
  xl: { container: 'w-20 h-20 rounded-3xl', text: 'text-2xl', px: 80 },
};

export const Avatar: React.FC<AvatarProps> = ({
  src,
  name = 'User',
  size = 'md',
  className = '',
  alt,
}) => {
  const [imgError, setImgError] = useState(false);

  const getInitials = (fullName?: string) => {
    if (!fullName) return 'AU';
    const parts = fullName.trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return fullName.slice(0, 2).toUpperCase();
  };

  const { container, text, px } = sizeStyles[size];

  if (src && !imgError) {
    return (
      <div
        className={`relative shrink-0 overflow-hidden bg-slate-100 ring-2 ring-transparent transition-all ${container} ${className}`}
      >
        <Image
          src={src}
          alt={alt || name || 'Avatar'}
          width={px}
          height={px}
          className="w-full h-full object-cover"
          onError={() => setImgError(true)}
          unoptimized
        />
      </div>
    );
  }

  return (
    <div
      className={`shrink-0 bg-gradient-to-tr from-[#004ac6] to-[#2563eb] text-white flex items-center justify-center font-bold shadow-sm ring-2 ring-transparent ${container} ${text} ${className}`}
    >
      {getInitials(name)}
    </div>
  );
};
