import { RowDataPacket } from 'mysql2';
import webpush from 'web-push';
import pool from '../config/db';

export interface PushPayload {
  title: string;
  body: string;
  url?: string;
  icon?: string;
  notificationId?: number;
  createdAt?: string;
}

interface PushSubscriptionRow extends RowDataPacket {
  id: number;
  endpoint: string;
  p256dh: string;
  auth: string;
}

let pushConfigured = false;

function ensurePushConfigured(): boolean {
  if (pushConfigured) {
    return true;
  }

  const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
  const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
  const vapidSubject = process.env.VAPID_SUBJECT;

  if (!vapidPublicKey || !vapidPrivateKey || !vapidSubject) {
    return false;
  }

  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
  pushConfigured = true;
  return true;
}

async function removeSubscription(subscriptionId: number): Promise<void> {
  try {
    await pool.promise().query('DELETE FROM push_subscriptions WHERE id = ?', [subscriptionId]);
  } catch (error) {
    console.error('Error cleaning up invalid push subscription:', error);
  }
}

export async function sendPushToUser(userId: string | number, payload: PushPayload): Promise<void> {
  if (!ensurePushConfigured()) {
    return;
  }

  try {
    const [subscriptions] = await pool.promise().query<PushSubscriptionRow[]>(
      `SELECT id, endpoint, p256dh, auth
       FROM push_subscriptions
       WHERE user_id = ?`,
      [userId]
    );

    if (!subscriptions.length) {
      return;
    }

    await Promise.all(
      subscriptions.map(async (subscriptionRow) => {
        try {
          await webpush.sendNotification(
            {
              endpoint: subscriptionRow.endpoint,
              keys: {
                p256dh: subscriptionRow.p256dh,
                auth: subscriptionRow.auth,
              },
            },
            JSON.stringify(payload)
          );
        } catch (error: any) {
          const statusCode = error?.statusCode;
          if (statusCode === 404 || statusCode === 410) {
            await removeSubscription(subscriptionRow.id);
            return;
          }

          console.error('Error sending push notification:', error);
        }
      })
    );
  } catch (error) {
    console.error('Error sending push notifications to user:', error);
  }
}
