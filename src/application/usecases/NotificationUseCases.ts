import { INotificationRepository } from '@/domain/repositories/INotificationRepository';
import { AppNotification } from '@/domain/entities/notification';

export class GetNotificationsUseCase {
  constructor(private notificationRepository: INotificationRepository) {}

  async execute(filter?: { category?: string; unreadOnly?: boolean; search?: string }): Promise<AppNotification[]> {
    return this.notificationRepository.getNotifications(filter);
  }
}

export class GetUnreadCountUseCase {
  constructor(private notificationRepository: INotificationRepository) {}

  async execute(): Promise<number> {
    return this.notificationRepository.getUnreadCount();
  }
}

export class MarkNotificationReadUseCase {
  constructor(private notificationRepository: INotificationRepository) {}

  async execute(id: number): Promise<void> {
    return this.notificationRepository.markAsRead(id);
  }
}

export class MarkAllNotificationsReadUseCase {
  constructor(private notificationRepository: INotificationRepository) {}

  async execute(): Promise<void> {
    return this.notificationRepository.markAllAsRead();
  }
}

export class DeleteNotificationUseCase {
  constructor(private notificationRepository: INotificationRepository) {}

  async execute(id: number): Promise<void> {
    return this.notificationRepository.deleteNotification(id);
  }
}

export class ClearReadNotificationsUseCase {
  constructor(private notificationRepository: INotificationRepository) {}

  async execute(): Promise<void> {
    return this.notificationRepository.clearReadNotifications();
  }
}

export class GetNotificationSettingsUseCase {
  constructor(private notificationRepository: INotificationRepository) {}

  async execute() {
    return this.notificationRepository.getSettings();
  }
}

export class UpdateNotificationSettingsUseCase {
  constructor(private notificationRepository: INotificationRepository) {}

  async execute(settings: any) {
    return this.notificationRepository.updateSettings(settings);
  }
}

export class RequestPhoneOTPUseCase {
  constructor(private notificationRepository: INotificationRepository) {}

  async execute(phoneNumber: string) {
    return this.notificationRepository.requestPhoneOTP(phoneNumber);
  }
}

export class ConfirmPhoneOTPUseCase {
  constructor(private notificationRepository: INotificationRepository) {}

  async execute(phoneNumber: string, code: string) {
    return this.notificationRepository.confirmPhoneOTP(phoneNumber, code);
  }
}
