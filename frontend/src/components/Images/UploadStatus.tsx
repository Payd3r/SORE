import { useState } from 'react';

interface UploadFile {
  fileName: string;
  status: 'queued' | 'processing' | 'completed' | 'failed' | 'notfound';
  progress: number;
  message: string;
}

interface UploadStatusProps {
  show: boolean;
  onClose: () => void;
  uploadingFiles: {
    [key: string]: UploadFile;
  };
}

export default function UploadStatus({ show, uploadingFiles }: UploadStatusProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  
  if (!show || Object.keys(uploadingFiles).length === 0) return null;

  const filesCount = Object.keys(uploadingFiles).length;
  const completedCount = Object.values(uploadingFiles).filter(file => file.status === 'completed').length;

  return (
    <div className={`fixed z-50 transition-all duration-300 ease-in-out
      md:bottom-4 md:right-4 md:max-w-md md:w-full
      bottom-0 right-0 left-0 w-full
      ${isExpanded ? 'translate-y-0' : 'translate-y-[calc(100%-3rem)]'}`}
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white dark:bg-gray-800 rounded-full p-1.5 shadow-md border border-gray-200/50 dark:border-gray-700/50 md:hidden z-[51] flex items-center justify-center"
      >
        <svg
          className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </svg>
      </button>

      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-t-2xl md:rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 w-full">
        <div className="p-4">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">
              Caricamento immagini in corso...
            </h3>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {completedCount}/{filesCount}
            </span>
          </div>
          <div className={`space-y-4 overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-[60vh] md:max-h-[40vh] overflow-y-auto' : 'max-h-0'}`}>
            {Object.entries(uploadingFiles).map(([fileName, file]) => (
              <div key={fileName} className="flex flex-col">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate max-w-[70%]">
                    {fileName}
                  </span>
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    {file.status === 'completed' ? '100%' : 
                     file.status === 'failed' ? 'Errore' :
                     `${file.progress}%`}
                  </span>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 font-medium">
                  {file.message}
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1">
                  <div
                    className={`h-1 rounded-full transition-all duration-300 ${
                      file.status === 'completed' ? 'bg-emerald-500 dark:bg-emerald-400' :
                      file.status === 'failed' ? 'bg-red-500 dark:bg-red-400' :
                      'bg-blue-500 dark:bg-blue-400'
                    }`}
                    style={{ 
                      width: `${file.progress}%`,
                      transition: 'width 0.3s ease-in-out'
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 