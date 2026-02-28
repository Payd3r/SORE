import { useQuery } from '@tanstack/react-query';
import { getNotifications, NotificationsResponse } from '../../api/notifications';

export const notificationsQueryKey = ['notifications', 'mobile'] as const;

export function useNotificationsQuery(enabled = true) {
  return useQuery<NotificationsResponse>({
    queryKey: notificationsQueryKey,
    queryFn: () => getNotifications(50, 0),
    enabled,
    staleTime: 30 * 1000,
    refetchInterval: enabled ? 60 * 1000 : false,
    refetchOnWindowFocus: false,
  });
}

export function useNotificationsSummaryQuery(enabled = true) {
  return useQuery<NotificationsResponse>({
    queryKey: ['notifications', 'summary'],
    queryFn: () => getNotifications(1, 0),
    enabled,
    staleTime: 30 * 1000,
    refetchInterval: enabled ? 60 * 1000 : false,
    refetchOnWindowFocus: false,
  });
}
