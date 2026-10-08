'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { AuthUser, apiGetMe, logout } from '@/infrastructure/api/authApi';
import { Avatar } from '@/presentation/components/ui/Avatar';
import { useTranslation } from '@/presentation/i18n/I18nContext';
import { useNotifications } from '@/presentation/hooks/useNotifications';
import {
  Menu,
  Bell,
  Search,
  PlusCircle,
  CheckCircle2,
  AlertTriangle,
  Info,
  ArrowRight,
  X,
  User,
  Settings,
  LogOut,
  ChevronDown,
  Globe,
  CreditCard,
  PieChart,
  ShieldCheck,
} from 'lucide-react';

interface AppHeaderProps {
  onToggleMobileSidebar: () => void;
  onOpenAddModal?: () => void;
  onLogout?: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  onToggleMobileSidebar,
  onOpenAddModal,
  onLogout,
}) => {
  const { t, language, setLanguage } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const {
    notifications,
    unreadCount,
    markAsRead,
    refreshNotifications,
  } = useNotifications();

  const fetchProfile = async () => {
    try {
      const data = await apiGetMe();
      if (data) {
        setUser(data);
        localStorage.setItem('auroka_user', JSON.stringify(data));
      }
    } catch {
      // Fallback to localStorage if offline / token invalid
      const stored = localStorage.getItem('auroka_user');
      if (stored) {
        try {
          setUser(JSON.parse(stored));
        } catch {
          // ignore
        }
      }
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('auroka_user');
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (e) {
          console.error('Failed to parse user', e);
        }
      }
      fetchProfile();

      const handleProfileUpdated = () => {
        const freshUser = localStorage.getItem('auroka_user');
        if (freshUser) {
          try {
            setUser(JSON.parse(freshUser));
          } catch {
            // ignore
          }
        }
        fetchProfile();
      };

      window.addEventListener('auroka:profile-updated', handleProfileUpdated);
      window.addEventListener('storage', handleProfileUpdated);

      return () => {
        window.removeEventListener('auroka:profile-updated', handleProfileUpdated);
        window.removeEventListener('storage', handleProfileUpdated);
      };
    }
  }, []);

  // Close popovers when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
      title: 'Sinkronisasi Saldo Selesai',
      desc: 'Seluruh akun dompet berhasil disinkronkan tanpa kendala.',
      time: '3 jam yang lalu',
      icon: Info,
      iconColor: 'text-[#004ac6]',
      bgColor: 'bg-[#004ac6]/10',
    },
  ];

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[#c3c6d7]/30 bg-white/80 px-4 backdrop-blur-md sm:px-6 lg:px-8 transition-colors">
      {/* Left: Mobile Sidebar Trigger & Global Search */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <button
          onClick={onToggleMobileSidebar}
          aria-label="Buka Menu Navigasi"
          className="rounded-xl p-2 text-[#434655] hover:bg-[#eff4ff] hover:text-[#004ac6] lg:hidden transition-colors"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="relative w-full hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#737785]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('common.search')}
            aria-label="Cari transaksi atau data"
            className="w-full pl-9 pr-4 py-1.5 bg-[#f0f4fc]/60 border border-transparent focus:border-[#004ac6]/30 focus:bg-white text-xs text-[#161c24] placeholder-[#737785] rounded-xl outline-none transition-all duration-200"
          />
        </div>
      </div>

      {/* Right: Actions, Notifications & Profile Avatar */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Language Switcher */}
        <div className="flex items-center bg-[#f1f5f9] p-0.5 rounded-xl text-[11px] font-bold text-[#475569]">
          <button
            type="button"
            onClick={() => setLanguage('id')}
            className={`px-2 py-1 rounded-lg transition-all ${
              language === 'id' ? 'bg-white text-[#004ac6] shadow-xs' : 'hover:text-[#004ac6]'
            }`}
          >
            ID
          </button>
          <button
            type="button"
            onClick={() => setLanguage('en')}
            className={`px-2 py-1 rounded-lg transition-all ${
              language === 'en' ? 'bg-white text-[#004ac6] shadow-xs' : 'hover:text-[#004ac6]'
            }`}
          >
            EN
          </button>
          <button
            type="button"
            onClick={() => setLanguage('jv')}
            className={`px-2 py-1 rounded-lg transition-all ${
              language === 'jv' ? 'bg-white text-[#004ac6] shadow-xs' : 'hover:text-[#004ac6]'
            }`}
          >
            JV
          </button>
        </div>

        {/* Notifications Popover */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => {
              setIsNotifOpen(!isNotifOpen);
              setIsProfileOpen(false);
              if (!isNotifOpen) {
                refreshNotifications();
              }
            }}
            aria-label="Notifikasi"
            className={`relative p-2 rounded-xl text-[#434655] hover:bg-[#eff4ff] hover:text-[#004ac6] transition-colors ${
              isNotifOpen ? 'bg-[#eff4ff] text-[#004ac6]' : ''
            }`}
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#ba1a1a] text-white text-[10px] font-extrabold flex items-center justify-center ring-2 ring-white">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Window */}
          {isNotifOpen && (
            <>
              {/* Mobile Backdrop */}
              <div
                className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[1px] sm:hidden"
                onClick={() => setIsNotifOpen(false)}
              />

              <div className="fixed right-3 top-16 w-80 max-w-[calc(100vw-24px)] sm:absolute sm:right-0 sm:top-12 sm:w-96 rounded-2xl bg-white border border-[#e2e8f0] shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-[#f1f5f9] bg-gradient-to-br from-[#f8f9ff] to-[#eff4ff]">
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4 text-[#004ac6]" />
                    <h3 className="font-bold text-sm text-[#0b1c30]">Notifikasi</h3>
                    {unreadCount > 0 && (
                      <span className="px-1.5 py-0.5 text-[10px] font-bold bg-[#ba1a1a] text-white rounded-full">
                        {unreadCount} Baru
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => setIsNotifOpen(false)}
                    className="p-1 rounded-lg text-[#64748b] hover:bg-[#e2e8f0] transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Notification List */}
                <div className="divide-y divide-[#f1f5f9] max-h-[60vh] sm:max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center">
                      <Bell className="h-8 w-8 text-[#94a3b8] mx-auto mb-2 opacity-50" />
                      <p className="text-xs text-[#64748b]">Belum ada notifikasi baru</p>
                    </div>
                  ) : (
                    notifications.slice(0, 5).map((notif) => {
                      const getIconConfig = (cat: string) => {
                        switch (cat) {
                          case 'BILL':
                            return { icon: CreditCard, color: 'text-amber-600', bg: 'bg-amber-50' };
                          case 'BUDGET':
                            return { icon: PieChart, color: 'text-rose-600', bg: 'bg-rose-50' };
                          case 'SECURITY':
                            return { icon: ShieldCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' };
                          default:
                            return { icon: Info, color: 'text-[#004ac6]', bg: 'bg-[#eff4ff]' };
                        }
                      };
                      const iconCfg = getIconConfig(notif.category);
                      const IconComponent = iconCfg.icon;

                      return (
                        <Link
                          key={notif.id}
                          href={notif.action_url || '/notifications'}
                          onClick={() => {
                            if (!notif.is_read) markAsRead(notif.id);
                            setIsNotifOpen(false);
                          }}
                          className={`p-3.5 flex items-start gap-3 hover:bg-[#f8fafc] transition-colors cursor-pointer block relative ${
                            !notif.is_read ? 'bg-[#f0f4fc]/40' : ''
                          }`}
                        >
                          <div className={`p-2 rounded-xl shrink-0 ${iconCfg.bg}`}>
                            <IconComponent className={`h-4 w-4 ${iconCfg.color}`} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <p className={`text-xs truncate ${!notif.is_read ? 'font-bold text-[#0b1c30]' : 'font-medium text-[#475569]'}`}>
                                {notif.title}
                              </p>
                              {!notif.is_read && (
                                <span className="h-1.5 w-1.5 rounded-full bg-[#004ac6] shrink-0" />
                              )}
                            </div>
                            <p className="text-[11px] text-[#64748b] line-clamp-2 mt-0.5 leading-snug">
                              {notif.message}
                            </p>
                            <span className="text-[10px] text-[#94a3b8] mt-1 block">
                              {new Date(notif.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} • {new Date(notif.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                            </span>
                          </div>
                        </Link>
                      );
                    })
                  )}
                </div>

                {/* Footer link to all notifications */}
                <div className="p-3 bg-[#f8fafc] border-t border-[#f1f5f9]">
                  <Link
                    href="/notifications"
                    onClick={() => setIsNotifOpen(false)}
                    className="w-full flex items-center justify-center gap-2 bg-white border border-[#e2e8f0] hover:border-[#004ac6] text-[#004ac6] hover:bg-[#eff4ff] py-2 rounded-xl text-xs font-bold transition-all shadow-sm group"
                  >
                    <span>{t('header.viewAllNotifications')}</span>
                    <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Quick Add Transaction Button */}
        {onOpenAddModal && (
          <button
            onClick={onOpenAddModal}
            className="hidden sm:flex items-center gap-2 bg-[#004ac6] hover:bg-[#2563eb] text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm hover:shadow-md shadow-[#004ac6]/20"
          >
            <PlusCircle className="h-4 w-4" />
            <span className="hidden sm:inline">{t('header.recordTransaction')}</span>
          </button>
        )}

        {/* User Profile Avatar with Popover Mini Window */}
        <div className="relative pl-2 border-l border-[#c3c6d7]/40" ref={profileRef}>
          <button
            onClick={() => {
              setIsProfileOpen(!isProfileOpen);
              setIsNotifOpen(false);
            }}
            aria-label="Buka Menu Profil"
            className="flex items-center gap-2 p-1 rounded-xl hover:bg-[#eff4ff] transition-all group"
          >
            <Avatar
              src={user?.avatarUrl}
              name={user?.name || 'Auroka User'}
              size="sm"
              className="ring-2 ring-transparent group-hover:ring-[#004ac6]/20 shadow-xs"
            />
            <ChevronDown
              className={`hidden md:block h-3.5 w-3.5 text-[#64748b] transition-transform duration-200 ${
                isProfileOpen ? 'rotate-180 text-[#004ac6]' : 'group-hover:text-[#004ac6]'
              }`}
            />
          </button>

          {/* Profile Mini Window Popover */}
          {isProfileOpen && (
            <>
              {/* Mobile Backdrop */}
              <div
                className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[1px] sm:hidden"
                onClick={() => setIsProfileOpen(false)}
              />

              <div className="fixed right-3 top-16 w-64 max-w-[calc(100vw-24px)] sm:absolute sm:right-0 sm:top-12 sm:w-64 rounded-2xl bg-white border border-[#e2e8f0] shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                {/* User Info Header */}
                <div className="p-4 border-b border-[#f1f5f9] bg-gradient-to-br from-[#f8f9ff] to-[#eff4ff]">
                  <div className="flex items-center gap-3">
                    <Avatar
                      src={user?.avatarUrl}
                      name={user?.name || 'Auroka User'}
                      size="md"
                      className="shadow-md"
                    />
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-sm text-[#0b1c30] truncate">{user ? user.name : 'Pengguna Auroka'}</h3>
                      <p className="text-[11px] text-[#64748b] truncate">{user ? user.email : 'user@auroka.id'}</p>
                    </div>
                  </div>
                </div>

                {/* Menu Links */}
                <div className="p-2 space-y-1">
                  <Link
                    href="/profile"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#475569] hover:text-[#004ac6] hover:bg-[#eff4ff] transition-all"
                  >
                    <User className="h-4 w-4 text-[#64748b]" />
                    <span>{t('header.myProfile')}</span>
                  </Link>

                  <Link
                    href="/settings"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#475569] hover:text-[#004ac6] hover:bg-[#eff4ff] transition-all"
                  >
                    <Settings className="h-4 w-4 text-[#64748b]" />
                    <span>{t('header.settings')}</span>
                  </Link>
                </div>

                {/* Logout Option */}
                <div className="p-2 border-t border-[#f1f5f9] bg-[#f8fafc]/60">
                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileOpen(false);
                      if (onLogout) {
                        onLogout();
                      } else {
                        logout();
                      }
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-[#ef4444] hover:bg-[#fef2f2] transition-all"
                  >
                    <LogOut className="h-4 w-4 text-[#ef4444]" />
                    <span>{t('header.logout')}</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
