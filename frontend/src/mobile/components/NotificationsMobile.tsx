import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { 
  getNotifications, 
  markAsRead, 
  markAllAsRead, 
  deleteNotification,
  Notification 
} from '../../api/notifications';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';

interface NotificationsMobileProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationsMobile({ isOpen, onClose }: NotificationsMobileProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [_totalCount, setTotalCount] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const modalContentRef = useRef<HTMLDivElement>(null);
  const dragHandleRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  
  // Stati per la gesture di swipe
  const touchStartY = useRef<number | null>(null);
  const isDragging = useRef<boolean>(false);

  // Carica le notifiche quando il componente si monta o il modale viene aperto
  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
      
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
  }, [isOpen]);

  // Gestisce il click sullo sfondo per chiudere il modale
  const handleBackdropClick = (e: React.MouseEvent) => {
    // Chiudi il modale solo se il click è sullo sfondo e non sul contenuto
    if (modalContentRef.current && !modalContentRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  // Blocca la propagazione degli eventi touch
  const handleTouchEvent = (e: React.TouchEvent) => {
    // Stoppa la propagazione dell'evento al componente genitore
    e.stopPropagation();
  };
  
  // Gestisce l'inizio del touch sull'indicatore di trascinamento
  const handleDragStart = (e: React.TouchEvent) => {
    // Memorizza la posizione iniziale del touch
    touchStartY.current = e.touches[0].clientY;
    isDragging.current = true;
    
    // Previeni la propagazione dell'evento
    e.stopPropagation();
  };
  
  // Gestisce il movimento del touch durante il trascinamento
  const handleDragMove = (e: React.TouchEvent) => {
    // Se non è in corso un trascinamento o non abbiamo un punto di partenza, esci
    if (!isDragging.current || touchStartY.current === null) return;
    
    // Posizione attuale del touch
    const touchY = e.touches[0].clientY;
    
    // Calcola la distanza percorsa
    const deltaY = touchY - touchStartY.current;
    
    // Se il movimento è verso il basso e significativo, applica una trasformazione al modale
    if (deltaY > 0) {
      if (modalContentRef.current) {
        // Limita lo spostamento per evitare che il modale scompaia troppo velocemente
        const clampedDelta = Math.min(deltaY, 200);
        modalContentRef.current.style.transform = `translateY(${clampedDelta}px)`;
        
        // Riduce l'opacità man mano che il modale viene trascinato verso il basso
        const opacity = Math.max(0.5, 1 - (clampedDelta / 200));
        modalContentRef.current.style.opacity = opacity.toString();
      }
    }
    
    // Previeni la propagazione dell'evento
    e.stopPropagation();
  };
  
  // Gestisce la fine del touch
  const handleDragEnd = (e: React.TouchEvent) => {
    // Se non è in corso un trascinamento o non abbiamo un punto di partenza, esci
    if (!isDragging.current || touchStartY.current === null) return;
    
    // Determina se il modale deve chiudersi in base alla distanza percorsa
    if (modalContentRef.current) {
      const currentTransform = modalContentRef.current.style.transform;
      const match = currentTransform.match(/translateY\((\d+)px\)/);
      
      if (match) {
        const translateY = parseInt(match[1]);
        
        // Se è stato trascinato per più di 100px, chiudi il modale
        if (translateY > 100) {
          onClose();
        } else {
          // Altrimenti ripristina la posizione
          modalContentRef.current.style.transform = '';
          modalContentRef.current.style.opacity = '1';
        }
      }
    }
    
    // Resetta lo stato del trascinamento
    touchStartY.current = null;
    isDragging.current = false;
    
    // Previeni la propagazione dell'evento
    e.stopPropagation();
  };

  // Funzione per recuperare le notifiche
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await getNotifications(50, 0);
      setNotifications(response.notifications);
      setTotalCount(response.total);
      setUnreadCount(response.unread);
    } catch (error) {
      console.error('Errore nel recupero delle notifiche:', error);
    } finally {
      setLoading(false);
    }
  };

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
      setUnreadCount(prev => Math.max(0, prev - 1));
      
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
      // Aggiorna lo stato locale: svuota lista, azzera counter e chiudi bottom sheet
      setNotifications([]);
      setUnreadCount(0);
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
      setTotalCount(prev => Math.max(0, prev - 1));
      
      // Se era non letta, aggiorna anche il contatore delle non lette
      const wasUnread = notifications.find(n => n.id === id)?.status === 'unread';
      if (wasUnread) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
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
    <div 
      className="fixed inset-0 z-[9999] overflow-hidden bg-black/50 backdrop-blur-sm flex flex-col"
      onClick={handleBackdropClick}
      onTouchStart={handleTouchEvent}
      onTouchMove={handleTouchEvent}
      onTouchEnd={handleTouchEvent}
    >
      <div 
        ref={modalContentRef}
        className="bg-white dark:bg-gray-900 rounded-t-3xl mt-auto max-h-[80vh] flex flex-col transition-transform duration-200"
        onClick={e => e.stopPropagation()} // Previeni che il click si propaghi allo sfondo
      >
        {/* Indicatore di trascinamento */}
        <div 
          ref={dragHandleRef}
          className="flex justify-center py-2 cursor-grab active:cursor-grabbing touch-none"
          onTouchStart={handleDragStart}
          onTouchMove={handleDragMove}
          onTouchEnd={handleDragEnd}
        >
          <div className="w-12 h-1 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
        </div>
        
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Notifiche {unreadCount > 0 && `(${unreadCount})`}
          </h3>
          
          {unreadCount > 0 && (
            <button 
              onClick={handleMarkAllAsRead}
              className="text-sm text-blue-500 font-medium bg-transparent border-none"
            >
              Segna tutte come lette
            </button>
          )}
        </div>
        
        {/* Corpo con lista notifiche */}
        <div className="overflow-y-auto p-4 flex-1 pb-6">
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