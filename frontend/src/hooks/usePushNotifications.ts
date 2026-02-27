import { useCallback, useEffect, useState } from 'react';
import {
  getVapidPublicKey,
  subscribePush,
  unsubscribePushAll,
  PushDeviceInfo,
  PushSubscriptionPayload,
} from '../api/push';

type PushPermission = NotificationPermission | 'unsupported';

interface PushNotificationsState {
  supported: boolean;
  permission: PushPermission;
  enabled: boolean;
  loading: boolean;
  error: string | null;
  requiresPwaOnIOS: boolean;
}

function isIOSDevice(): boolean {
  return /iPad|iPhone|iPod/i.test(navigator.userAgent);
}

function supportsPushNotifications(): boolean {
  return (
    typeof window !== 'undefined' &&
    'Notification' in window &&
    'serviceWorker' in navigator &&
    'PushManager' in window
  );
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}

function buildDeviceInfo(): PushDeviceInfo {
  return {
    userAgent: navigator.userAgent,
    platform: navigator.platform || 'unknown',
    language: navigator.language || 'unknown',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'unknown',
  };
}

function mapBrowserSubscription(subscription: PushSubscription): PushSubscriptionPayload {
  const json = subscription.toJSON();

  return {
    endpoint: subscription.endpoint,
    expirationTime: subscription.expirationTime,
    keys: {
      p256dh: json.keys?.p256dh || '',
      auth: json.keys?.auth || '',
    },
  };
}

async function getCurrentSubscription(): Promise<PushSubscription | null> {
  const registration = await navigator.serviceWorker.ready;
  return registration.pushManager.getSubscription();
}

export function usePushNotifications(isPwaMode: boolean) {
  const [state, setState] = useState<PushNotificationsState>({
    supported: false,
    permission: 'unsupported',
    enabled: false,
    loading: false,
    error: null,
    requiresPwaOnIOS: false,
  });

  const refreshPushStatus = useCallback(async () => {
    const supported = supportsPushNotifications();
    const isIOS = isIOSDevice();
    const requiresPwaOnIOS = isIOS && !isPwaMode;

    if (!supported) {
      setState({
        supported: false,
        permission: 'unsupported',
        enabled: false,
        loading: false,
        error: null,
        requiresPwaOnIOS,
      });
      return;
    }

    const permission = Notification.permission;
    const subscription = permission === 'granted' ? await getCurrentSubscription() : null;

    setState((prev) => ({
      ...prev,
      supported: true,
      permission,
      enabled: Boolean(subscription),
      loading: false,
      requiresPwaOnIOS,
      error: requiresPwaOnIOS ? 'Installa la PWA dalla Home per attivare le notifiche su iPhone.' : prev.error,
    }));
  }, [isPwaMode]);

  useEffect(() => {
    void refreshPushStatus();
  }, [refreshPushStatus]);

  const enablePush = useCallback(async () => {
    if (!supportsPushNotifications()) {
      setState((prev) => ({ ...prev, error: 'Notifiche push non supportate su questo browser.' }));
      return;
    }

    if (isIOSDevice() && !isPwaMode) {
      setState((prev) => ({
        ...prev,
        requiresPwaOnIOS: true,
        error: 'Su iPhone devi prima installare la PWA con "Aggiungi a Home".',
      }));
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      let permission = Notification.permission;
      if (permission !== 'granted') {
        permission = await Notification.requestPermission();
      }

      if (permission !== 'granted') {
        setState((prev) => ({
          ...prev,
          loading: false,
          permission,
          enabled: false,
          error: permission === 'denied'
            ? 'Permesso negato. Abilita le notifiche dalle impostazioni del browser.'
            : 'Permesso non concesso.',
        }));
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      let subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        const publicKey = await getVapidPublicKey();
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey),
        });
      }

      const payload = mapBrowserSubscription(subscription);
      await subscribePush(payload, buildDeviceInfo());
      await refreshPushStatus();
    } catch (error) {
      console.error('Errore durante attivazione notifiche push:', error);
      setState((prev) => ({
        ...prev,
        loading: false,
        error: 'Impossibile attivare le notifiche push. Riprova.',
      }));
    }
  }, [isPwaMode, refreshPushStatus]);

  const disablePush = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      await unsubscribePushAll();

      if (supportsPushNotifications()) {
        const subscription = await getCurrentSubscription();
        if (subscription) {
          await subscription.unsubscribe();
        }
      }

      await refreshPushStatus();
    } catch (error) {
      console.error('Errore durante disattivazione notifiche push:', error);
      setState((prev) => ({
        ...prev,
        loading: false,
        error: 'Impossibile disattivare le notifiche push. Riprova.',
      }));
    }
  }, [refreshPushStatus]);

  return {
    state,
    enablePush,
    disablePush,
    refreshPushStatus,
  };
}
