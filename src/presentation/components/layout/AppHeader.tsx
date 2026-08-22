'use client';

import React, { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import {
  Menu,
  Bell,
  Search,
  PlusCircle,
  ShieldCheck,
  User,
  Coins,
  CheckCircle2,
  AlertTriangle,
  Info,
  ArrowRight,
  X,
} from 'lucide-react';

interface AppHeaderProps {
  onToggleMobileSidebar: () => void;
  onOpenAddModal?: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  onToggleMobileSidebar,
  onOpenAddModal,
}) => {
  const pathname = usePathname();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close notification popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getPageTitle = (path: string) => {
    switch (path) {
      case '/dashboard':
        return 'Overview Dashboard';
      case '/transactions':
        return 'Histori Transaksi Ledger';
      case '/wallets':
        return 'Dompet & Anggaran Bulanan';
      case '/analytics':
        return 'Analisis & Laporan Keuangan';
      default:
        return 'Auroka';
    }
  };

  const sampleNotifications = [
    {
      id: 1,
      type: 'success',
      title: 'Pemasukan Dicatat',
      desc: 'Gaji Agustus Rp 25.000.000 berhasil ditambahkan ke BCA.',
      time: '10 menit yang lalu',
      icon: CheckCircle2,
      iconColor: 'text-[#006c49]',
      bgColor: 'bg-[#006c49]/10',
    },
    {
      id: 2,
      type: 'warning',
      title: 'Batas Anggaran Makanan',
      desc: 'Kategori Makan & Minum telah mencapai 85% dari batas bulanan.',
      time: '1 jam yang lalu',
      icon: AlertTriangle,
      iconColor: 'text-amber-600',
      bgColor: 'bg-amber-500/10',
    },
    {
      id: 3,
      type: 'info',
      title: 'Audit Ledger Selesai',
      desc: 'Semua 5 dompet berhasil disinkronkan tanpa penyimpangan saldo.',
      time: '3 jam yang lalu',
      icon: Info,
      iconColor: 'text-[#004ac6]',
      bgColor: 'bg-[#004ac6]/10',
    },
  ];

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-[#c3c6d7]/40 bg-white/90 px-4 sm:px-6 backdrop-blur-md shadow-sm">
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger Trigger (<1024px) */}
        <button
          onClick={onToggleMobileSidebar}
          className="lg:hidden p-2 rounded-xl text-[#0b1c30] hover:bg-[#eff4ff] transition-colors"
          aria-label="Buka Navigation Drawer"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Current Page Title & Status */}
        <div>
          <h1 className="text-base sm:text-lg font-extrabold text-[#0b1c30] tracking-tight">
            {getPageTitle(pathname)}
          </h1>
          <p className="text-[11px] text-[#434655] hidden sm:block">
            Sistem Manajemen Keuangan • Clean Architecture & Ledger System
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Search Bar */}
        <div className="relative hidden md:block w-48 lg:w-64">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#434655]" />
          <input
            type="text"
            placeholder="Cari transaksi, dompet..."
            className="w-full rounded-xl bg-[#f8f9ff] border border-[#c3c6d7]/60 pl-8 pr-3 py-1.5 text-xs text-[#0b1c30] placeholder-[#434655] focus:outline-none focus:border-[#004ac6] transition-colors"
          />
        </div>

        {/* Ledger Status Badge */}
        <div className="hidden xl:flex items-center gap-1.5 bg-[#006c49]/10 text-[#006c49] border border-[#006c49]/20 px-2.5 py-1 rounded-full text-xs font-semibold">
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>Ledger SUM Active</span>
        </div>

        {/* Notification Bell & Dropdown Popover */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            aria-label="Buka Notifikasi"
            className={`relative p-2 rounded-xl text-[#434655] transition-colors ${
              isNotifOpen ? 'bg-[#eff4ff] text-[#004ac6]' : 'hover:bg-[#eff4ff] hover:text-[#004ac6]'
            }`}
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#004ac6] ring-2 ring-white animate-pulse"></span>
          </button>

          {/* Notification Popover Dropdown Window */}
          {isNotifOpen && (
            <div className="absolute right-0 top-12 w-80 sm:w-96 rounded-2xl bg-white border border-[#e2e8f0] shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-[#f1f5f9] bg-[#f8fafc]">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-[#0f172a]">Notifikasi Keuangan</h3>
                  <span className="bg-[#004ac6]/10 text-[#004ac6] text-[10px] font-bold px-2 py-0.5 rounded-full">
                    3 Baru
                  </span>
                </div>
                <button
                  onClick={() => setIsNotifOpen(false)}
                  className="p-1 rounded-lg text-[#64748b] hover:bg-[#e2e8f0] transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Notification List */}
              <div className="divide-y divide-[#f1f5f9] max-h-80 overflow-y-auto">
                {sampleNotifications.map((notif) => (
                  <div
                    key={notif.id}
                    className="p-3.5 flex items-start gap-3 hover:bg-[#f8fafc] transition-colors cursor-pointer"
                  >
                    <div className={`p-2 rounded-xl ${notif.bgColor} ${notif.iconColor} shrink-0 mt-0.5`}>
                      <notif.icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-[#0f172a]">{notif.title}</h4>
                        <span className="text-[10px] text-[#94a3b8]">{notif.time}</span>
                      </div>
                      <p className="text-xs text-[#64748b] leading-relaxed">{notif.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer CTA Button to View All Notifications */}
              <div className="p-3 bg-[#f8fafc] border-t border-[#f1f5f9]">
                <a
                  href="/transactions"
                  onClick={() => setIsNotifOpen(false)}
                  className="w-full flex items-center justify-center gap-2 bg-white border border-[#e2e8f0] hover:border-[#004ac6] text-[#004ac6] hover:bg-[#eff4ff] py-2 rounded-xl text-xs font-bold transition-all shadow-sm group"
                >
                  <span>Lihat Semua Pusat Notifikasi</span>
                  <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Quick Add Transaction Button */}
        {onOpenAddModal && (
          <button
            onClick={onOpenAddModal}
            className="hidden sm:flex items-center gap-2 bg-[#004ac6] hover:bg-[#2563eb] text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm hover:shadow-md shadow-[#004ac6]/20"
          >
            <PlusCircle className="h-4 w-4" />
            <span className="hidden sm:inline">Catat Transaksi</span>
          </button>
        )}

        {/* User Profile Avatar */}
        <div className="flex items-center gap-2 pl-2 border-l border-[#c3c6d7]/40">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#004ac6] to-[#2563eb] text-white flex items-center justify-center font-bold text-xs shadow-sm">
            AU
          </div>
        </div>
      </div>
    </header>
  );
};
