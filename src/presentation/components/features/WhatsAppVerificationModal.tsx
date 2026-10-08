'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/presentation/components/ui/Modal';
import { UserNotificationSettings } from '@/domain/entities/notification';
import {
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  RefreshCw,
  Phone,
} from 'lucide-react';

interface WhatsAppVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPhone: string;
  onRequestOTP: (phone: string) => Promise<{ message: string; expires_in: number }>;
  onConfirmOTP: (phone: string, code: string) => Promise<{ message: string; data: UserNotificationSettings }>;
  onSuccess: (settings: UserNotificationSettings) => void;
}

export const WhatsAppVerificationModal: React.FC<WhatsAppVerificationModalProps> = ({
  isOpen,
  onClose,
  currentPhone,
  onRequestOTP,
  onConfirmOTP,
  onSuccess,
}) => {
  const [step, setStep] = useState<'PHONE' | 'OTP'>('PHONE');
  const [phone, setPhone] = useState(currentPhone || '');
  const [otpCode, setOtpCode] = useState('');
  const [timer, setTimer] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setPhone(currentPhone || '');
      setOtpCode('');
      setError(null);
      setSuccessMsg(null);
      setStep('PHONE');
    }
  }, [isOpen, currentPhone]);

  // Resend Timer Countdown
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.length < 9) {
      setError('Nomor WhatsApp tidak valid. Masukkan nomor yang terhubung ke akun WA aktif.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await onRequestOTP(phone);
      setSuccessMsg(res.message || 'Kode OTP telah dikirim ke WhatsApp Anda!');
      setStep('OTP');
      setTimer(60); // 60 seconds countdown
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Gagal mengirim kode OTP WhatsApp');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.length < 6) {
      setError('Masukkan 6 digit kode verifikasi OTP yang dikirimkan.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await onConfirmOTP(phone, otpCode);
      setSuccessMsg('Nomor WhatsApp berhasil diverifikasi!');
      setTimeout(() => {
        onSuccess(res.data);
        onClose();
      }, 1200);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Kode OTP salah atau telah kedaluwarsa');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (timer > 0 || loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await onRequestOTP(phone);
      setSuccessMsg(res.message || 'Kode OTP baru telah dikirimkan!');
      setTimer(60);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Gagal mengirim ulang kode OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Verifikasi Nomor WhatsApp" size="sm">
      <div className="space-y-4">
        {/* Header Icon & Intro */}
        <div className="flex items-center gap-3 p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl">
          <div className="p-2.5 bg-emerald-600 text-white rounded-xl shadow-xs">
            <MessageSquare className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-emerald-950">Gerbang Notifikasi WhatsApp</h4>
            <p className="text-[11px] text-emerald-800 leading-snug">
              Verifikasi nomor diperlukan untuk mengaktifkan peringatan tagihan & limit anggaran via WhatsApp APIWA.
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 font-medium flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {step === 'PHONE' ? (
          <form onSubmit={handleRequestOTP} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#334155]">
                Nomor WhatsApp Aktif <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#94a3b8]">
                  <Phone className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Contoh: 081234567890 atau 6281234567890"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#cbd5e1] text-xs font-semibold text-[#0f172a] focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/10 font-mono transition-all"
                  required
                />
              </div>
              <p className="text-[11px] text-[#64748b]">
                Kami akan mengirimkan 6-digit kode OTP ke akun WhatsApp ini.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-[#64748b] hover:bg-[#f1f5f9] rounded-xl transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading || !phone}
                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    <span>Mengirim OTP...</span>
                  </>
                ) : (
                  <>
                    <span>Kirim Kode OTP</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleConfirmOTP} className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-[#334155]">
                  Masukkan 6-Digit Kode OTP WhatsApp
                </label>
                <button
                  type="button"
                  onClick={() => setStep('PHONE')}
                  className="text-[11px] font-bold text-[#004ac6] hover:underline"
                >
                  Ubah Nomor
                </button>
              </div>
              <input
                type="text"
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                placeholder="• • • • • •"
                className="w-full text-center tracking-[0.5em] text-2xl font-extrabold py-3 rounded-xl border border-[#cbd5e1] text-emerald-700 bg-emerald-50/40 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/10 font-mono transition-all"
                required
              />
              <p className="text-[11px] text-[#64748b] text-center">
                OTP dikirim ke <span className="font-bold text-[#0f172a]">{phone}</span>
              </p>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <div className="flex items-center gap-1 text-[#64748b]">
                <Clock className="h-3.5 w-3.5 text-[#94a3b8]" />
                <span>Kirim ulang dalam:</span>
              </div>
              {timer > 0 ? (
                <span className="font-mono font-bold text-emerald-700">{timer}s</span>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={loading}
                  className="font-bold text-emerald-700 hover:underline"
                >
                  Kirim Ulang Kode
                </button>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-[#64748b] hover:bg-[#f1f5f9] rounded-xl transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading || otpCode.length < 6}
                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    <span>Memverifikasi...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4" />
                    <span>Verifikasi & Aktifkan</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
};
