import * as Notifications from 'expo-notifications';

import { getPendingDues, getSettings } from './db';
import { fromYmd, notificationDays, parseTime, toYmd } from './schedule';

const HORIZON = 60;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

async function schedule() {
  const { granted } = await Notifications.getPermissionsAsync();
  if (!granted) return;

  await Notifications.cancelAllScheduledNotificationsAsync();
  const { hour, minute } = parseTime(getSettings().time)!;
  const now = new Date();
  const includeToday = now.getHours() * 60 + now.getMinutes() < hour * 60 + minute;

  for (const { date, count } of notificationDays(getPendingDues(), toYmd(now), includeToday, HORIZON)) {
    const at = fromYmd(date);
    at.setHours(hour, minute, 0, 0);
    await Notifications.scheduleNotificationAsync({
      content: { title: '오늘의 복습', body: `따라 말할 문장 ${count}개가 기다리고 있어요` },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: at },
    });
  }
}

let queue: Promise<void> = Promise.resolve();

export function syncNotifications() {
  queue = queue.then(schedule).catch(console.warn);
  return queue;
}

export async function enableNotifications() {
  await Notifications.requestPermissionsAsync();
  await syncNotifications();
}

export async function notificationsAllowed() {
  return (await Notifications.getPermissionsAsync()).granted;
}

export function onNotificationTap(callback: () => void) {
  const subscription = Notifications.addNotificationResponseReceivedListener(callback);
  return () => subscription.remove();
}
