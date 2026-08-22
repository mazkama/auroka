'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import {
  Menu,
  Bell,
  Search,
  PlusCircle,
  ShieldCheck,
  User,
  Coins,
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

        {/* Notification Bell */}
        <button className="relative p-2 rounded-xl text-[#434655] hover:bg-[#eff4ff] hover:text-[#004ac6] transition-colors">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#004ac6]"></span>
        </button>

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
