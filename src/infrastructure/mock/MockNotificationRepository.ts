import { INotificationRepository } from '@/domain/repositories/INotificationRepository';
import { AppNotification, UserNotificationSettings } from '@/domain/entities/notification';

let mockNotifications: AppNotification[] = [
  {
    id: 1,
    user_id: 1,
    title: 'Tagihan Listrik & WiFi Jatuh Tempo H-1',
    message: 'Tagihan Indihome & PLN Pascabayar sebesar Rp 650.000 akan jatuh tempo besok. Segera lakukan pembayaran.',
    category: 'BILL',
    priority: 'HIGH',
    action_url: '/bills',
    action_text: 'Bayar Sekarang',
    is_read: false,
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: 2,
    user_id: 1,
    title: 'Peringatan Anggaran: Kategori Makan & Minum 85%',
    message: 'Pengeluaran makan Anda telah mencapai Rp 2.550.000 dari batas Rp 3.000.000 bulan ini.',
    category: 'BUDGET',
    priority: 'MEDIUM',
    action_url: '/budgets',
    action_text: 'Cek Anggaran',
    is_read: false,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
  },
  {
    id: 3,
    user_id: 1,
    title: 'Sistem Keamanan Auroka Aktif',
    message: 'Autentikasi dua faktor dan notifikasi instan WhatsApp Anda telah terkonfigurasi dengan aman.',
    category: 'SECURITY',
    priority: 'LOW',
    action_url: '/settings',
    action_text: 'Kelola Keamanan',
    is_read: true,
    read_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
];

let mockSettings: UserNotificationSettings = {
  id: 1,
  user_id: 1,
  whatsapp_enabled: true,
  email_enabled: true,
  in_app_enabled: true,
  preferred_channel: 'WHATSAPP',
  phone_number: '6281298765432',
  is_phone_verified: true,
  phone_verified_at: new Date().toISOString(),
  bill_reminders: true,
  budget_alerts: true,
  low_balance_alerts: true,
  security_alerts: true,
  budget_threshold_pct: 80,
};

export class MockNotificationRepository implements INotificationRepository {
  async getNotifications(filter?: { category?: string; unreadOnly?: boolean; search?: string }): Promise<AppNotification[]> {
    let result = [...mockNotifications];

    if (filter?.category && filter.category !== 'ALL') {
      result = result.filter(n => n.category === filter.category);
    }
    if (filter?.unreadOnly) {
      result = result.filter(n => !n.is_read);
    }
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      result = result.filter(n => n.title.toLowerCase().includes(q) || n.message.toLowerCase().includes(q));
    }

    return result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  async getUnreadCount(): Promise<number> {
    return mockNotifications.filter(n => !n.is_read).length;
  }

  async markAsRead(id: number): Promise<void> {
    const item = mockNotifications.find(n => n.id === id);
    if (item) {
      item.is_read = true;
      item.read_at = new Date().toISOString();
    }
  }

  async markAllAsRead(): Promise<void> {
    const now = new Date().toISOString();
    mockNotifications.forEach(n => {
      n.is_read = true;
      n.read_at = now;
    });
  }

  async deleteNotification(id: number): Promise<void> {
    mockNotifications = mockNotifications.filter(n => n.id !== id);
  }

  async clearReadNotifications(): Promise<void> {
    mockNotifications = mockNotifications.filter(n => !n.is_read);
  }

  async getSettings(): Promise<UserNotificationSettings> {
    return { ...mockSettings };
  }

  async updateSettings(settings: Partial<UserNotificationSettings>): Promise<UserNotificationSettings> {
    mockSettings = { ...mockSettings, ...settings };
    return { ...mockSettings };
  }

  async requestPhoneOTP(phoneNumber: string): Promise<{ message: string; expires_in: number }> {
    return {
      message: `Kode OTP demo telah dikirimkan ke nomor ${phoneNumber}`,
      expires_in: 600,
    };
  }

  async confirmPhoneOTP(phoneNumber: string, code: string): Promise<{ message: string; data: UserNotificationSettings }> {
    mockSettings.phone_number = phoneNumber;
    mockSettings.is_phone_verified = true;
    mockSettings.phone_verified_at = new Date().toISOString();
    mockSettings.whatsapp_enabled = true;
    return {
      message: 'Verifikasi nomor WhatsApp berhasil!',
      data: { ...mockSettings },
    };
  }
}
