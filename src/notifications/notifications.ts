
// Notificaciones LOCALES con expo-notifications

import { Platform } from 'react-native';
import { isRunningInExpoGo } from 'expo';
import { cancelScheduledNotificationAsync } from 'expo-notifications/build/cancelScheduledNotificationAsync';
import { getPermissionsAsync, requestPermissionsAsync } from 'expo-notifications/build/NotificationPermissions';
import { AndroidImportance } from 'expo-notifications/build/NotificationChannelManager.types';
import { SchedulableTriggerInputTypes } from 'expo-notifications/build/Notifications.types';
import { scheduleNotificationAsync } from 'expo-notifications/build/scheduleNotificationAsync';
import { setNotificationChannelAsync } from 'expo-notifications/build/setNotificationChannelAsync';
import { setNotificationHandler } from 'expo-notifications/build/NotificationsHandler';

const CHANNEL_ID = 'recordatorios';

// true cuando el canal propio se creó bien
let channelReady = false;

// Qué hacer si llega una notificación con la app ABIERTA 
setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Pide permiso 
export async function ensurePermission(): Promise<boolean> {
  if (Platform.OS === 'android' && !isRunningInExpoGo() && !channelReady) {
    try {
      await setNotificationChannelAsync(CHANNEL_ID, {
        name: 'Recordatorios',
        importance: AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        sound: 'default',
      });
      channelReady = true;
    } catch (e) {
      // Si falla, no debe bloquear el resto 
      console.log('[Notif] No se pudo crear el canal, se usa el de respaldo:', e);
    }
  }

  const current = await getPermissionsAsync();
  if (current.status === 'granted') return true;

  const asked = await requestPermissionsAsync();
  if (asked.status === 'granted') return true;

  console.log('[Notif] Permiso de notificaciones denegado');
  return false;
}


export async function scheduleTaskReminder(
  title: string,
  seconds: number
): Promise<string | null> {
  const ok = await ensurePermission();
  if (!ok) return null;

  try {
    return await scheduleNotificationAsync({
      content: {
        title: 'Tarea pendiente',
        body: title,
        sound: 'default',
      },
      trigger: {
        type: SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds,
        channelId: channelReady ? CHANNEL_ID : undefined, // sin canal propio → canal de respaldo
      },
    });
  } catch (e) {
    console.warn('[Notif] No se pudo programar:', e);
    return null;
  }
}

// Cancela un aviso que todavía no sono
export async function cancelReminder(notificationId: string | null): Promise<void> {
  if (!notificationId) return;
  try {
    await cancelScheduledNotificationAsync(notificationId);
  } catch (e) {
    console.warn('[Notif] No se pudo cancelar:', e);
  }
}