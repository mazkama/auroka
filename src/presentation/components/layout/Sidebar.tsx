'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Receipt,
  Wallet,
  BarChart3,
  PieChart,
  Sparkles,
  BookOpen,
  X,
  Coins,
  ChevronRight,
  ShieldCheck,
  LogOut,
  User,
  Plus,
} from 'lucide-react';

interface SidebarProps {
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
  onOpenAddModal?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpenMobile = false,
  onCloseMobile,
  onOpenAddModal,
}) => {
  const pathname = usePathname();

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Histori Transaksi', href: '/transactions', icon: Receipt },
    { name: 'Dompet Digital', href: '/wallets', icon: Wallet },
    { name: 'Anggaran Bulanan', href: '/budgets', icon: PieChart },
    { name: 'Analisis & Laporan', href: '/analytics', icon: BarChart3 },
  ];

  const renderNavLinks = () => (
    <nav className="space-y-1.5 flex-1">
      <div className="px-3 pt-2 pb-1">
        <p className="text-[11px] font-bold uppercase tracking-wider text-[#434655]">
          Menu Utama
        </p>
      </div>

      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onCloseMobile}
            className={`flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-bold transition-all ${
              isActive
                ? 'bg-[#004ac6] text-white shadow-md shadow-[#004ac6]/20'
                : 'text-[#434655] hover:bg-[#e5eeff]/80 hover:text-[#004ac6]'
            }`}
          >
            <div className="flex items-center gap-3">
              <item.icon className={`h-4 w-4 ${isActive ? 'text-white' : ''}`} />
              <span>{item.name}</span>
            </div>
            <ChevronRight
              className={`h-3.5 w-3.5 ${
                isActive ? 'text-white/80' : 'text-[#c3c6d7]'
              }`}
            />
          </Link>
        );
      })}
    </nav>
  );

  const renderFooterCards = () => (
    <div className="pt-4 border-t border-[#c3c6d7]/40 space-y-3">
      {/* Brand Story Card */}
      <div className="rounded-2xl bg-gradient-to-br from-[#dce9ff] to-[#eff4ff] p-3.5 border border-[#c3c6d7]/50 space-y-1.5">
        <div className="flex items-center gap-2 text-xs font-bold text-[#004ac6]">
          <Sparkles className="h-4 w-4 text-[#004ac6]" />
          <span>Filosofi Auroka</span>
        </div>
        <p className="text-[11px] leading-relaxed text-[#434655] italic">
          &quot;Auroka (Aurum / Emas): Membantu Anda memahami uang & bertumbuh menuju kemakmuran.&quot;
        </p>
      </div>

      {/* Ledger Info Card */}
      <div className="rounded-xl bg-[#f8f9ff] p-3 border border-[#c3c6d7]/50 space-y-1 shadow-sm">
        <div className="flex items-center gap-1.5 text-xs font-bold text-[#0b1c30]">
          <ShieldCheck className="h-3.5 w-3.5 text-[#006c49]" />
          <span>The Ledger System</span>
        </div>
        <p className="text-[10px] text-[#434655] leading-relaxed">
          Saldo dihitung dari kalkulasi Debit & Kredit otomatis.
        </p>
      </div>

      {/* User Profile Card & Login/Logout Link */}
      <div className="pt-2 flex items-center justify-between p-2 rounded-xl bg-[#eff4ff] border border-[#c3c6d7]/40">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#004ac6] text-white flex items-center justify-center font-bold text-xs">
            AU
          </div>
          <div>
            <p className="text-xs font-bold text-[#0b1c30]">Demo User</p>
            <p className="text-[10px] text-[#434655]">user@auroka.id</p>
          </div>
        </div>
        <Link
          href="/login"
          title="Keluar / Switch User"
          className="p-1.5 rounded-lg text-[#434655] hover:text-[#ba1a1a] hover:bg-rose-50"
        >
          <LogOut className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );

  return (
    <>
      {/* 1. Desktop Permanent Sidebar (≥1024px / lg) */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 h-full border-r border-[#c3c6d7]/40 bg-white p-4 overflow-y-auto shadow-sm">
        <div className="flex flex-col h-full justify-between min-h-full">
          <div className="space-y-4">
            <div className="flex items-center gap-2.5 px-3 py-2 border-b border-[#c3c6d7]/40 pb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-[#004ac6] to-[#2563eb] text-white shadow-md">
                <Coins className="h-4 w-4" />
              </div>
              <div>
                <span className="font-extrabold text-base text-[#004ac6]">
                  Auroka Pro
                </span>
                <p className="text-[10px] text-[#434655]">Enterprise Finance</p>
              </div>
            </div>
            {renderNavLinks()}
          </div>
          {renderFooterCards()}
        </div>
      </aside>

      {/* 2. Mobile Drawer Overlay (<1024px / lg) */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop Blur */}
          <div
            className="fixed inset-0 bg-[#0b1c30]/50 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobile}
            aria-hidden="true"
          />

          {/* Drawer Content */}
          <aside className="fixed inset-y-0 left-0 w-72 max-w-[80vw] bg-white p-4 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between px-2 pt-2 border-b border-[#c3c6d7]/40 pb-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#004ac6] text-white shadow-sm">
                    <Coins className="h-4 w-4" />
                  </div>
                  <span className="font-extrabold text-base text-[#004ac6]">
                    Auroka
                  </span>
                </div>
                <button
                  onClick={onCloseMobile}
                  className="p-1.5 rounded-lg text-[#434655] hover:bg-[#eff4ff]"
                  aria-label="Tutup Menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {renderNavLinks()}
            </div>

            {renderFooterCards()}
          </aside>
        </div>
      )}

      {/* 3. Mobile Bottom Navigation Bar (<1024px / lg) - 5 Items with Center Floating Action Button */}
      <nav
        aria-label="Mobile Bottom Navigation"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#e2e8f0] px-2 py-1 flex items-center justify-between shadow-lg shadow-black/5"
      >
        {/* Item 1: Dashboard */}
        <Link
          href="/dashboard"
          className={`flex flex-col items-center justify-center gap-0.5 flex-1 py-1 text-[10px] font-medium transition-all ${
            pathname === '/dashboard'
              ? 'text-[#004ac6] font-bold'
              : 'text-[#64748b] hover:text-[#004ac6]'
          }`}
        >
          <LayoutDashboard
            className={`h-5 w-5 transition-transform ${
              pathname === '/dashboard' ? 'text-[#004ac6] scale-110' : 'text-[#64748b]'
            }`}
          />
          <span>Dashboard</span>
        </Link>

        {/* Item 2: Transaksi */}
        <Link
          href="/transactions"
          className={`flex flex-col items-center justify-center gap-0.5 flex-1 py-1 text-[10px] font-medium transition-all ${
            pathname === '/transactions'
              ? 'text-[#004ac6] font-bold'
              : 'text-[#64748b] hover:text-[#004ac6]'
          }`}
        >
          <Receipt
            className={`h-5 w-5 transition-transform ${
              pathname === '/transactions' ? 'text-[#004ac6] scale-110' : 'text-[#64748b]'
            }`}
          />
          <span>Transaksi</span>
        </Link>

        {/* Item 3 (CENTER FAB): Floating Action Button */}
        <div className="flex-1 flex items-center justify-center relative -translate-y-5">
          <button
            onClick={onOpenAddModal}
            aria-label="Tambah Transaksi Baru"
            className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#004ac6] via-[#2563eb] to-[#3b82f6] text-white shadow-xl shadow-[#004ac6]/30 border-4 border-white flex items-center justify-center active:scale-90 transition-transform"
          >
            <Plus className="h-6 w-6 stroke-[2.5]" />
          </button>
        </div>

        {/* Item 4: Dompet */}
        <Link
          href="/wallets"
          className={`flex flex-col items-center justify-center gap-0.5 flex-1 py-1 text-[10px] font-medium transition-all ${
            pathname === '/wallets'
              ? 'text-[#004ac6] font-bold'
              : 'text-[#64748b] hover:text-[#004ac6]'
          }`}
        >
          <Wallet
            className={`h-5 w-5 transition-transform ${
              pathname === '/wallets' ? 'text-[#004ac6] scale-110' : 'text-[#64748b]'
            }`}
          />
          <span>Dompet</span>
        </Link>

        {/* Item 5: Analisis */}
        <Link
          href="/analytics"
          className={`flex flex-col items-center justify-center gap-0.5 flex-1 py-1 text-[10px] font-medium transition-all ${
            pathname === '/analytics'
              ? 'text-[#004ac6] font-bold'
              : 'text-[#64748b] hover:text-[#004ac6]'
          }`}
        >
          <BarChart3
            className={`h-5 w-5 transition-transform ${
              pathname === '/analytics' ? 'text-[#004ac6] scale-110' : 'text-[#64748b]'
            }`}
          />
          <span>Analisis</span>
        </Link>
      </nav>
    </>
  );
};
