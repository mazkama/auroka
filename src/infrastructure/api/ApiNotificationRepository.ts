import { INotificationRepository } from '@/domain/repositories/INotificationRepository';
import { AppNotification, UserNotificationSettings } from '@/domain/entities/notification';
import { apiFetch } from './apiClient';

export class ApiNotificationRepository implements INotificationRepository {
  async getNotifications(filter?: { category?: string; unreadOnly?: boolean; search?: string }): Promise<AppNotification[]> {
    const params = new URLSearchParams();
    if (filter?.category && filter.category !== 'ALL') params.append('category', filter.category);
    if (filter?.unreadOnly) params.append('unread_only', 'true');
    if (filter?.search) params.append('search', filter.search);

    const query = params.toString() ? `?${params.toString()}` : '';
    const response = await apiFetch<AppNotification[] | { data: AppNotification[] }>(`/notifications${query}`);
    return Array.isArray(response) ? response : (response.data || []);
  }

  async getUnreadCount(): Promise<number> {
    const response = await apiFetch<{ unread_count: number }>('/notifications/unread-count');
    return response.unread_count || 0;
  }

  async markAsRead(id: number): Promise<void> {
    await apiFetch(`/notifications/${id}/read`, { method: 'PATCH' });
  }

  async markAllAsRead(): Promise<void> {
    await apiFetch('/notifications/read-all', { method: 'POST' });
  }

  async deleteNotification(id: number): Promise<void> {
    await apiFetch(`/notifications/${id}`, { method: 'DELETE' });
  }

  async clearReadNotifications(): Promise<void> {
    await apiFetch('/notifications/clear-read', { method: 'DELETE' });
  }

  async getSettings(): Promise<UserNotificationSettings> {
    return await apiFetch<UserNotificationSettings>('/notifications/settings');
  }

  async updateSettings(settings: Partial<UserNotificationSettings>): Promise<UserNotificationSettings> {
    return await apiFetch<UserNotificationSettings>('/notifications/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  }

  async requestPhoneOTP(phoneNumber: string): Promise<{ message: string; expires_in: number }> {
    return await apiFetch<{ message: string; expires_in: number }>('/notifications/verify-phone/request', {
      method: 'POST',
      body: JSON.stringify({ phone_number: phoneNumber }),
    });
  }

  async confirmPhoneOTP(phoneNumber: string, code: string): Promise<{ message: string; data: UserNotificationSettings }> {
    return await apiFetch<{ message: string; data: UserNotificationSettings }>('/notifications/verify-phone/confirm', {
      method: 'POST',
      body: JSON.stringify({ phone_number: phoneNumber, code }),
    });
  }
}

