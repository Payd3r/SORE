import { useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import type { RefObject } from 'react';
import type { Notification } from '../../../api/notifications';
import { markAllAsRead, markAsRead } from '../../../api/notifications';
import { notificationsQueryKey, useNotificationsQuery } from '../../hooks/useNotificationsQuery';
import { formatRelativeTime } from '../../../utils/relativeTime';
import { cn } from '../../../components/ui/cn';
import MaterialIcon from '../ui/MaterialIcon';

const MAX_ITEMS = 8;

interface NotificationsDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  anchorRef: RefObject<HTMLButtonElement | null>;
}

function getNotificationIcon(notification: Notification): { iconName: string; bgClass: string } {
  const text = `${notification.title} ${notification.body}`.toLowerCase();
  if (notification.icon) {
    const icon = notification.icon.toLowerCase();
    if (icon.includes('heart') || icon.includes('photo') || icon.includes('love'))
      return { iconName: 'favorite', bgClass: 'bg-purple-300 dark:bg-purple-600' };
    if (icon.includes('star') || icon.includes('trip') || icon.includes('year'))
      return { iconName: 'star', bgClass: 'bg-amber-200 dark:bg-amber-600' };
  }
  if (text.includes('photo') || text.includes('foto') || text.includes('added'))
    return { iconName: 'favorite', bgClass: 'bg-purple-300 dark:bg-purple-600' };
  if (text.includes('trip') || text.includes('viaggio') || text.includes('year') || text.includes('anno'))
    return { iconName: 'star', bgClass: 'bg-amber-200 dark:bg-amber-600' };
  return { iconName: 'image', bgClass: 'bg-gray-300 dark:bg-gray-600' };
}

export default function NotificationsDropdown({ isOpen, onClose, anchorRef }: NotificationsDropdownProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data, isLoading } = useNotificationsQuery(isOpen);
  const notifications = (data?.notifications ?? []).slice(0, MAX_ITEMS);

  const handleClickOutside = useCallback(
    (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(target) &&
        anchorRef.current &&
        !anchorRef.current.contains(target)
      ) {
        onClose();
      }
    },
    [onClose, anchorRef]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isOpen, handleClickOutside]);

  const handleNotificationClick = async (notification: Notification) => {
    try {
      if (notification.status === 'unread') {
        await markAsRead(notification.id);
      }
      await queryClient.invalidateQueries({ queryKey: notificationsQueryKey });
      await queryClient.invalidateQueries({ queryKey: ['notifications', 'summary'] });
      onClose();
      if (notification.url) {
        navigate(notification.url);
      }
    } catch (error) {
      console.error('Errore nel segnare la notifica come letta:', error);
    }
  };

  const handleClearAll = async () => {
    try {
      await markAllAsRead();
      await queryClient.invalidateQueries({ queryKey: notificationsQueryKey });
      await queryClient.invalidateQueries({ queryKey: ['notifications', 'summary'] });
      onClose();
    } catch (error) {
      console.error('Errore nel segnare tutte le notifiche come lette:', error);
    }
  };

  if (!isOpen) return null;

  const anchorRect = anchorRef.current?.getBoundingClientRect();
  const style: React.CSSProperties = anchorRect
    ? {
        position: 'fixed',
        top: anchorRect.bottom + 8,
        right: window.innerWidth - anchorRect.right,
        width: Math.min(340, window.innerWidth - 24),
      }
    : { position: 'fixed', top: 16, right: 16, width: Math.min(340, window.innerWidth - 24) };

  const content = (
    <div
      ref={dropdownRef}
      className="z-50 overflow-hidden rounded-2xl bg-[var(--bg-card)] shadow-lg"
      style={style}
    >
      <div className="flex items-center justify-between border-b border-[var(--border-default)] px-4 py-1">
        <h2 className="text-sm font-bold uppercase tracking-wide text-[var(--text-primary)]">
          Notifications
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-transparent text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-input)]"
          aria-label="Chiudi"
        >
          <MaterialIcon name="close" size={20} />
        </button>
      </div>

      <div className="max-h-[min(360px,70vh)] overflow-y-auto p-3">
        {isLoading ? (
          <div className="space-y-2 py-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex gap-3 rounded-xl bg-[var(--bg-input)] p-3"
              >
                <div className="h-10 w-10 shrink-0 animate-pulse rounded-lg bg-[var(--bg-secondary)]" />
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="h-3 w-3/4 animate-pulse rounded bg-[var(--bg-secondary)]" />
                  <div className="h-2 w-1/4 animate-pulse rounded bg-[var(--bg-secondary)]" />
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <p className="py-8 text-center text-sm text-[var(--text-tertiary)]">
            Nessuna notifica
          </p>
        ) : (
          <div className="space-y-2">
            {notifications.map((notification) => {
              const { iconName, bgClass } = getNotificationIcon(notification);
              return (
                <button
                  key={notification.id}
                  type="button"
                  onClick={() => void handleNotificationClick(notification)}
                  className={cn(
                    'flex w-full gap-3 rounded-xl p-3 text-left transition-colors',
                    'bg-[var(--bg-input)] hover:bg-[var(--bg-secondary)]',
                    notification.status === 'unread' && 'ring-1 ring-[var(--color-primary)]/30'
                  )}
                >
                  <div
                    className={cn(
                      'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
                      bgClass
                    )}
                  >
                    <MaterialIcon name={iconName} size={20} className="text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-[var(--text-primary)]">
                      {notification.title}
                    </p>
                    <p className="text-xs uppercase tracking-wide text-[var(--text-tertiary)]">
                      {notification.created_at
                        ? formatRelativeTime(notification.created_at)
                        : ''}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {!isLoading && notifications.length > 0 && (data?.unread ?? 0) > 0 && (
        <div className="border-t border-[var(--border-default)] p-3">
          <button
            type="button"
            onClick={() => void handleClearAll()}
            className="w-full text-center text-sm font-semibold text-[var(--color-primary)]"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );

  return createPortal(content, document.body);
}
