'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiForgotPassword, apiResetPassword } from '@/infrastructure/api/authApi';
import {
  Coins,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  CheckCircle2,
  RefreshCw,
  Edit3,
  KeyRound,
  Check,
} from 'lucide-react';
import { AuthLoadingOverlay } from '@/presentation/components/ui/AuthLoadingOverlay';

export default function ForgotPasswordPage() {
  const router = useRouter();

  // Step 1: Request OTP State
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');

  // Step 2: Reset Password State
  const [step, setStep] = useState<'REQUEST_OTP' | 'RESET_PASSWORD' | 'SUCCESS'>('REQUEST_OTP');
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetFieldErrors, setResetFieldErrors] = useState<{
    otp?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});

  // Cooldown & Resend State
  const [resendCooldown, setResendCooldown] = useState(60);
  const [isResending, setIsResending] = useState(false);
  const [otpSuccessMessage, setOtpSuccessMessage] = useState('');

  // General Status
  const [loading, setLoading] = useState(false);
  const [showLoadingOverlay, setShowLoadingOverlay] = useState(false);
  const [error, setError] = useState('');

  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Timer cooldown for Resend OTP
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 'RESET_PASSWORD' && resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, resendCooldown]);

  const validateEmail = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      setEmailError('Alamat email wajib diisi.');
      return false;
    }
    if (!emailRegex.test(email.trim())) {
      setEmailError('Format alamat email tidak valid.');
      return false;
    }
    setEmailError('');
    return true;
  };

  const handleRequestOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateEmail()) {
      return;
    }

    try {
      setLoading(true);
      const res = await apiForgotPassword(email.trim());
      setStep('RESET_PASSWORD');
      setResendCooldown(60);
      setOtpDigits(['', '', '', '', '', '']);
      setOtpSuccessMessage(res.message || 'Kode OTP reset kata sandi telah dikirim ke email Anda.');
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 100);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Gagal mengirim kode reset kata sandi.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pastedData) return;

    const newDigits = [...otpDigits];
    pastedData.split('').forEach((char, i) => {
      newDigits[i] = char;
    });
    setOtpDigits(newDigits);

    const nextIdx = Math.min(pastedData.length, 5);
    otpInputRefs.current[nextIdx]?.focus();
  };

  const handleOtpChange = (index: number, value: string) => {
    const cleanVal = value.replace(/\D/g, '');

    if (cleanVal.length > 1) {
      const pasted = cleanVal.slice(0, 6).split('');
      const newDigits = [...otpDigits];
      pasted.forEach((char, i) => {
        newDigits[i] = char;
      });
      setOtpDigits(newDigits);
      const nextIdx = Math.min(pasted.length, 5);
      otpInputRefs.current[nextIdx]?.focus();
      return;
    }

    const newDigits = [...otpDigits];
    newDigits[index] = cleanVal;
    setOtpDigits(newDigits);

    if (cleanVal && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0 || isResending) return;

    try {
      setIsResending(true);
      setError('');
      const res = await apiForgotPassword(email.trim());
      setResendCooldown(60);
      setOtpDigits(['', '', '', '', '', '']);
      setOtpSuccessMessage(res.message || 'Kode reset kata sandi baru berhasil dikirim ke email Anda.');
      otpInputRefs.current[0]?.focus();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Gagal mengirim ulang kode reset.');
    } finally {
      setIsResending(false);
    }
  };

  const validateResetForm = () => {
    const errors: { otp?: string; newPassword?: string; confirmPassword?: string } = {};
    const code = otpDigits.join('');

    if (code.length < 6) {
      errors.otp = 'Masukkan 6 digit kode OTP secara lengkap.';
    }

    if (!newPassword) {
      errors.newPassword = 'Kata sandi baru wajib diisi.';
    } else if (newPassword.length < 6) {
      errors.newPassword = 'Kata sandi baru minimal 6 karakter.';
    }

    if (!confirmPassword) {
      errors.confirmPassword = 'Konfirmasi kata sandi wajib diisi.';
    } else if (confirmPassword !== newPassword) {
      errors.confirmPassword = 'Konfirmasi kata sandi tidak cocok.';
    }

    setResetFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setOtpSuccessMessage('');

    if (!validateResetForm()) {
      return;
    }

    const code = otpDigits.join('');

    try {
      setLoading(true);
      await apiResetPassword(email.trim(), code, newPassword);
      setShowLoadingOverlay(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Gagal mengatur ulang kata sandi.');
      setLoading(false);
    }
  };

  const handleLoadingComplete = () => {
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-[#f8f9ff] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans selection:bg-[#004ac6] selection:text-white">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <Link href="/" className="inline-flex items-center gap-2 group">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#004ac6] to-[#2563eb] text-white shadow-lg shadow-[#004ac6]/30 group-hover:scale-105 transition-transform">
            <Coins className="h-6 w-6" />
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-[#004ac6]">
            Auroka
          </span>
        </Link>
        <h2 className="text-2xl font-extrabold text-[#0b1c30] tracking-tight">
          {step === 'REQUEST_OTP' ? 'Pemulihan Kata Sandi' : 'Atur Ulang Kata Sandi'}
        </h2>
        <p className="text-xs text-[#434655]">
          {step === 'REQUEST_OTP'
            ? 'Masukkan email akun Anda untuk menerima 6 digit kode OTP reset kata sandi'
            : 'Masukkan kode OTP yang dikirimkan ke email dan buat kata sandi baru'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white border border-[#c3c6d7]/60 py-8 px-6 sm:px-10 shadow-xl rounded-2xl space-y-6">
          {/* Error Alert */}
          {error && (
            <div
              id="auth-alert-message"
              data-testid="auth-alert"
              className="auth-alert-banner flex items-center gap-2 rounded-xl bg-rose-500/10 border border-rose-500/20 p-3 text-xs text-[#ba1a1a] font-medium"
              role="alert"
            >
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Success / Info Alert */}
          {otpSuccessMessage && (
            <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 text-xs text-[#006c49] font-medium">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-[#006c49]" />
              <span>{otpSuccessMessage}</span>
            </div>
          )}

          {step === 'REQUEST_OTP' ? (
            /* STEP 1: Enter Email */
            <form onSubmit={handleRequestOtpSubmit} noValidate className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#0b1c30] mb-1.5">
                  Alamat Email Terdaftar
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-[#434655]" />
                  <input
                    id="forgot-email-input"
                    name="email"
                    data-testid="forgot-email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (emailError) setEmailError('');
                    }}
                    placeholder="nama@email.com"
                    className={`w-full rounded-xl bg-[#f8f9ff] border ${
                      emailError ? 'border-rose-500 ring-1 ring-rose-500' : 'border-[#c3c6d7]'
                    } pl-10 pr-3 py-2.5 text-xs text-[#0b1c30] placeholder-slate-400 focus:outline-none focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/20 transition-all`}
                  />
                </div>
                {emailError && (
                  <p id="email-error-text" className="mt-1 text-[11px] text-rose-600 font-semibold flex items-center gap-1">
                    <AlertCircle className="h-3 w-3 inline" /> {emailError}
                  </p>
                )}
              </div>

              <div className="pt-2">
                <button
                  id="forgot-submit-btn"
                  data-testid="forgot-submit"
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-[#004ac6] hover:bg-[#2563eb] text-white py-3 rounded-xl font-bold text-xs shadow-lg shadow-[#004ac6]/20 hover:shadow-xl transition-all disabled:opacity-75 cursor-pointer active:scale-[0.99]"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Mengirim Kode OTP...</span>
                    </>
                  ) : (
                    <>
                      <span>Kirim Kode OTP Reset</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            /* STEP 2: Enter OTP and New Password */
            <form onSubmit={handleResetPasswordSubmit} noValidate className="space-y-5">
              <div className="bg-[#eff4ff] border border-[#004ac6]/20 rounded-2xl p-4 text-center space-y-2">
                <div className="inline-flex p-3 rounded-full bg-[#004ac6]/10 text-[#004ac6] mb-1">
                  <KeyRound className="h-6 w-6" />
                </div>
                <div className="text-xs font-semibold text-[#0b1c30]">
                  Kode OTP telah dikirim ke:
                </div>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#004ac6] bg-white px-3 py-1 rounded-full border border-[#004ac6]/20">
                  <Mail className="h-3.5 w-3.5" />
                  <span>{email}</span>
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => {
                      setStep('REQUEST_OTP');
                      setError('');
                    }}
                    className="inline-flex items-center gap-1 text-[11px] text-[#64748b] hover:text-[#004ac6] font-medium transition-colors cursor-pointer"
                  >
                    <Edit3 className="h-3 w-3" />
                    <span>Ganti Alamat Email</span>
                  </button>
                </div>
              </div>

              {/* 6-Digit OTP Input */}
              <div className="space-y-2">
                <label className="block text-center text-xs font-bold text-[#0b1c30]">
                  Masukkan 6 Digit Kode OTP
                </label>
                <div className="flex justify-between items-center gap-2 max-w-[340px] mx-auto">
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => {
                        otpInputRefs.current[idx] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      onPaste={handleOtpPaste}
                      className="w-11 h-13 text-center text-xl font-extrabold text-[#004ac6] bg-[#f8f9ff] border-2 border-[#c3c6d7] rounded-xl focus:border-[#004ac6] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#004ac6]/20 transition-all font-mono"
                    />
                  ))}
                </div>
                {resetFieldErrors.otp && (
                  <p className="text-center text-[11px] text-rose-600 font-semibold mt-1">
                    {resetFieldErrors.otp}
                  </p>
                )}
              </div>

              {/* New Password */}
              <div>
                <label className="block text-xs font-bold text-[#0b1c30] mb-1.5">
                  Kata Sandi Baru
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-[#434655]" />
                  <input
                    id="new-password-input"
                    name="newPassword"
                    data-testid="new-password"
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      if (resetFieldErrors.newPassword) {
                        setResetFieldErrors((prev) => ({ ...prev, newPassword: undefined }));
                      }
                    }}
                    placeholder="Minimal 6 karakter"
                    className={`w-full rounded-xl bg-[#f8f9ff] border ${
                      resetFieldErrors.newPassword ? 'border-rose-500 ring-1 ring-rose-500' : 'border-[#c3c6d7]'
                    } pl-10 pr-10 py-2.5 text-xs text-[#0b1c30] placeholder-slate-400 focus:outline-none focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/20 transition-all`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 p-1 text-[#64748b] hover:text-[#004ac6] transition-colors"
                    aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {resetFieldErrors.newPassword && (
                  <p className="mt-1 text-[11px] text-rose-600 font-semibold flex items-center gap-1">
                    <AlertCircle className="h-3 w-3 inline" /> {resetFieldErrors.newPassword}
                  </p>
                )}
              </div>

              {/* Confirm New Password */}
              <div>
                <label className="block text-xs font-bold text-[#0b1c30] mb-1.5">
                  Konfirmasi Kata Sandi Baru
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-[#434655]" />
                  <input
                    id="confirm-password-input"
                    name="confirmPassword"
                    data-testid="confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (resetFieldErrors.confirmPassword) {
                        setResetFieldErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                      }
                    }}
                    placeholder="Ulangi kata sandi baru"
                    className={`w-full rounded-xl bg-[#f8f9ff] border ${
                      resetFieldErrors.confirmPassword ? 'border-rose-500 ring-1 ring-rose-500' : 'border-[#c3c6d7]'
                    } pl-10 pr-10 py-2.5 text-xs text-[#0b1c30] placeholder-slate-400 focus:outline-none focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/20 transition-all`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-2.5 p-1 text-[#64748b] hover:text-[#004ac6] transition-colors"
                    aria-label={showConfirmPassword ? 'Sembunyikan konfirmasi' : 'Tampilkan konfirmasi'}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {resetFieldErrors.confirmPassword && (
                  <p className="mt-1 text-[11px] text-rose-600 font-semibold flex items-center gap-1">
                    <AlertCircle className="h-3 w-3 inline" /> {resetFieldErrors.confirmPassword}
                  </p>
                )}
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-[#004ac6] hover:bg-[#2563eb] text-white py-3 rounded-xl font-bold text-xs shadow-lg shadow-[#004ac6]/20 hover:shadow-xl transition-all disabled:opacity-50 cursor-pointer active:scale-[0.99]"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Mengatur Ulang Kata Sandi...</span>
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      <span>Simpan Kata Sandi Baru</span>
                    </>
                  )}
                </button>
              </div>

              <div className="text-center pt-2">
                <p className="text-xs text-[#64748b]">
                  Belum menerima kode OTP?{' '}
                  {resendCooldown > 0 ? (
                    <span className="font-semibold text-[#004ac6]">
                      Kirim ulang dalam {resendCooldown}s
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={isResending}
                      className="font-bold text-[#004ac6] hover:underline inline-flex items-center gap-1 cursor-pointer"
                    >
                      {isResending ? (
                        <>
                          <Loader2 className="h-3 w-3 animate-spin" />
                          <span>Mengirim...</span>
                        </>
                      ) : (
                        <>
                          <RefreshCw className="h-3 w-3" />
                          <span>Kirim Ulang Kode</span>
                        </>
                      )}
                    </button>
                  )}
                </p>
              </div>
            </form>
          )}

          <div className="pt-4 border-t border-[#c3c6d7]/40 space-y-1 text-center">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#006c49]">
              <ShieldCheck className="h-4 w-4" />
              <span>Verifikasi Kode OTP Enkripsi Aman</span>
            </div>
          </div>

          <div className="text-center pt-2">
            <p className="text-xs text-[#434655]">
              Sudah ingat kata sandi?{' '}
              <Link
                href="/login"
                className="font-bold text-[#004ac6] hover:underline"
              >
                Kembali ke Halaman Masuk
              </Link>
            </p>
          </div>
        </div>
      </div>

      <AuthLoadingOverlay
        isOpen={showLoadingOverlay}
        onComplete={handleLoadingComplete}
        title="Kata Sandi Berhasil Diperbarui"
      />
    </div>
  );
}
