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
    deleteNotification,
    deleteAllNotifications,
  } = useNotificationsQuery();

  const handleDeleteAll = async () => {
    await deleteAllNotifications();
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
        onDelete={deleteNotification}
        onDeleteAll={handleDeleteAll}
      />
    </>
  );
}
