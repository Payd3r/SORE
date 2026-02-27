import axios from 'axios';
import { API_URLS } from './config';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

export interface PushSubscriptionPayload {
  endpoint: string;
  expirationTime: number | null;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface PushDeviceInfo {
  userAgent: string;
  platform: string;
  language: string;
  timezone: string;
}

export const getVapidPublicKey = async (): Promise<string> => {
  const response = await axios.get<{ publicKey: string }>(`${API_URLS.base}/api/push/vapid-public-key`);
  return response.data.publicKey;
};

export const subscribePush = async (
  subscription: PushSubscriptionPayload,
  deviceInfo: PushDeviceInfo
): Promise<void> => {
  await axios.post(
    `${API_URLS.base}/api/push/subscribe`,
    {
      ...subscription,
      deviceInfo,
    },
    { headers: getAuthHeaders() }
  );
};

export const unsubscribePushAll = async (): Promise<void> => {
  await axios.delete(`${API_URLS.base}/api/push/unsubscribe`, {
    headers: getAuthHeaders(),
  });
};
