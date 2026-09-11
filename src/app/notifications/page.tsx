'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AppLayout } from '@/presentation/components/layout/AppLayout';
import { useFinance } from '@/presentation/hooks/useFinance';
import { AddTransactionModal } from '@/presentation/components/features/AddTransactionModal';
import { ConfirmModal } from '@/presentation/components/ui/ConfirmModal';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Info,
  ShieldAlert,
  ArrowRight,
  CheckCheck,
  Trash2,
  Search,
  Filter,
  Receipt,
  Wallet,
  PieChart,
  Calendar,
  Sparkles,
  Inbox,
  Clock,
  ExternalLink,
} from 'lucide-react';

export interface NotificationItem {
  id: string;
  category: 'transaction' | 'budget' | 'system' | 'security';
  type: 'success' | 'warning' | 'info' | 'danger';
  title: string;
  desc: string;
  time: string;
  timestamp: string; // e.g. 'Hari Ini', 'Kemarin', 'Minggu Lalu'
  isRead: boolean;
  actionUrl?: string;
  actionLabel?: string;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    category: 'transaction',
    type: 'success',
    title: 'Pemasukan Gaji Masuk',
    desc: 'Transfer gaji bulanan sebesar Rp 25.000.000 berhasil dicatat dan masuk ke rekening Bank BCA.',
    time: '10 menit yang lalu',
    timestamp: 'Hari Ini',
    isRead: false,
    actionUrl: '/transactions',
    actionLabel: 'Buka Transaksi',
  },
  {
    id: 'notif-2',
    category: 'budget',
    type: 'warning',
    title: 'Peringatan Limit Anggaran Makan & Minum',
    desc: 'Pengeluaran kategori Makan & Minum telah mencapai 85% dari batas Rp 3.500.000 bulan ini.',
    time: '1 jam yang lalu',
    timestamp: 'Hari Ini',
    isRead: false,
    actionUrl: '/wallets#anggaran-bulanan',
    actionLabel: 'Kelola Anggaran',
  },
  {
    id: 'notif-3',
    category: 'system',
    type: 'info',
    title: 'Audit Rekonsiliasi Ledger Selesai',
    desc: 'Sistem Double-Entry Ledger telah memverifikasi seluruh 5 dompet aktif. Saldo terverifikasi akurat 100%.',
    time: '3 jam yang lalu',
    timestamp: 'Hari Ini',
    isRead: false,
    actionUrl: '/wallets',
    actionLabel: 'Lihat Dompet',
  },
  {
    id: 'notif-4',
    category: 'budget',
    type: 'danger',
    title: 'Anggaran Hiburan Kritis',
    desc: 'Kategori Hiburan & Liburan telah menyentuh 96% dari batas limit bulanan Rp 1.500.000.',
    time: 'Kemarin, 19:45',
    timestamp: 'Kemarin',
    isRead: true,
    actionUrl: '/wallets#anggaran-bulanan',
    actionLabel: 'Atur Limit',
  },
  {
    id: 'notif-5',
    category: 'transaction',
    type: 'success',
    title: 'Investasi Dividen Diterima',
    desc: 'Penerimaan dividen saham sebesar Rp 1.250.000 berhasil disinkronisasi ke Akun Bibit / Reksadana.',
    time: 'Kemarin, 11:20',
    timestamp: 'Kemarin',
    isRead: true,
    actionUrl: '/transactions',
    actionLabel: 'Rincian Transaksi',
  },
  {
    id: 'notif-6',
    category: 'security',
    type: 'info',
    title: 'Sesi Login Baru Terdeteksi',
    desc: 'Perangkat Desktop Windows masuk melalui autentikasi aman Google OAuth.',
    time: '2 hari yang lalu',
    timestamp: 'Minggu Ini',
    isRead: true,
    actionUrl: '/profile',
    actionLabel: 'Cek Keamanan',
  },
  {
    id: 'notif-7',
    category: 'system',
    type: 'info',
    title: 'Laporan Keuangan Mingguan Siap',
    desc: 'Ringkasan Cash Flow & Analisis Pengeluaran pekan ini sudah dapat Anda tinjau di modul Analisis.',
    time: '4 hari yang lalu',
    timestamp: 'Minggu Ini',
    isRead: true,
    actionUrl: '/analytics',
    actionLabel: 'Buka Analisis',
  },
];

