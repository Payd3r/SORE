import { API_URLS } from './config';
import axios from 'axios';

export interface Notification {
  id: number;
  user_id: number;
  title: string;
  body: string;
  icon: string | null;
  url: string | null;
  status: 'read' | 'unread';
  created_at?: string;
}

export interface NotificationsResponse {
  notifications: Notification[];
  total: number;
  unread: number;
}

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

/**
 * Recupera tutte le notifiche dell'utente
 * @param limit Numero massimo di notifiche da recuperare
 * @param offset Indice di partenza per la paginazione
 * @param status Filtra per stato (letto/non letto)
 * @returns Oggetto con le notifiche, il conteggio totale e il numero di notifiche non lette
 */
export const getNotifications = async (
  limit: number = 20,
  offset: number = 0,
  status?: 'read' | 'unread'
): Promise<NotificationsResponse> => {
  try {
    let url = `${API_URLS.base}/api/notifications?limit=${limit}&offset=${offset}`;
    if (status) {
      url += `&status=${status}`;
    }

    const response = await axios.get<NotificationsResponse>(url, {
      headers: getAuthHeaders(),
    });

    return response.data;
  } catch (error) {
    console.error('Errore nel recupero delle notifiche:', error);
    throw error;
  }
};

/**
 * Segna una notifica come letta
 * @param notificationId ID della notifica da segnare come letta
 */
export const markAsRead = async (notificationId: number): Promise<void> => {
  try {
    await axios.put(
      `${API_URLS.base}/api/notifications/${notificationId}/read`,
      {},
      { headers: getAuthHeaders() }
    );
  } catch (error) {
    console.error('Errore nel segnare la notifica come letta:', error);
    throw error;
  }
};

/**
 * Segna tutte le notifiche come lette
 */
export const markAllAsRead = async (): Promise<void> => {
  try {
    await axios.put(
      `${API_URLS.base}/api/notifications/read-all`,
      {},
      { headers: getAuthHeaders() }
    );
  } catch (error) {
    console.error('Errore nel segnare tutte le notifiche come lette:', error);
    throw error;
  }
};

/**
 * Elimina una notifica
 * @param notificationId ID della notifica da eliminare
 */
export const deleteNotification = async (notificationId: number): Promise<void> => {
  try {
    await axios.delete(
      `${API_URLS.base}/api/notifications/${notificationId}`,
      { headers: getAuthHeaders() }
    );
  } catch (error) {
    console.error('Errore nell\'eliminazione della notifica:', error);
    throw error;
  }
}; 