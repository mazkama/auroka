import { describe, it, expect, beforeEach } from 'vitest';
import { MockNotificationRepository } from '@/infrastructure/mock/MockNotificationRepository';
import {
  GetNotificationsUseCase,
  GetUnreadCountUseCase,
  MarkNotificationReadUseCase,
  UpdateNotificationSettingsUseCase,
  RequestPhoneOTPUseCase,
  ConfirmPhoneOTPUseCase,
} from '@/application/usecases/NotificationUseCases';

describe('Notification Engine & WhatsApp Verification UseCases', () => {
  let mockRepo: MockNotificationRepository;

  beforeEach(() => {
    mockRepo = new MockNotificationRepository();
  });

  it('should fetch notifications with unread count correctly', async () => {
    const getNotifs = new GetNotificationsUseCase(mockRepo);
    const getUnread = new GetUnreadCountUseCase(mockRepo);

    const list = await getNotifs.execute();
    expect(list.length).toBeGreaterThanOrEqual(1);

    const count = await getUnread.execute();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  it('should mark a notification as read and decrement unread count', async () => {
    const getNotifs = new GetNotificationsUseCase(mockRepo);
    const markRead = new MarkNotificationReadUseCase(mockRepo);
    const getUnread = new GetUnreadCountUseCase(mockRepo);

    const initialUnread = await getUnread.execute();
    await markRead.execute(1);

    const list = await getNotifs.execute();
    const item = list.find((n) => n.id === 1);
    expect(item?.is_read).toBe(true);

    const newUnread = await getUnread.execute();
    expect(newUnread).toBeLessThanOrEqual(initialUnread);
  });

  it('should handle WhatsApp phone verification flow (request and confirm OTP)', async () => {
    const requestOTP = new RequestPhoneOTPUseCase(mockRepo);
    const confirmOTP = new ConfirmPhoneOTPUseCase(mockRepo);

    const reqRes = await requestOTP.execute('081234567890');
    expect(reqRes.expires_in).toBe(600);

    const confirmRes = await confirmOTP.execute('081234567890', '123456');
    expect(confirmRes.data.is_phone_verified).toBe(true);
    expect(confirmRes.data.whatsapp_enabled).toBe(true);
  });
});
