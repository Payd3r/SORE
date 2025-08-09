import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  Notification
} from '../../../api/notifications';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';

interface NotificationsDesktopModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationsDesktopModal({ isOpen, onClose }: NotificationsDesktopModalProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await getNotifications(50, 0);
      setNotifications(response.notifications);
      setUnreadCount(response.unread);
    } catch (error) {
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    try {
      await markAsRead(notification.id);
      setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, status: 'read' } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
      if (notification.url) {
        onClose();
        navigate(notification.url);
      }
    } catch (error) {
      // Ignora errori
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      // Svuota lista, azzera contatore e chiudi il modal
      setNotifications([]);
      setUnreadCount(0);
      onClose();
    } catch (error) {}
  };

  const handleDeleteNotification = async (id: number, event: React.MouseEvent) => {
    event.stopPropagation();
    try {
      await deleteNotification(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (error) {}
  };

  const formatRelativeTime = (dateString?: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true, locale: it });
    } catch (error) {
      return '';
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center" 
      style={{ backgroundColor: 'rgba(0,0,0,0.75)' }}
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-[90vw] sm:w-[30vw] max-h-[90vh] overflow-y-auto flex flex-col"
        onClick={e => e.stopPropagation()}
        style={{ position: 'relative', margin: 'auto', maxHeight: '90vh' }}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Notifiche {unreadCount > 0 && `(${unreadCount})`}
          </h3>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-sm text-blue-500 font-medium bg-transparent border-none hover:underline"
              >
                Segna tutte come lette
              </button>
            )}            
          </div>
        </div>
        <div className="overflow-y-auto p-6 flex-1 pb-6">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
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
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`
                    p-4 rounded-2xl transition-all duration-200 relative
                    ${notification.status === 'unread' 
                      ? 'bg-blue-50 dark:bg-blue-900/20' 
                      : 'bg-gray-50 dark:bg-gray-800/50'}
                    hover:bg-gray-100 dark:hover:bg-gray-800/80 cursor-pointer
                  `}
                >
                  {notification.status === 'unread' && (
                    <div className="absolute top-4 right-4 w-2.5 h-2.5 rounded-full bg-blue-500" />
                  )}
                  <h4 className="font-semibold text-gray-900 dark:text-white text-base mb-1 pr-6">
                    {notification.title}
                  </h4>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">
                    {notification.body}
                  </p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatRelativeTime(notification.created_at)}
                    </span>
                    <button
                      onClick={(e) => handleDeleteNotification(notification.id, e)}
                      className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 bg-transparent border-none"
                      aria-label="Elimina notifica"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
} 