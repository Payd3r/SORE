type NotificationBellProps = {
  unreadCount: number;
  onClick: () => void;
  "aria-label"?: string;
};

export default function NotificationBell({
  unreadCount,
  onClick,
  "aria-label": ariaLabel = "Notifiche",
}: NotificationBellProps) {
  return (
    <button
      type="button"
      className="pwa-notification-bell"
      onClick={onClick}
      aria-label={unreadCount > 0 ? `${ariaLabel} (${unreadCount} non lette)` : ariaLabel}
    >
      <span className="material-symbols-outlined" aria-hidden>
        notifications
      </span>
      {unreadCount > 0 && (
        <span className="pwa-notification-bell-badge" aria-hidden>
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </button>
  );
}
