import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface UploadStatusProps {
  show: boolean;
  uploadingFiles: {
    [key: string]: {
      fileName: string;
      status: 'queued' | 'processing' | 'completed' | 'failed' | 'notfound';
      progress: number;
      message: string;
    }
  };
  onClose: () => void;
}

export default function UploadStatus({ show, uploadingFiles, onClose }: UploadStatusProps) {
  const [isVisible, setIsVisible] = useState(show);

  useEffect(() => {
    setIsVisible(show);
    if (show) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [show]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (target.closest('.upload-status-modal') === null) {
        onClose();
      }
    };

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  // Ordina i file per stato
  const sortedFiles = Object.entries(uploadingFiles).sort(([, a], [, b]) => {
    // Definisci l'ordine di priorità degli stati
    const priority: { [key: string]: number } = {
      'processing': 0,
      'queued': 1,
      'failed': 2,
      'notfound': 3,
      'completed': 4
    };
    
    return priority[a.status] - priority[b.status];
  });

  const modalContent = (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.75)' }}
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-gray-800 mx-4 sm:mx-0 rounded-lg shadow-xl w-[90vw] sm:w-[40vw] flex flex-col upload-status-modal"
        style={{
          maxHeight: '90vh',
          maxWidth: 'calc(100vw - 2rem)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex-none px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Stato Caricamento
            </h2>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              ({Object.keys(uploadingFiles).length} file)
            </span>
          </div>
        </div>

        {/* Content - Scroll solo qui */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-4 py-3 space-y-3">
            {sortedFiles.map(([fileName, file]) => (
              <div
                key={fileName}
                className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4"
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
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {file.status === 'queued' && 'In coda...'}
                    {file.status === 'processing' && `${Math.round(file.progress)}%`}
                    {file.status === 'completed' && 'Completato'}
                    {file.status === 'failed' && 'Errore'}
                    {file.status === 'notfound' && 'Non trovato'}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full transition-all duration-300 ${
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

        {/* Footer */}
        <div className="flex-none px-4 py-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Chiudi
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
} 