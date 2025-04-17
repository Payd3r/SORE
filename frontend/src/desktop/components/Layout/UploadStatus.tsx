import React from 'react';
import { createPortal } from 'react-dom';

interface UploadingFile {
  fileName: string;
  status: 'queued' | 'processing' | 'completed' | 'failed' | 'notfound';
  progress: number;
  message: string;
}

interface UploadStatusProps {
  show: boolean;
  uploadingFiles: Record<string, UploadingFile>;
  onClose: () => void;
}

const UploadStatus: React.FC<UploadStatusProps> = ({ show, uploadingFiles, onClose }) => {
  return createPortal(
    <div className={`fixed bottom-0 left-0 right-0 max-h-[70vh] z-[100] transition-all duration-300 ease-in-out 
      ${show ? 'translate-y-0' : 'translate-y-full'}`}
      style={{ touchAction: 'pan-x' }}
    >
      <div className="bg-white dark:bg-gray-800 rounded-t-2xl shadow-lg p-4 pb-safe-bottom scroll-touch" 
           style={{ maxHeight: 'calc(70vh)', overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Upload in corso</h3>
          <button 
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-full focus:outline-none touch-target"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="space-y-4">
          {Object.entries(uploadingFiles).map(([fileName, fileStatus]) => (
            <div key={fileName} 
                 className="bg-gray-50 dark:bg-gray-700/40 rounded-lg p-3 shadow-sm"
                 style={{ touchAction: 'pan-x' }}>
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1 pr-2">
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                    {fileName}
                  </div>
                </div>
                <div className={`px-2 py-1 text-xs font-semibold rounded-full 
                  ${fileStatus.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-400' : 
                    fileStatus.status === 'processing' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-400' : 
                    fileStatus.status === 'failed' ? 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-400' : 
                    'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'}`}>
                  {fileStatus.status === 'queued' && 'In coda'}
                  {fileStatus.status === 'processing' && 'In elaborazione'}
                  {fileStatus.status === 'completed' && 'Completato'}
                  {fileStatus.status === 'failed' && 'Errore'}
                </div>
              </div>
              
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                {fileStatus.message}
              </div>
              
              <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full ${
                    fileStatus.status === 'completed' ? 'bg-green-500' : 
                    fileStatus.status === 'failed' ? 'bg-red-500' : 
                    'bg-blue-500'
                  }`}
                  style={{ width: `${fileStatus.progress}%`, transition: 'width 0.3s ease' }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default UploadStatus; 