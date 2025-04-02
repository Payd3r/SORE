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

  const modalContent = (
    <div 
      className="fixed inset-0 z-[9999]"
      style={{ 
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        height: '100vh',
        width: '100vw',
        position: 'fixed',
        top: 0,
        left: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-gray-800 mx-4 sm:mx-0 rounded-lg shadow-xl w-[90vw] sm:w-[40vw] w-full max-h-[60vh] sm:max-h-[90vh] overflow-y-auto upload-status-modal"
        onClick={e => e.stopPropagation()}
        style={{
          position: 'relative',
          margin: 'auto',
          maxWidth: 'calc(100vw - 2rem)',
        }}
      >
        {/* Header */}
        <div className="flex-none px-4 py-3 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Stato Caricamento
          </h2>          
        </div>

        {/* Content */}
        <div className="flex-1 px-4 py-3 space-y-3 overflow-y-auto" style={{ maxHeight: 'calc(80vh - 8rem)' }}>
          {Object.entries(uploadingFiles).map(([fileName, file]) => (
            <div
              key={fileName}
              className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
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
                  className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${file.progress}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                {file.message}
              </p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex-none border-t border-gray-200 dark:border-gray-800 px-3 py-2 sm:px-4 sm:py-3">
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