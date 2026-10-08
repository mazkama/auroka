export type NotificationCategory = 'SYSTEM' | 'BILL' | 'BUDGET' | 'SECURITY' | 'WALLET';
export type NotificationPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface AppNotification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  category: NotificationCategory;
  priority: NotificationPriority;
  action_url?: string;
  action_text?: string;
  is_read: boolean;
  read_at?: string;
  created_at: string;
}

export interface UserNotificationSettings {
  id: number;
  user_id: number;
  whatsapp_enabled: boolean;
  email_enabled: boolean;
  in_app_enabled: boolean;
  preferred_channel: 'WHATSAPP' | 'EMAIL' | 'IN_APP';
  phone_number: string;
  is_phone_verified: boolean;
  phone_verified_at?: string;
  bill_reminders: boolean;
  budget_alerts: boolean;
  low_balance_alerts: boolean;
  security_alerts: boolean;
  budget_threshold_pct: number;
}
