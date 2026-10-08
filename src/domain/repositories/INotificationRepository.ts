import { AppNotification, UserNotificationSettings } from '../entities/notification';

export interface INotificationRepository {
  getNotifications(filter?: { category?: string; unreadOnly?: boolean; search?: string }): Promise<AppNotification[]>;
  getUnreadCount(): Promise<number>;
  markAsRead(id: number): Promise<void>;
  markAllAsRead(): Promise<void>;
  deleteNotification(id: number): Promise<void>;
  clearReadNotifications(): Promise<void>;
  getSettings(): Promise<UserNotificationSettings>;
  updateSettings(settings: Partial<UserNotificationSettings>): Promise<UserNotificationSettings>;
  requestPhoneOTP(phoneNumber: string): Promise<{ message: string; expires_in: number }>;
  confirmPhoneOTP(phoneNumber: string, code: string): Promise<{ message: string; data: UserNotificationSettings }>;
}
