'use client';

import { useState, useEffect, useCallback } from 'react';
import { container } from '@/infrastructure/di/container';
import { AppNotification, UserNotificationSettings } from '@/domain/entities/notification';

export function useNotifications() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [settings, setSettings] = useState<UserNotificationSettings | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const count = await container.getUnreadCountUseCase().execute();
      setUnreadCount(count);
    } catch {
      // ignore
    }
  }, []);

  const fetchNotifications = useCallback(async (filter?: { category?: string; unreadOnly?: boolean; search?: string }) => {
    try {
      setLoading(true);
      setError(null);
      const data = await container.getNotificationsUseCase().execute(filter);
      setNotifications(Array.isArray(data) ? data : []);
      await fetchUnreadCount();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Gagal memuat notifikasi');
    } finally {
      setLoading(false);
    }
  }, [fetchUnreadCount]);

  const fetchSettings = useCallback(async () => {
    try {
      const data = await container.getNotificationSettingsUseCase().execute();
      setSettings(data);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    fetchSettings();
    // Poll unread count every 30s
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications, fetchSettings, fetchUnreadCount]);

  const markAsRead = async (id: number) => {
    try {
      await container.getMarkNotificationReadUseCase().execute(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err: unknown) {
      throw new Error(err instanceof Error ? err.message : 'Gagal menandai telah dibaca');
    }
  };

  const markAllAsRead = async () => {
    try {
      await container.getMarkAllNotificationsReadUseCase().execute();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err: unknown) {
      throw new Error(err instanceof Error ? err.message : 'Gagal menandai semua dibaca');
    }
  };

  const removeNotification = async (id: number) => {
    try {
      await container.getDeleteNotificationUseCase().execute(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      await fetchUnreadCount();
    } catch (err: unknown) {
      throw new Error(err instanceof Error ? err.message : 'Gagal menghapus notifikasi');
    }
  };

  const clearReadNotifications = async () => {
    try {
      await container.getClearReadNotificationsUseCase().execute();
      setNotifications(prev => prev.filter(n => !n.is_read));
    } catch (err: unknown) {
      throw new Error(err instanceof Error ? err.message : 'Gagal membersihkan notifikasi');
    }
  };

  const updateSettings = async (newSettings: Partial<UserNotificationSettings>) => {
    try {
      const updated = await container.getUpdateNotificationSettingsUseCase().execute(newSettings);
      setSettings(updated);
      return updated;
    } catch (err: unknown) {
      throw new Error(err instanceof Error ? err.message : 'Gagal menyimpan pengaturan notifikasi');
    }
  };

  const requestPhoneOTP = async (phone: string) => {
    return await container.getRequestPhoneOTPUseCase().execute(phone);
  };

  const confirmPhoneOTP = async (phone: string, code: string) => {
    const res = await container.getConfirmPhoneOTPUseCase().execute(phone, code);
    if (res.data) {
      setSettings(res.data);
    }
    return res;
  };

  return {
    notifications,
    unreadCount,
    settings,
    loading,
    error,
    refreshNotifications: fetchNotifications,
    refreshUnreadCount: fetchUnreadCount,
    refreshSettings: fetchSettings,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearReadNotifications,
    updateSettings,
    requestPhoneOTP,
    confirmPhoneOTP,
  };
}
