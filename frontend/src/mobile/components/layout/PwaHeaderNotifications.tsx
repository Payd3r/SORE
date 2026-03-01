import { useState, useEffect } from "react";
import { useNotificationsQuery } from "../../hooks/useNotificationsQuery";
import NotificationBell from "./NotificationBell";
import NotificationsSheet from "./NotificationsSheet";

/**
 * Campanella notifiche + bottom sheet: da usare negli header (Home, Galleria, Idee, Profilo).
 * Non usare nelle pagine di dettaglio.
 */
export default function PwaHeaderNotifications() {
  const [sheetOpen, setSheetOpen] = useState(false);
  const {
    notifications,
    unread,
    isLoading,
    refetch,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotificationsQuery();

  const handleDeleteAll = async () => {
    await Promise.all(notifications.map((n) => deleteNotification(n.id)));
  };

  useEffect(() => {
    if (sheetOpen) refetch();
  }, [sheetOpen, refetch]);

  return (
    <>
      <NotificationBell unreadCount={unread} onClick={() => setSheetOpen(true)} />
      <NotificationsSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        notifications={notifications}
        unread={unread}
        isLoading={isLoading}
        onMarkAsRead={markAsRead}
        onMarkAllAsRead={markAllAsRead}
        onDelete={deleteNotification}
        onDeleteAll={handleDeleteAll}
      />
    </>
  );
}
