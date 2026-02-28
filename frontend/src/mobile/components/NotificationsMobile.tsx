import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { 
  markAsRead, 
  markAllAsRead, 
  deleteNotification,
  Notification 
} from '../../api/notifications';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';
import BottomSheet from '../../components/ui/BottomSheet';
import ListItem from '../../components/ui/ListItem';
import Button from '../../components/ui/Button';
import { useBottomSheetDrag } from '../gestures';
import { SkeletonNotificationItemMobile } from './skeletons';
import { notificationsQueryKey, useNotificationsQuery } from '../hooks/useNotificationsQuery';

interface NotificationsMobileProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationsMobile({ isOpen, onClose }: NotificationsMobileProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const modalContentRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const drag = useBottomSheetDrag({ onClose });
  const { data, isLoading, isFetching, refetch } = useNotificationsQuery(isOpen);
  const unreadCount = data?.unread ?? 0;

  // Carica le notifiche quando il componente si monta o il modale viene aperto
  useEffect(() => {
    if (isOpen) {
      void refetch();
      
      // Blocca lo scroll del body quando il modale è aperto
      document.body.style.overflow = 'hidden';
    } else {
      // Ripristina lo scroll quando il modale è chiuso
      document.body.style.overflow = '';
    }
    
    return () => {
      // Ripristina lo scroll quando il componente viene smontato
      document.body.style.overflow = '';
    };
  }, [isOpen, refetch]);

  useEffect(() => {
    if (data?.notifications) {
      setNotifications(data.notifications);
    }
  }, [data]);

  // Gestisce il click su una notifica
  const handleNotificationClick = async (notification: Notification) => {
    try {
      // Segna la notifica come letta
      await markAsRead(notification.id);
      
      // Aggiorna lo stato locale
      setNotifications(prevNotifications => 
        prevNotifications.map(n => 
          n.id === notification.id ? { ...n, status: 'read' } : n
        )
      );
      await queryClient.invalidateQueries({ queryKey: notificationsQueryKey });
      await queryClient.invalidateQueries({ queryKey: ['notifications', 'summary'] });
      
      // Naviga all'URL della notifica se presente
      if (notification.url) {
        onClose();
        navigate(notification.url);
      }
    } catch (error) {
      console.error('Errore nel segnare la notifica come letta:', error);
    }
  };

  // Segna tutte le notifiche come lette
  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      // Aggiorna lo stato locale e sincronizza cache query
      setNotifications([]);
      await queryClient.invalidateQueries({ queryKey: notificationsQueryKey });
      await queryClient.invalidateQueries({ queryKey: ['notifications', 'summary'] });
      onClose();
    } catch (error) {
      console.error('Errore nel segnare tutte le notifiche come lette:', error);
    }
  };

  // Elimina una notifica
  const handleDeleteNotification = async (id: number, event: React.MouseEvent) => {
    event.stopPropagation(); // Evita di attivare l'handleNotificationClick
    
    try {
      await deleteNotification(id);
      
      // Aggiorna lo stato locale
      setNotifications(prevNotifications => 
        prevNotifications.filter(n => n.id !== id)
      );
      await queryClient.invalidateQueries({ queryKey: notificationsQueryKey });
      await queryClient.invalidateQueries({ queryKey: ['notifications', 'summary'] });
    } catch (error) {
      console.error('Errore nell\'eliminazione della notifica:', error);
    }
  };

  // Formatta la data relativa (es. "2 ore fa")
  const formatRelativeTime = (dateString?: string) => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true, locale: it });
    } catch (error) {
      return '';
    }
  };

  // Contenuto del modale
  if (!isOpen) return null;

  return createPortal(
    <BottomSheet
      open={isOpen}
      onClose={onClose}
      contentClassName="flex max-h-[80dvh] flex-col transition-transform duration-200"
      dragHandleProps={{
        onTouchStart: drag.onTouchStart,
        onTouchMove: drag.onTouchMove,
        onTouchEnd: drag.onTouchEnd,
      }}
    >
      <div
        ref={modalContentRef}
        style={{ transform: `translateY(${drag.translateY}px)`, opacity: Math.max(0.5, 1 - drag.translateY / 220) }}
      >
        <div className="flex items-center justify-between px-4 py-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Notifiche {unreadCount > 0 && `(${unreadCount})`}</h3>
          {unreadCount > 0 && <Button variant="ghost" size="sm" onClick={handleMarkAllAsRead}>Segna tutte</Button>}
        </div>
        <div className="flex-1 overflow-y-auto p-4 pb-6">
          {isLoading && notifications.length === 0 ? (
            <SkeletonNotificationItemMobile count={6} />
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-gray-500 dark:text-gray-400">
              <svg className="w-12 h-12 mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <p>Nessuna notifica</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <ListItem
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  title={notification.title}
                  subtitle={`${notification.body} • ${formatRelativeTime(notification.created_at)}`}
                  className={notification.status === 'unread' ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
                  right={
                    <button
                      onClick={(e) => handleDeleteNotification(notification.id, e)}
                      className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 bg-transparent border-none"
                      aria-label="Elimina notifica"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  }
                />
              ))}
            </div>
          )}
          {isFetching && notifications.length > 0 ? (
            <div className="mt-3 flex justify-center">
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs text-blue-500 dark:bg-blue-900/20">
                Aggiornamento notifiche...
              </span>
            </div>
          ) : null}
        </div>
      </div>
    </BottomSheet>,
    document.body
  );
} 