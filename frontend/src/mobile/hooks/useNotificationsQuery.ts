import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Notification } from "../../api/notifications";
import {
  getNotifications,
  markAsRead as apiMarkAsRead,
  markAllAsRead as apiMarkAllAsRead,
  deleteNotification as apiDeleteNotification,
  deleteAllNotifications as apiDeleteAllNotifications,
} from "../../api/notifications";
import { invalidateOnNotificationChange } from "../utils/queryInvalidations";

const NOTIFICATIONS_QUERY_KEY = ["notifications"] as const;

function normalizeNotifications(data: { notifications?: Notification[] }): Notification[] {
  const list = data?.notifications ?? [];
  return list.map((n) => ({
    ...n,
    status: (n.status === 0 || n.status === "unread" ? "unread" : "read") as "read" | "unread",
  }));
}

export function useNotificationsQuery() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: NOTIFICATIONS_QUERY_KEY,
    queryFn: async () => {
      const res = await getNotifications(50, 0);
      return {
        ...res,
        notifications: normalizeNotifications(res),
      };
    },
    staleTime: 60 * 1000,
  });

  const markAsReadMutation = useMutation({
    mutationFn: apiMarkAsRead,
    onSuccess: async () => {
      await invalidateOnNotificationChange(queryClient);
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: apiMarkAllAsRead,
    onSuccess: async () => {
      await invalidateOnNotificationChange(queryClient);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: apiDeleteNotification,
    onSuccess: async () => {
      await invalidateOnNotificationChange(queryClient);
    },
  });

  const deleteAllMutation = useMutation({
    mutationFn: apiDeleteAllNotifications,
    onSuccess: async () => {
      await invalidateOnNotificationChange(queryClient);
    },
  });

  const notifications = query.data?.notifications ?? [];
  const unread = query.data?.unread ?? 0;
  const total = query.data?.total ?? 0;

  return {
    notifications,
    unread,
    total,
    isLoading: query.isLoading,
    refetch: query.refetch,
    markAsRead: markAsReadMutation.mutateAsync,
    markAllAsRead: markAllAsReadMutation.mutateAsync,
    deleteNotification: deleteMutation.mutateAsync,
    deleteAllNotifications: deleteAllMutation.mutateAsync,
  };
}
