'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AppLayout } from '@/presentation/components/layout/AppLayout';
import { useFinance } from '@/presentation/hooks/useFinance';
import { useNotifications } from '@/presentation/hooks/useNotifications';
import { AddTransactionModal } from '@/presentation/components/features/AddTransactionModal';
import { ConfirmModal } from '@/presentation/components/ui';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Info,
  ShieldCheck,
  CreditCard,
  PieChart,
  ArrowRight,
  CheckCheck,
  Trash2,
  Search,
  Inbox,
  RefreshCw,
} from 'lucide-react';

export default function NotificationsPage() {
  const { wallets, addTransaction, transferFunds } = useFinance();
  const {
    notifications,
    unreadCount,
    loading,
    refreshNotifications,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearReadNotifications,
  } = useNotifications();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [filterReadStatus, setFilterReadStatus] = useState<'all' | 'unread' | 'read'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [confirmClearOpen, setConfirmClearOpen] = useState<boolean>(false);

  // Filter & Search Logic
  const filteredNotifications = notifications.filter((notif) => {
    const matchCat = selectedCategory === 'ALL' || notif.category === selectedCategory;
    const matchRead =
      filterReadStatus === 'all' ||
      (filterReadStatus === 'unread' && !notif.is_read) ||
      (filterReadStatus === 'read' && notif.is_read);
    const matchSearch =
      notif.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notif.message.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchRead && matchSearch;
  });

  const getCategoryConfig = (cat: string) => {
    switch (cat) {
      case 'BILL':
        return { icon: CreditCard, color: 'text-amber-600', bg: 'bg-amber-50', badge: 'Tagihan' };
      case 'BUDGET':
        return { icon: PieChart, color: 'text-rose-600', bg: 'bg-rose-50', badge: 'Anggaran' };
      case 'SECURITY':
        return { icon: ShieldCheck, color: 'text-emerald-600', bg: 'bg-emerald-50', badge: 'Keamanan' };
      case 'WALLET':
        return { icon: CreditCard, color: 'text-blue-600', bg: 'bg-blue-50', badge: 'Dompet' };
      default:
        return { icon: Info, color: 'text-[#004ac6]', bg: 'bg-[#eff4ff]', badge: 'Sistem' };
    }
  };

  return (
    <AppLayout onOpenAddModal={() => setIsAddModalOpen(true)}>
      <div className="space-y-6">
        {/* Header Notification Banner */}
        <div className="bg-white border border-[#e2e8f0] rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-[#004ac6]/10 text-[#004ac6] rounded-xl">
                <Bell className="h-5 w-5" />
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-[#0b1c30] tracking-tight">
                Pemberitahuan & Peringatan
              </h1>
              {unreadCount > 0 && (
                <span className="bg-rose-500 text-white text-xs font-extrabold px-2.5 py-0.5 rounded-full">
                  {unreadCount} Baru
                </span>
              )}
            </div>
            <p className="text-xs text-[#434655] mt-1">
              Pusat notifikasi resmi aktivitas keuangan, jatuh tempo tagihan, batas anggaran, dan integrasi WhatsApp.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => refreshNotifications()}
              className="p-2 bg-[#f8fafc] hover:bg-[#f1f5f9] text-[#64748b] rounded-xl border border-[#e2e8f0] transition-colors"
              title="Segarkan Notifikasi"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            {unreadCount > 0 && (
              <button
                onClick={() => markAllAsRead()}
                className="flex items-center gap-1.5 bg-[#eff4ff] hover:bg-[#dce9ff] text-[#004ac6] px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                <CheckCheck className="h-4 w-4" />
                <span>Tandai Semua Dibaca</span>
              </button>
            )}
            {notifications.some(n => n.is_read) && (
              <button
                onClick={() => setConfirmClearOpen(true)}
                className="flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                <Trash2 className="h-4 w-4" />
                <span>Bersihkan Terbaca</span>
              </button>
            )}
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="bg-white border border-[#e2e8f0] rounded-2xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-1">
            {[
              { key: 'ALL', label: 'Semua Notifikasi' },
              { key: 'BILL', label: 'Tagihan' },
              { key: 'BUDGET', label: 'Anggaran' },
              { key: 'SECURITY', label: 'Keamanan' },
              { key: 'SYSTEM', label: 'Sistem' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setSelectedCategory(tab.key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedCategory === tab.key
                    ? 'bg-[#004ac6] text-white shadow-xs'
                    : 'text-[#64748b] hover:bg-[#f1f5f9] hover:text-[#0b1c30]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Box & Read Status Filter */}
          <div className="flex items-center gap-2">
            <select
              value={filterReadStatus}
              onChange={(e) => setFilterReadStatus(e.target.value as any)}
              className="text-xs bg-[#f8fafc] border border-[#e2e8f0] rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-[#004ac6] text-[#475569] font-medium"
            >
              <option value="all">Semua Status</option>
              <option value="unread">Belum Dibaca</option>
              <option value="read">Sudah Dibaca</option>
            </select>
            <div className="relative min-w-[200px]">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#94a3b8]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari notifikasi..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#f8fafc] border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-[#004ac6] transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {filteredNotifications.length === 0 ? (
            <div className="bg-white border border-[#e2e8f0] rounded-2xl p-12 text-center space-y-3 shadow-sm">
              <div className="inline-flex p-4 bg-[#f1f5f9] rounded-2xl text-[#94a3b8]">
                <Inbox className="h-8 w-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-[#0f172a]">Tidak Ada Pemberitahuan</h3>
                <p className="text-xs text-[#64748b]">
                  {searchQuery || selectedCategory !== 'ALL'
                    ? 'Tidak ditemukan notifikasi yang cocok dengan filter pencarian Anda.'
                    : 'Belum ada notifikasi baru untuk akun Anda saat ini.'}
                </p>
              </div>
            </div>
          ) : (
            filteredNotifications.map((n) => {
              const cfg = getCategoryConfig(n.category);
              const IconComp = cfg.icon;

              return (
                <div
                  key={n.id}
                  className={`bg-white border rounded-2xl p-4 shadow-sm transition-all flex items-start justify-between gap-4 ${
                    !n.is_read ? 'border-[#004ac6]/30 bg-[#f8faff]' : 'border-[#e2e8f0]'
                  }`}
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className={`p-2.5 rounded-xl mt-0.5 shrink-0 ${cfg.bg} ${cfg.color}`}>
                      <IconComp className="h-4 w-4" />
                    </div>
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${cfg.bg} ${cfg.color}`}>
                          {cfg.badge}
                        </span>
                        <h4 className={`text-xs sm:text-sm font-bold truncate ${!n.is_read ? 'text-[#0f172a]' : 'text-[#475569]'}`}>
                          {n.title}
                        </h4>
                        {!n.is_read && (
                          <span className="w-2 h-2 rounded-full bg-[#004ac6] shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-[#475569] leading-relaxed break-words">{n.message}</p>
                      <div className="flex items-center gap-3 pt-1 text-[11px] text-[#94a3b8] flex-wrap">
                        <span>
                          {new Date(n.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} • {new Date(n.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                        {n.action_url && (
                          <Link
                            href={n.action_url}
                            onClick={() => {
                              if (!n.is_read) markAsRead(n.id);
                            }}
                            className="font-bold text-[#004ac6] hover:underline inline-flex items-center gap-1"
                          >
                            <span>{n.action_text || 'Lihat Detail'}</span>
                            <ArrowRight className="h-3 w-3" />
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {!n.is_read && (
                      <button
                        onClick={() => markAsRead(n.id)}
                        title="Tandai Sudah Dibaca"
                        className="p-2 text-[#94a3b8] hover:text-[#004ac6] hover:bg-[#eff4ff] rounded-xl transition-colors cursor-pointer"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => removeNotification(n.id)}
                      title="Hapus Pemberitahuan"
                      className="p-2 text-[#94a3b8] hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Clear Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmClearOpen}
        onClose={() => setConfirmClearOpen(false)}
        onConfirm={() => {
          clearReadNotifications();
          setConfirmClearOpen(false);
        }}
        title="Bersihkan Notifikasi Terbaca?"
        description="Semua pemberitahuan yang telah ditandai dibaca akan dihapus dari histori."
        confirmText="Ya, Bersihkan"
        cancelText="Batal"
      />

      <AddTransactionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        wallets={wallets}
        onAddTransaction={addTransaction}
        onTransferFunds={transferFunds}
      />
    </AppLayout>
  );
}

