import * as Notifications from 'expo-notifications';

export async function scheduleLocal(opts: {
  title: string;
  body: string;
  triggerSeconds?: number;
  data?: Record<string, unknown>;
}) {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: opts.title,
        body: opts.body,
        data: opts.data ?? {},
      },
      trigger: { seconds: opts.triggerSeconds ?? 0 },
    });
  } catch (e) {
    // 通知权限未授予等情况忽略
  }
}

export async function cancelAll() {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch {
    // ignore
  }
}