export default function NotificationsPage() {
  const { wallets, addTransaction } = useFinance();
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [filterReadStatus, setFilterReadStatus] = useState<'all' | 'unread' | 'read'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [confirmClearOpen, setConfirmClearOpen] = useState<boolean>(false);

  // Mark single notif as read/unread
  const toggleRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: !n.isRead } : n))
    );
  };

  // Mark all as read
  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  // Delete single notif
  const deleteNotif = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // Clear all read notifications
  const clearReadNotifications = () => {
    setNotifications((prev) => prev.filter((n) => !n.isRead));
    setConfirmClearOpen(false);
  };

  // Filtered notifications
  const filteredNotifications = notifications.filter((notif) => {
    // Category filter
    if (selectedCategory !== 'all' && notif.category !== selectedCategory) {
      return false;
    }
    // Read status filter
    if (filterReadStatus === 'unread' && notif.isRead) return false;
    if (filterReadStatus === 'read' && !notif.isRead) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        notif.title.toLowerCase().includes(q) ||
        notif.desc.toLowerCase().includes(q) ||
        notif.time.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Group by timestamp
  const timeGroups = Array.from(
    new Set(filteredNotifications.map((n) => n.timestamp))
  );

  const getIcon = (type: NotificationItem['type'], category: NotificationItem['category']) => {
    if (type === 'warning') {
      return <AlertTriangle className="h-4 w-4 text-amber-600" />;
    }
    if (type === 'danger') {
      return <ShieldAlert className="h-4 w-4 text-rose-600" />;
    }
    if (type === 'success') {
      return <CheckCircle2 className="h-4 w-4 text-[#006c49]" />;
    }
    if (category === 'budget') {
      return <PieChart className="h-4 w-4 text-[#004ac6]" />;
    }
    return <Info className="h-4 w-4 text-[#004ac6]" />;
  };

  const getBgColor = (type: NotificationItem['type']) => {
    switch (type) {
      case 'warning':
        return 'bg-amber-500/10 border-amber-200';
      case 'danger':
        return 'bg-rose-500/10 border-rose-200';
      case 'success':
        return 'bg-[#006c49]/10 border-emerald-200';
      default:
        return 'bg-[#004ac6]/10 border-[#004ac6]/20';
    }
  };

  return (
    <AppLayout onOpenAddModal={() => setIsAddModalOpen(true)}>
      <div className="space-y-6">
        {/* Top Header Controls Banner */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white border border-[#e2e8f0] rounded-2xl p-5 shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-[#eff4ff] text-[#004ac6]">
                <Bell className="h-5 w-5" />
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-[#0b1c30] tracking-tight">
                Pusat Riwayat Notifikasi
              </h1>
              {unreadCount > 0 ? (
                <span className="text-[10px] font-bold uppercase tracking-wider bg-[#004ac6] text-white px-2.5 py-0.5 rounded-full shadow-xs">
                  {unreadCount} Belum Dibaca
                </span>
              ) : (
                <span className="text-[10px] font-bold uppercase tracking-wider bg-[#006c49]/10 text-[#006c49] border border-[#006c49]/20 px-2.5 py-0.5 rounded-full">
                  Semua Terbaca
                </span>
              )}
            </div>
            <p className="text-xs text-[#434655] mt-1">
              Pantau seluruh peringatan limit anggaran, transaksi terkini, audit rekonsiliasi saldo, dan pembaruan sistem.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center gap-1.5 bg-[#eff4ff] hover:bg-[#dce9ff] text-[#004ac6] border border-[#004ac6]/20 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-2xs"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                <span>Tandai Semua Dibaca</span>
              </button>
            )}

            {notifications.some((n) => n.isRead) && (
              <button
                onClick={() => setConfirmClearOpen(true)}
                className="flex items-center gap-1.5 bg-[#f8fafc] hover:bg-rose-50 text-[#64748b] hover:text-[#ba1a1a] border border-[#e2e8f0] hover:border-rose-200 px-3.5 py-2 rounded-xl text-xs font-bold transition-all"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Bersihkan Terbaca</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white border border-[#e2e8f0] rounded-2xl p-4 shadow-sm space-y-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Category Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
              {[
                { id: 'all', label: 'Semua', count: notifications.length },
                {
                  id: 'unread',
                  label: 'Belum Dibaca',
                  count: unreadCount,
                  isStatusFilter: true,
                },
                {
                  id: 'budget',
                  label: 'Peringatan Anggaran',
                  count: notifications.filter((n) => n.category === 'budget').length,
                },
                {
                  id: 'transaction',
                  label: 'Transaksi',
                  count: notifications.filter((n) => n.category === 'transaction').length,
                },
                {
                  id: 'system',
                  label: 'Sistem & Audit',
                  count: notifications.filter((n) => n.category === 'system' || n.category === 'security').length,
                },
              ].map((tab) => {
                const isActive = tab.isStatusFilter
                  ? filterReadStatus === 'unread'
                  : selectedCategory === tab.id && filterReadStatus === 'all';

                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      if (tab.isStatusFilter) {
                        setFilterReadStatus('unread');
                        setSelectedCategory('all');
                      } else {
                        setFilterReadStatus('all');
                        setSelectedCategory(tab.id);
                      }
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                      isActive
                        ? 'bg-[#004ac6] text-white shadow-sm shadow-[#004ac6]/20'
                        : 'bg-[#f8fafc] text-[#64748b] hover:bg-[#eff4ff] hover:text-[#004ac6] border border-[#e2e8f0]'
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        isActive ? 'bg-white/20 text-white' : 'bg-[#e2e8f0] text-[#475569]'
                      }`}
                    >
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Notification Search Input */}
            <div className="relative w-full md:w-64">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari notifikasi..."
                className="w-full rounded-xl bg-[#f8f9ff] border border-[#c3c6d7]/60 pl-8 pr-3 py-1.5 text-xs text-[#0b1c30] placeholder-[#64748b] focus:outline-none focus:border-[#004ac6] focus:bg-white focus:ring-2 focus:ring-[#004ac6]/10 transition-all"
              />
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#64748b]" />
            </div>
          </div>
        </div>

        {/* Notifications Timeline List */}
        <div className="space-y-6">
          {filteredNotifications.length === 0 ? (
            <div className="bg-white border border-[#e2e8f0] rounded-2xl p-12 text-center shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#eff4ff] text-[#004ac6] flex items-center justify-center mx-auto">
                <Inbox className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-sm text-[#0f172a]">Tidak Ada Notifikasi</h3>
              <p className="text-xs text-[#64748b] max-w-sm mx-auto">
                {searchQuery || selectedCategory !== 'all' || filterReadStatus !== 'all'
                  ? 'Tidak ada notifikasi yang sesuai dengan filter atau kata kunci pencarian Anda.'
                  : 'Semua notifikasi dan pengingat keuangan Anda sudah bersih dan diperbarui.'}
              </p>
              {(searchQuery || selectedCategory !== 'all' || filterReadStatus !== 'all') && (
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setFilterReadStatus('all');
                    setSearchQuery('');
                  }}
                  className="mt-2 text-xs font-bold text-[#004ac6] hover:underline"
                >
                  Reset Filter & Pencarian
                </button>
              )}
            </div>
          ) : (
            timeGroups.map((group) => {
              const groupItems = filteredNotifications.filter((n) => n.timestamp === group);
              if (groupItems.length === 0) return null;

              return (
                <div key={group} className="space-y-3">
                  <div className="flex items-center gap-2 px-1">
                    <Clock className="h-3.5 w-3.5 text-[#64748b]" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#64748b]">
                      {group}
                    </h3>
                    <span className="text-[10px] text-[#94a3b8]">({groupItems.length})</span>
                  </div>

                  <div className="bg-white border border-[#e2e8f0] rounded-2xl divide-y divide-[#f1f5f9] overflow-hidden shadow-sm">
                    {groupItems.map((notif) => (
                      <div
                        key={notif.id}
                        className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4 transition-all group ${
                          !notif.isRead
                            ? 'bg-gradient-to-r from-[#eff4ff]/60 to-white hover:from-[#eff4ff]/90'
                            : 'hover:bg-[#f8fafc]'
                        }`}
                      >
                        {/* Left: Icon & Content */}
                        <div className="flex items-start gap-3.5 min-w-0 flex-1">
                          <div
                            className={`p-2.5 rounded-xl border shrink-0 mt-0.5 ${getBgColor(
                              notif.type
                            )}`}
                          >
                            {getIcon(notif.type, notif.category)}
                          </div>

                          <div className="space-y-1 flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h4
                                className={`text-xs sm:text-sm font-bold ${
                                  !notif.isRead ? 'text-[#004ac6]' : 'text-[#0f172a]'
                                }`}
                              >
                                {notif.title}
                              </h4>
                              {!notif.isRead && (
                                <span className="inline-flex items-center px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-[#004ac6] text-white">
                                  Baru
                                </span>
                              )}
                              <span className="text-[11px] text-[#94a3b8] ml-auto sm:ml-0">
                                {notif.time}
                              </span>
                            </div>

                            <p className="text-xs text-[#475569] leading-relaxed pr-2">
                              {notif.desc}
                            </p>

                            {/* Action Link Pill */}
                            {notif.actionUrl && (
                              <div className="pt-2">
                                <Link
                                  href={notif.actionUrl}
                                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#004ac6] hover:text-[#2563eb] bg-[#eff4ff] hover:bg-[#dce9ff] border border-[#004ac6]/20 px-3 py-1 rounded-xl transition-all shadow-2xs"
                                >
                                  <span>{notif.actionLabel || 'Lihat Rincian'}</span>
                                  <ArrowRight className="h-3 w-3" />
                                </Link>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Right: Item Controls */}
                        <div className="flex items-center gap-1 self-end sm:self-start shrink-0 pt-1 sm:pt-0">
                          <button
                            onClick={() => toggleRead(notif.id)}
                            title={notif.isRead ? 'Tandai belum dibaca' : 'Tandai sudah dibaca'}
                            className="p-1.5 rounded-xl text-[#64748b] hover:text-[#004ac6] hover:bg-[#eff4ff] transition-all text-xs flex items-center gap-1"
                          >
                            <CheckCheck className={`h-4 w-4 ${notif.isRead ? 'text-[#94a3b8]' : 'text-[#004ac6]'}`} />
                            <span className="sm:hidden text-[10px] font-semibold">
                              {notif.isRead ? 'Belum Dibaca' : 'Sudah Dibaca'}
                            </span>
                          </button>

                          <button
                            onClick={() => deleteNotif(notif.id)}
                            title="Hapus Notifikasi"
                            className="p-1.5 rounded-xl text-[#64748b] hover:text-[#ba1a1a] hover:bg-rose-50 transition-all text-xs flex items-center gap-1"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sm:hidden text-[10px] font-semibold">Hapus</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Transaction Modal */}
      <AddTransactionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        wallets={wallets}
        onAddTransaction={addTransaction}
      />

      {/* Confirm Clear Read Notifications */}
      <ConfirmModal
        isOpen={confirmClearOpen}
        onClose={() => setConfirmClearOpen(false)}
        onConfirm={clearReadNotifications}
        title="Bersihkan Notifikasi Terbaca?"
        description="Semua riwayat notifikasi yang telah ditandai sebagai dibaca akan dihapus dari daftar riwayat."
        confirmText="Bersihkan Riwayat"
        cancelText="Batal"
      />
    </AppLayout>
  );
}
