import { useEffect, useMemo, useRef, useState } from 'react';
import type { MouseEvent } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { differenceInCalendarDays, formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { IoRefreshOutline } from 'react-icons/io5';
import { Notification, deleteNotification, markAllAsRead, markAsRead } from '../../api/notifications';
import { usePullToRefresh } from '../gestures';
import { notificationsQueryKey, useNotificationsQuery } from '../hooks/useNotificationsQuery';
import { Button, Card, SearchBar, SegmentedControl } from './ui';
import { MobileHeader, MobilePageWrapper } from './layout';
import { SkeletonNotificationItemMobile } from './skeletons';

interface NotificationsMobileProps {
  isOpen: boolean;
  onClose: () => void;
}

type FilterTab = 'all' | 'read' | 'unread';

const filterOptions: Array<{ key: FilterTab; label: string }> = [
  { key: 'all', label: 'Tutte' },
  { key: 'read', label: 'Lette' },
  { key: 'unread', label: 'Non lette' }
];

export default function NotificationsMobile({ isOpen, onClose }: NotificationsMobileProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');

  const { data, isLoading, isFetching, refetch } = useNotificationsQuery(isOpen);
  const pullToRefresh = usePullToRefresh({
    enabled: isOpen,
    onRefresh: async () => {
      await refetch();
    },
  });

  useEffect(() => {
    if (isOpen) {
      void refetch();
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, refetch]);

  useEffect(() => {
    if (data?.notifications) {
      setNotifications(data.notifications);
    }
  }, [data]);

  const filteredNotifications = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return notifications.filter((notification) => {
      const matchesFilter =
        activeFilter === 'all' ||
        (activeFilter === 'read' && notification.status === 'read') ||
        (activeFilter === 'unread' && notification.status === 'unread');

      if (!matchesFilter) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      return `${notification.title} ${notification.body}`.toLowerCase().includes(normalizedQuery);
    });
  }, [activeFilter, notifications, query]);

  const groupedNotifications = useMemo(() => {
    const groups: Record<string, Notification[]> = {
      Oggi: [],
      Ieri: [],
      'Questa settimana': [],
      Precedenti: []
    };

    filteredNotifications.forEach((notification) => {
      const createdAt = notification.created_at ? new Date(notification.created_at) : new Date();
      const dayDiff = differenceInCalendarDays(new Date(), createdAt);
      if (dayDiff <= 0) {
        groups.Oggi.push(notification);
      } else if (dayDiff === 1) {
        groups.Ieri.push(notification);
      } else if (dayDiff <= 7) {
        groups['Questa settimana'].push(notification);
      } else {
        groups.Precedenti.push(notification);
      }
    });

    return groups;
  }, [filteredNotifications]);

  const handleNotificationClick = async (notification: Notification) => {
    try {
      if (notification.status === 'unread') {
        await markAsRead(notification.id);
      }

      setNotifications((prev) =>
        prev.map((entry) => (entry.id === notification.id ? { ...entry, status: 'read' } : entry))
      );

      await queryClient.invalidateQueries({ queryKey: notificationsQueryKey });
      await queryClient.invalidateQueries({ queryKey: ['notifications', 'summary'] });

      if (notification.url) {
        onClose();
        navigate(notification.url);
      }
    } catch (error) {
      console.error('Errore nel segnare la notifica come letta:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      setNotifications((prev) => prev.map((entry) => ({ ...entry, status: 'read' })));
      await queryClient.invalidateQueries({ queryKey: notificationsQueryKey });
      await queryClient.invalidateQueries({ queryKey: ['notifications', 'summary'] });
    } catch (error) {
      console.error('Errore nel segnare tutte le notifiche come lette:', error);
    }
  };

  const handleDeleteNotification = async (id: number, event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    try {
      await deleteNotification(id);
      setNotifications((prev) => prev.filter((entry) => entry.id !== id));
      await queryClient.invalidateQueries({ queryKey: notificationsQueryKey });
      await queryClient.invalidateQueries({ queryKey: ['notifications', 'summary'] });
    } catch (error) {
      console.error('Errore nell\'eliminazione della notifica:', error);
    }
  };

  const formatRelativeTime = (dateString?: string) => {
    if (!dateString) {
      return '';
    }
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true, locale: it });
    } catch {
      return '';
    }
  };

  if (!isOpen) {
    return null;
  }

  return createPortal(
    <motion.div
      className="fixed inset-0 z-[70] bg-[var(--bg-page)]"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      <MobilePageWrapper className="h-full pb-6">
        <div
          ref={scrollRef}
          className="h-full overflow-y-auto"
          onTouchStart={(e) => pullToRefresh.onTouchStart(e, scrollRef.current?.scrollTop ?? 0)}
          onTouchMove={(e) => pullToRefresh.onTouchMove(e, scrollRef.current?.scrollTop ?? 0)}
          onTouchEnd={() => {
            void pullToRefresh.onTouchEnd();
          }}
        >
          <div
            className="mx-auto mb-2 h-1.5 w-14 rounded-full bg-[var(--color-primary)]/30 transition-all"
            style={{ transform: `scaleX(${Math.min(1, pullToRefresh.pullDistance / 56)})` }}
          />

          <MobileHeader title="Notifiche" onBack={onClose} />

          <section className="space-y-3 pt-4">
          <SearchBar placeholder="Cerca notifiche..." value={query} onChange={setQuery} />
          <SegmentedControl value={activeFilter} options={filterOptions} onChange={setActiveFilter} />

          <div className="flex items-center justify-between">
            <p className="text-xs text-[var(--text-tertiary)]">{filteredNotifications.length} risultati</p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => void refetch()}
                className="rounded-full bg-[var(--bg-input)] p-2 text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]"
                aria-label="Aggiorna notifiche"
              >
                <IoRefreshOutline className="h-4 w-4" />
              </button>
              {(data?.unread ?? 0) > 0 && (
                <Button size="sm" variant="secondary" onClick={handleMarkAllAsRead}>
                  Segna tutte
                </Button>
              )}
            </div>
          </div>

          {isLoading && notifications.length === 0 ? (
            <SkeletonNotificationItemMobile count={6} />
          ) : filteredNotifications.length === 0 ? (
            <Card className="p-6 text-center">
              <p className="text-sm font-medium text-[var(--text-primary)]">Nessuna notifica</p>
              <p className="mt-1 text-xs text-[var(--text-tertiary)]">Prova a cambiare filtro o ricerca.</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {Object.entries(groupedNotifications).map(([groupName, groupItems]) =>
                groupItems.length > 0 ? (
                  <div key={groupName} className="space-y-2">
                    <h3 className="text-sm font-semibold text-[var(--text-primary)]">{groupName}</h3>
                    {groupItems.map((notification, index) => (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03, duration: 0.16 }}
                      >
                        <Card
                          variant="content"
                          onClick={() => void handleNotificationClick(notification)}
                          className={
                            notification.status === 'unread'
                              ? 'border border-[var(--color-primary)]/20 bg-[var(--bg-page-accent)]'
                              : ''
                          }
                          avatar={
                            <div className="flex h-full w-full items-center justify-center bg-[var(--bg-input)] text-xs font-semibold text-[var(--text-secondary)]">
                              {notification.title?.[0] ?? 'N'}
                            </div>
                          }
                          title={notification.title}
                          description={notification.body}
                          meta={formatRelativeTime(notification.created_at)}
                        >
                          <div className="mt-2 flex justify-end">
                            <button
                              type="button"
                              onClick={(event) => void handleDeleteNotification(notification.id, event)}
                              className="rounded-full bg-[var(--bg-input)] px-2 py-1 text-xs text-red-500 hover:bg-[var(--bg-secondary)]"
                            >
                              Elimina
                            </button>
                          </div>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                ) : null
              )}
            </div>
          )}

          {isFetching && notifications.length > 0 && (
            <p className="text-center text-xs text-[var(--text-tertiary)]">Aggiornamento notifiche...</p>
          )}
          </section>
        </div>
      </MobilePageWrapper>
    </motion.div>,
    document.body
  );
}
