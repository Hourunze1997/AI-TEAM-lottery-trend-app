import { apiClient } from './client';

export interface NotificationSettings {
  user_id: number;
  draw_reminder_enabled: boolean;
  reminder_time: string;
  hit_notification_enabled: boolean;
  has_push_token: boolean;
}

export async function getNotificationSettings(): Promise<NotificationSettings> {
  const res = await apiClient.get('/notifications/settings');
  return res.data;
}

export async function updateNotificationSettings(payload: {
  draw_reminder_enabled: boolean;
  reminder_time: string;
  hit_notification_enabled: boolean;
}): Promise<NotificationSettings> {
  const res = await apiClient.put('/notifications/settings', payload);
  return res.data;
}

export async function registerPushToken(push_token: string): Promise<{ ok: boolean }> {
  const res = await apiClient.post('/notifications/push-token', { push_token });
  return res.data;
}
