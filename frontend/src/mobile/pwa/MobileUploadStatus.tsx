import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useUpload } from '../../contexts/UploadContext';
import { getNotifications } from '../../api/notifications';

export default function MobileUploadStatus() {
  const { uploadingFiles, setUploadingFiles, hasActiveUploads } = useUpload();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);
  
  // Aggiorna la visibilità del button fisso quando cambia hasActiveUploads
  useEffect(() => {
    // Se non ci sono più upload attivi, chiudiamo il modale
    if (!hasActiveUploads && isModalOpen) {
      setIsModalOpen(false);
    }
  }, [hasActiveUploads, isModalOpen]);
  
  // Controlla se ci sono notifiche non lette
  useEffect(() => {
    // Verifica se ci sono notifiche non lette all'avvio
    checkUnreadNotifications();
    
    // Imposta un intervallo per controllare periodicamente le nuove notifiche
    const intervalId = setInterval(checkUnreadNotifications, 30000); // ogni 30 secondi
    
    return () => clearInterval(intervalId);
  }, []);
  
  // Funzione per verificare se ci sono notifiche non lette
  const checkUnreadNotifications = async () => {
    try {
      const response = await getNotifications(1, 0); // Richiedi solo 1 notifica, ci interessa solo il conteggio
      setHasUnreadNotifications(response.unread > 0);
    } catch (error) {
      console.error('Errore nel recupero delle notifiche:', error);
    }
  };
  
  // Se non ci sono upload attivi, non mostriamo nulla
  if (!hasActiveUploads) return null;
  
  // Ordina i file per status (in elaborazione -> in coda -> completati -> falliti)
  const sortedFiles = Object.entries(uploadingFiles).sort(([, a], [, b]) => {
    const getStatusPriority = (status: string) => {
      switch (status) {
        case 'processing': return 0;
        case 'queued': return 1;
        case 'completed': return 2;
        case 'failed': return 3;
        case 'notfound': return 4;
        default: return 5;
      }
    };
    return getStatusPriority(a.status) - getStatusPriority(b.status);
  });
  
  // Calcola lo stato complessivo di avanzamento
  const totalProgress = sortedFiles.reduce((acc, [, file]) => acc + file.progress, 0) / (sortedFiles.length || 1);
  const allCompleted = sortedFiles.every(([, file]) => file.status === 'completed');
  const hasFailed = sortedFiles.some(([, file]) => file.status === 'failed' || file.status === 'notfound');
  
  // Stato da mostrare nel badge del bottone
  const getStatusIndicator = () => {
    if (hasFailed) return '❌';
    if (allCompleted) return '✓';
    return `${Math.round(totalProgress)}%`;
  };
  
  // Chiudi tutti gli upload
  const handleClearAll = () => {
    setUploadingFiles({});
    setIsModalOpen(false);
  };
  
  // Posizione del bottone in base alla presenza di notifiche
  const buttonPosition = hasUnreadNotifications ? 'bottom-32' : 'bottom-20';
  
  // Contenuto del bottone fisso
  const uploadButton = (
    <button 
      onClick={() => setIsModalOpen(true)}
      className={`fixed ${buttonPosition} right-4 z-50 flex items-center justify-center w-12 h-12 rounded-full shadow-lg ${
        hasFailed ? 'bg-red-500' : allCompleted ? 'bg-green-500' : 'bg-blue-500'
      } text-white`}
    >
      <div className="flex flex-col items-center justify-center">
        <svg 
          className={`w-5 h-5 ${allCompleted ? '' : 'animate-pulse'}`}
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        <span className="text-xs mt-0.5 font-bold">{getStatusIndicator()}</span>
      </div>
    </button>
  );
  
  // Contenuto del modale
  const modalContent = isModalOpen && createPortal(
    <div className="fixed inset-0 z-[9999] overflow-y-auto bg-black bg-opacity-75 flex flex-col">
      <div className="bg-white dark:bg-gray-900 rounded-t-2xl mt-auto max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Caricamento in corso
          </h3>
          <button 
            onClick={() => setIsModalOpen(false)}
            className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            <svg className="w-6 h-6 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Corpo con lista file */}
        <div className="overflow-y-auto p-4 flex-1">
          <div className="space-y-3">
            {sortedFiles.map(([fileName, file]) => (
              <div
                key={fileName}
                className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 shadow-sm"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${
                      file.status === 'processing' ? 'bg-blue-500 animate-pulse' :
                      file.status === 'completed' ? 'bg-green-500' :
                      file.status === 'failed' ? 'bg-red-500' :
                      file.status === 'notfound' ? 'bg-orange-500' :
                      'bg-gray-500'
                    }`} />
                    <span className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[200px]">
                      {fileName}
                    </span>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300">
                    {file.status === 'queued' && 'In coda...'}
                    {file.status === 'processing' && `${Math.round(file.progress)}%`}
                    {file.status === 'completed' && 'Completato'}
                    {file.status === 'failed' && 'Errore'}
                    {file.status === 'notfound' && 'Non trovato'}
                  </span>
                </div>
                
                <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      file.status === 'processing' ? 'bg-blue-500' :
                      file.status === 'completed' ? 'bg-green-500' :
                      file.status === 'failed' ? 'bg-red-500' :
                      file.status === 'notfound' ? 'bg-orange-500' :
                      'bg-gray-500'
                    }`}
                    style={{ width: `${file.progress}%` }}
                  />
                </div>
                
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  {file.message}
                </p>
              </div>
            ))}
          </div>
        </div>
        
        {/* Footer con pulsanti */}
        <div className="border-t border-gray-200 dark:border-gray-800 p-4">
          <div className="flex justify-between gap-3">
            <button
              onClick={() => setIsModalOpen(false)}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              Chiudi
            </button>
            <button
              onClick={handleClearAll}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600"
            >
              {allCompleted ? 'Fatto' : 'Annulla'}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
  
  return (
    <>
      {uploadButton}
      {modalContent}
    </>
  );
} 