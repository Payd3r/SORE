import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { it } from "date-fns/locale";
import type { Notification } from "../../../api/notifications";
import PwaBottomSheet from "../ui/BottomSheet";

/** Icona Material Symbols in base al tipo di notifica */
const NOTIFICATION_TYPE_ICON: Record<string, string> = {
  new_memory: "auto_stories",
  new_idea: "lightbulb",
  idea_completed: "check_circle",
  new_photos: "photo_library",
  upload_completed: "cloud_done",
  memory_anniversary: "celebration",
  couple_anniversary: "favorite",
  birthday: "cake",
  future_memory_7d: "schedule",
  future_memory_1d: "today",
  future_memory_today: "event",
};

const DEFAULT_NOTIFICATION_ICON = "notifications";

function getNotificationIcon(type?: string | null): string {
  if (!type) return DEFAULT_NOTIFICATION_ICON;
  return NOTIFICATION_TYPE_ICON[type] ?? DEFAULT_NOTIFICATION_ICON;
}

type NotificationsSheetProps = {
  open: boolean;
  onClose: () => void;
  notifications: Notification[];
  unread: number;
  isLoading: boolean;
  onMarkAsRead: (id: number) => Promise<unknown>;
  onDelete: (id: number) => Promise<unknown>;
  onDeleteAll: () => Promise<unknown>;
};

function isUnread(status: Notification["status"]): boolean {
  return status === "unread" || status === 0;
}

function formatTime(dateString?: string) {
  if (!dateString) return "";
  try {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true, locale: it });
  } catch {
    return "";
  }
}

const SWIPE_DELETE_THRESHOLD = 80;

export default function NotificationsSheet({
  open,
  onClose,
  notifications,
  unread,
  isLoading,
  onMarkAsRead,
  onDelete,
  onDeleteAll,
}: NotificationsSheetProps) {
  const navigate = useNavigate();
  const touchStartXRef = useRef<number>(0);
  const deletedBySwipeRef = useRef<number | null>(null);
  const [swipe, setSwipe] = useState<{ id: number; offset: number } | null>(null);

  const handleNotificationClick = async (n: Notification) => {
    if (deletedBySwipeRef.current === n.id) {
      deletedBySwipeRef.current = null;
      return;
    }
    if (isUnread(n.status)) {
      await onMarkAsRead(n.id);
    }
    onClose();
    if (n.url) {
      navigate(n.url);
    }
  };

  const handleTouchStart = (e: React.TouchEvent, id: number) => {
    touchStartXRef.current = e.touches[0].clientX;
    setSwipe({ id, offset: 0 });
  };

  const handleTouchMove = (e: React.TouchEvent, id: number) => {
    if (!swipe || swipe.id !== id) return;
    const delta = e.touches[0].clientX - touchStartXRef.current;
    setSwipe((prev) => (prev ? { ...prev, offset: delta } : null));
  };

  const handleTouchEnd = (e: React.TouchEvent, id: number) => {
    if (!swipe || swipe.id !== id) return;
    if (Math.abs(swipe.offset) >= SWIPE_DELETE_THRESHOLD) {
      e.preventDefault();
      deletedBySwipeRef.current = id;
      onDelete(id);
    }
    setSwipe(null);
  };

  return (
    <PwaBottomSheet open={open} onClose={onClose}>
      <div className="pwa-notifications-sheet" data-open={open}>
        <div className="pwa-notifications-sheet-header">
          <h2 className="pwa-notifications-sheet-title">
            Notifiche
            {unread > 0 && (
              <span className="pwa-notifications-sheet-badge" aria-hidden>
                {unread > 99 ? "99+" : unread}
              </span>
            )}
          </h2>
          <div className="pwa-notifications-sheet-header-actions">
            {notifications.length > 0 && (
              <button
                type="button"
                className="pwa-notifications-sheet-delete-all"
                onClick={() => onDeleteAll()}
                aria-label="Elimina tutte le notifiche"
              >
                <span className="material-symbols-outlined">delete_outline</span>
              </button>
            )}
          </div>
        </div>
        <div className="pwa-notifications-sheet-list">
          {isLoading ? (
            <div className="pwa-notifications-sheet-loading">
              <span className="pwa-notifications-sheet-spinner" aria-hidden />
              <p>Caricamento...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="pwa-notifications-sheet-empty">
              <span className="material-symbols-outlined" aria-hidden>
                notifications_none
              </span>
              <p>Nessuna notifica</p>
            </div>
          ) : (
            <ul className="pwa-notifications-sheet-ul" role="list">
              {notifications.map((n) => {
                const isSwiping = swipe?.id === n.id;
                return (
                  <li key={n.id} className="pwa-notifications-sheet-li">
                    <div
                      role="button"
                      tabIndex={0}
                      className={`pwa-notifications-sheet-item ${isUnread(n.status) ? "pwa-notifications-sheet-item-unread" : ""}`}
                      style={
                        isSwiping
                          ? { transform: `translateX(${swipe.offset}px)` }
                          : undefined
                      }
                      onClick={() => handleNotificationClick(n)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          handleNotificationClick(n);
                        }
                      }}
                      onTouchStart={(e) => handleTouchStart(e, n.id)}
                      onTouchMove={(e) => handleTouchMove(e, n.id)}
                      onTouchEnd={(e) => handleTouchEnd(e, n.id)}
                      onTouchCancel={() => setSwipe(null)}
                    >
                      <span
                        className="pwa-notifications-sheet-item-icon"
                        aria-hidden
                      >
                        <span className="material-symbols-outlined">
                          {getNotificationIcon(n.type)}
                        </span>
                      </span>
                      {isUnread(n.status) && (
                        <span className="pwa-notifications-sheet-item-dot" aria-hidden />
                      )}
                      <div className="pwa-notifications-sheet-item-content">
                        <span className="pwa-notifications-sheet-item-title">{n.title}</span>
                        <p className="pwa-notifications-sheet-item-body">{n.body}</p>
                        <span className="pwa-notifications-sheet-item-time">
                          {formatTime(n.created_at)}
                        </span>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </PwaBottomSheet>
  );
}
