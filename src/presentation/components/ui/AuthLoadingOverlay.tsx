'use client';

import React, { useEffect, useState } from 'react';
import { Coins, Check, LogOut, UserPlus } from 'lucide-react';

interface AuthLoadingOverlayProps {
  isOpen: boolean;
  onComplete?: () => void;
  mode?: 'login' | 'register' | 'logout';
  title?: string;
}

export const AuthLoadingOverlay: React.FC<AuthLoadingOverlayProps> = ({
  isOpen,
  onComplete,
  mode = 'login',
}) => {
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setIsSuccess(false);
      return;
    }

    // Snappy, modern flow: 450ms spinner -> 300ms success state -> onComplete
    const successTimer = setTimeout(() => {
      setIsSuccess(true);
    }, 450);

    const completeTimer = setTimeout(() => {
      if (onComplete) {
        onComplete();
      }
    }, 850);

    return () => {
      clearTimeout(successTimer);
      clearTimeout(completeTimer);
    };
  }, [isOpen, onComplete]);

  if (!isOpen) return null;

  const isLogout = mode === 'logout';

  const getLoadingContent = () => {
    switch (mode) {
      case 'logout':
        return {
          loadingTitle: 'Mengakhiri Sesi',
          loadingSubtitle: 'Membersihkan data sesi...',
          successTitle: 'Berhasil Keluar',
          successSubtitle: 'Mengalihkan ke halaman login...',
          icon: <LogOut className="h-4 w-4 text-[#ba1a1a] opacity-90" />,
          spinnerColor: 'text-[#ba1a1a]',
          successBg: 'bg-[#ba1a1a] shadow-[#ba1a1a]/30',
          progressBarGradient: 'bg-gradient-to-r from-rose-400 to-[#ba1a1a]',
          progressSuccessBg: 'bg-[#ba1a1a]',
        };
      case 'register':
        return {
          loadingTitle: 'Mempersiapkan Akun',
          loadingSubtitle: 'Mendaftarkan data pengguna...',
          successTitle: 'Akun Berhasil Dibuat',
          successSubtitle: 'Membuka dashboard finansial...',
          icon: <UserPlus className="h-4 w-4 text-[#004ac6] opacity-80" />,
          spinnerColor: 'text-[#004ac6]',
          successBg: 'bg-[#004ac6] shadow-[#004ac6]/30',
          progressBarGradient: 'bg-gradient-to-r from-[#004ac6] to-[#2563eb]',
          progressSuccessBg: 'bg-[#004ac6]',
        };
      default:
        return {
          loadingTitle: 'Memproses Sesi',
          loadingSubtitle: 'Mohon tunggu sebentar...',
          successTitle: 'Berhasil Masuk',
          successSubtitle: 'Membuka dashboard finansial...',
          icon: <Coins className="h-4 w-4 text-[#004ac6] opacity-80" />,
          spinnerColor: 'text-[#004ac6]',
          successBg: 'bg-[#004ac6] shadow-[#004ac6]/30',
          progressBarGradient: 'bg-gradient-to-r from-[#004ac6] to-[#2563eb]',
          progressSuccessBg: 'bg-[#004ac6]',
        };
    }
  };

  const content = getLoadingContent();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0b1c30]/40 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Sleek Minimalist Glass Card */}
      <div className="relative w-full max-w-[260px] rounded-2xl bg-white/95 backdrop-blur-xl border border-[#e2e8f0] p-6 shadow-2xl text-center space-y-4 animate-in zoom-in-95 duration-200">
        {/* Animated Modern Minimal Spinner / Success Icon */}
        <div className="relative flex items-center justify-center w-12 h-12 mx-auto">
          {!isSuccess ? (
            <>
              {/* Ultra-sleek SVG Circular Spinner */}
              <svg
                className={`animate-spin h-12 w-12 ${content.spinnerColor}`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-20"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="2.5"
                />
                <path
                  className="opacity-90"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              {/* Center Mode Icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                {content.icon}
              </div>
            </>
          ) : (
            <div
              className={`w-11 h-11 rounded-full ${content.successBg} text-white flex items-center justify-center shadow-md animate-in zoom-in duration-200`}
            >
              {isLogout ? (
                <LogOut className="h-5 w-5 stroke-[2.5]" />
              ) : (
                <Check className="h-5 w-5 stroke-[2.5]" />
              )}
            </div>
          )}
        </div>

        {/* Minimal Clean Text */}
        <div className="space-y-1">
          <h3 className="font-extrabold text-sm text-[#0b1c30] tracking-tight">
            {isSuccess ? content.successTitle : content.loadingTitle}
          </h3>
          <p className="text-xs text-[#64748b]">
            {isSuccess ? content.successSubtitle : content.loadingSubtitle}
          </p>
        </div>

        {/* Micro Thin Progress Line */}
        <div className="h-1 w-full bg-[#f1f5f9] rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-400 ease-out ${
              isSuccess
                ? `w-full ${content.progressSuccessBg}`
                : `w-2/3 ${content.progressBarGradient} animate-pulse`
            }`}
          />
        </div>
      </div>
    </div>
  );
};
