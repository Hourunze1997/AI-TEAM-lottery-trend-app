import * as Notifications from 'expo-notifications';
import { Reminder } from '../types/models';
import { getItem, setItem } from './storage';

const KEY = 'reminder';

Notifications.setNotificationHandler({
  handleNotification: async () => ({ shouldShowAlert: true, shouldPlaySound: false, shouldSetBadge: false }),
});

export async function requestPermission(): Promise<boolean> {
  const { status } = await Notifications.getPermissionsAsync();
  if (status === 'granted') return true;
  const req = await Notifications.requestPermissionsAsync();
  return req.status === 'granted';
}

export async function scheduleReminder(reminder: Reminder): Promise<string> {
  const ok = await requestPermission();
  if (!ok) throw new Error('通知权限未授予');

  // 取消旧的
  const saved = await getItem<Reminder>(KEY);
  if (saved?.notifId) {
    await Notifications.cancelScheduledNotificationAsync(saved.notifId);
  }

  const id = await Notifications.scheduleNotificationAsync({
    content: { title: reminder.title, body: reminder.body },
    trigger: {
      weekday: reminder.weekday,
      hour: reminder.hour,
      minute: reminder.minute,
      repeats: true,
    } as Notifications.WeeklyTriggerInput,
  });

  await setItem<Reminder>(KEY, { ...reminder, notifId: id, enabled: true });
  return id;
}

export async function cancelReminder(notifId: string): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(notifId);
  } catch (e) {
    console.warn('[notification.cancel]', e);
  }
  await setItem<Reminder>(KEY, { notifId, weekday: 1, hour: 20, minute: 30, enabled: false, title: '', body: '' });
}

export async function getReminder(): Promise<Reminder | null> {
  return getItem<Reminder>(KEY);
}