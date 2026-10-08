'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { mockLogin } from '@/infrastructure/mock/mockAuth';
import { apiLogin, apiVerifyEmail, apiResendVerification } from '@/infrastructure/api/authApi';
import {
  Coins,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  KeyRound,
  RefreshCw,
  Edit3,
} from 'lucide-react';
import { AuthLoadingOverlay } from '@/presentation/components/ui/AuthLoadingOverlay';

export default function LoginPage() {
  const router = useRouter();

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  // OTP Verification Modal / Step State (if unverified user logs in)
  const [step, setStep] = useState<'LOGIN' | 'VERIFY_OTP'>('LOGIN');
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [resendCooldown, setResendCooldown] = useState(60);
  const [isResending, setIsResending] = useState(false);
  const [otpSuccessMessage, setOtpSuccessMessage] = useState('');

  // General Status
  const [loading, setLoading] = useState(false);
  const [showLoadingOverlay, setShowLoadingOverlay] = useState(false);
  const [error, setError] = useState('');

  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Cooldown countdown
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 'VERIFY_OTP' && resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, resendCooldown]);

  const validateForm = () => {
    const errors: { email?: string; password?: string } = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email.trim()) {
      errors.email = 'Alamat email wajib diisi.';
    } else if (!emailRegex.test(email.trim())) {
      errors.email = 'Format alamat email tidak valid.';
    }

    if (!password) {
      errors.password = 'Kata sandi wajib diisi.';
    } else if (password.length < 6) {
      errors.password = 'Kata sandi minimal 6 karakter.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      setError('Mohon periksa kembali input formulir Anda.');
      return;
    }

    try {
      setLoading(true);
      try {
        await apiLogin(email, password);
        setShowLoadingOverlay(true);
        return;
      } catch (apiErr: unknown) {
        // If error indicates unverified email, switch to OTP verification step
        const errObj = apiErr as { requires_verification?: boolean; email?: string; message?: string };
        if (errObj.requires_verification) {
          setStep('VERIFY_OTP');
          setResendCooldown(60);
          setOtpDigits(['', '', '', '', '', '']);
          setOtpSuccessMessage('Email Anda belum diverifikasi. Kode OTP baru telah dikirim ke email Anda.');
          setTimeout(() => {
            otpInputRefs.current[0]?.focus();
          }, 100);
          return;
        }

        if (
          apiErr instanceof Error &&
          !apiErr.message.includes('Failed to fetch') &&
          !apiErr.message.includes('NetworkError') &&
          !apiErr.message.includes('fetch failed')
        ) {
          throw apiErr;
        }

        const user = await mockLogin(email, password);
        localStorage.setItem('auroka_user', JSON.stringify(user));
        setShowLoadingOverlay(true);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Gagal melakukan login');
      setLoading(false);
    } finally {
      if (step === 'LOGIN') {
        setLoading(false);
      }
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

  const handleVerifyOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setOtpSuccessMessage('');

    const code = otpDigits.join('');
    if (code.length < 6) {
      setError('Silakan masukkan 6 digit kode verifikasi dengan lengkap.');
      return;
    }

    try {
      setLoading(true);
      await apiVerifyEmail(email, code);
      setShowLoadingOverlay(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Kode verifikasi salah atau telah kadaluarsa.');
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0 || isResending) return;

    try {
      setIsResending(true);
      setError('');
      await apiResendVerification(email);
      setResendCooldown(60);
      setOtpDigits(['', '', '', '', '', '']);
      setOtpSuccessMessage('Kode verifikasi baru berhasil dikirim ulang ke email Anda.');
      otpInputRefs.current[0]?.focus();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Gagal mengirim ulang kode verifikasi.');
    } finally {
      setIsResending(false);
    }
  };

  const handleLoadingComplete = () => {
    router.push('/dashboard');
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
          {step === 'LOGIN' ? 'Masuk ke Akun Auroka Anda' : 'Verifikasi Alamat Email'}
        </h2>
        <p className="text-xs text-[#434655]">
          {step === 'LOGIN'
            ? 'Kelola pencatatan keuangan & transaksi harian Anda'
            : 'Masukkan 6 digit kode OTP yang telah dikirim ke email Anda'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white border border-[#c3c6d7]/60 py-8 px-6 sm:px-10 shadow-xl rounded-2xl space-y-6">
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

          {otpSuccessMessage && (
            <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 text-xs text-[#006c49] font-medium">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-[#006c49]" />
              <span>{otpSuccessMessage}</span>
            </div>
          )}

          {step === 'LOGIN' ? (
            /* STEP 1: Login Form */
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#0b1c30] mb-1.5">
                  Alamat Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-[#434655]" />
                  <input
                    id="login-email-input"
                    name="email"
                    data-testid="login-email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: undefined }));
                    }}
                    placeholder="nama@email.com"
                    className={`w-full rounded-xl bg-[#f8f9ff] border ${
                      fieldErrors.email ? 'border-rose-500 ring-1 ring-rose-500' : 'border-[#c3c6d7]'
                    } pl-10 pr-3 py-2.5 text-xs text-[#0b1c30] placeholder-slate-400 focus:outline-none focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/20 transition-all`}
                  />
                </div>
                {fieldErrors.email && (
                  <p id="email-error-text" className="mt-1 text-[11px] text-rose-600 font-semibold flex items-center gap-1">
                    <AlertCircle className="h-3 w-3 inline" /> {fieldErrors.email}
                  </p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-[#0b1c30]">
                    Kata Sandi
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-[11px] font-semibold text-[#004ac6] hover:underline"
                  >
                    Lupa password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-[#434655]" />
                  <input
                    id="login-password-input"
                    name="password"
                    data-testid="login-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: undefined }));
                    }}
                    placeholder="Masukkan kata sandi"
                    className={`w-full rounded-xl bg-[#f8f9ff] border ${
                      fieldErrors.password ? 'border-rose-500 ring-1 ring-rose-500' : 'border-[#c3c6d7]'
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
                {fieldErrors.password && (
                  <p id="password-error-text" className="mt-1 text-[11px] text-rose-600 font-semibold flex items-center gap-1">
                    <AlertCircle className="h-3 w-3 inline" /> {fieldErrors.password}
                  </p>
                )}
              </div>

              <div className="pt-2">
                <button
                  id="login-submit-btn"
                  data-testid="login-submit"
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-[#004ac6] hover:bg-[#2563eb] text-white py-3 rounded-xl font-bold text-xs shadow-lg shadow-[#004ac6]/20 hover:shadow-xl transition-all disabled:opacity-75 cursor-pointer active:scale-[0.99]"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Memproses Sesi...</span>
                    </>
                  ) : (
                    <>
                      <span>Masuk ke Akun</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#c3c6d7]/60"></div>
                </div>
                <div className="relative flex justify-center text-[11px]">
                  <span className="bg-white px-2 text-[#434655]">Atau</span>
                </div>
              </div>

              <div>
                <a
                  href="/api/v1/auth/google"
                  className="w-full flex items-center justify-center gap-2 bg-white border border-[#c3c6d7] hover:bg-gray-50 text-[#0b1c30] py-3 rounded-xl font-bold text-xs shadow-sm transition-all"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  <span>Masuk dengan Google</span>
                </a>
              </div>
            </form>
          ) : (
            /* STEP 2: OTP Verification Screen */
            <form onSubmit={handleVerifyOtpSubmit} className="space-y-6">
              <div className="bg-[#eff4ff] border border-[#004ac6]/20 rounded-2xl p-4 text-center space-y-2">
                <div className="inline-flex p-3 rounded-full bg-[#004ac6]/10 text-[#004ac6] mb-1">
                  <KeyRound className="h-6 w-6" />
                </div>
                <div className="text-xs font-semibold text-[#0b1c30]">
                  Verifikasi email Anda untuk melanjutkan masuk:
                </div>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#004ac6] bg-white px-3 py-1 rounded-full border border-[#004ac6]/20">
                  <Mail className="h-3.5 w-3.5" />
                  <span>{email}</span>
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => {
                      setStep('LOGIN');
                      setError('');
                    }}
                    className="inline-flex items-center gap-1 text-[11px] text-[#64748b] hover:text-[#004ac6] font-medium transition-colors cursor-pointer"
                  >
                    <Edit3 className="h-3 w-3" />
                    <span>Kembali ke Halaman Masuk</span>
                  </button>
                </div>
              </div>

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
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading || otpDigits.join('').length < 6}
                  className="w-full flex items-center justify-center gap-2 bg-[#004ac6] hover:bg-[#2563eb] text-white py-3 rounded-xl font-bold text-xs shadow-lg shadow-[#004ac6]/20 hover:shadow-xl transition-all disabled:opacity-50 cursor-pointer active:scale-[0.99]"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Memverifikasi Akun...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Verifikasi & Masuk ke Dashboard</span>
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
              <span>Sistem Ledger Terenkripsi & Aman</span>
            </div>
          </div>

          <div className="text-center pt-2">
            <p className="text-xs text-[#434655]">
              Belum memiliki akun?{' '}
              <Link
                href="/register"
                className="font-bold text-[#004ac6] hover:underline"
              >
                Daftar Sekarang
              </Link>
            </p>
          </div>
        </div>
      </div>

      <AuthLoadingOverlay
        isOpen={showLoadingOverlay}
        onComplete={handleLoadingComplete}
        title="Memverifikasi Sesi Masuk"
      />
    </div>
  );
}
