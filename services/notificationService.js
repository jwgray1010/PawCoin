// Notification service logic for local and push notifications

import * as Notifications from 'expo-notifications';
import { AccessibilityInfo } from 'react-native';
import * as Haptics from 'expo-haptics';

// Configure notification handler (for foreground notifications)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Schedule a local notification
export async function scheduleLocalNotification({ title, body, data, seconds = 2 }) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
    },
    trigger: { seconds },
  });
}

// Cancel all scheduled notifications
export async function cancelAllNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

// Get all scheduled notifications
export async function getScheduledNotifications() {
  return await Notifications.getAllScheduledNotificationsAsync();
}

// Register for push notifications and get Expo push token
export async function registerForPushNotificationsAsync() {
  let token;
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') {
    AccessibilityInfo.announceForAccessibility('Push notification permission denied.');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    return null;
  }
  token = (await Notifications.getExpoPushTokenAsync()).data;
  AccessibilityInfo.announceForAccessibility('Push notification permission granted.');
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  return token;
}

// Send a push notification (to be used with your backend or Expo push service)
export async function sendPushNotification(expoPushToken, { title, body, data }) {
  await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Accept-encoding': 'gzip, deflate',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      to: expoPushToken,
      sound: 'default',
      title,
      body,
      data,
    }),
  });
  AccessibilityInfo.announceForAccessibility('Push notification sent.');
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}