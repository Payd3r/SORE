import { Memory } from '../../api/memory';

interface GalleriaRicordoProps {
  memory: Memory;
  uploadingFiles: {
    [key: string]: {
      fileName: string;
      status: 'queued' | 'processing' | 'completed' | 'failed' | 'notfound';
      progress: number;
      message: string;
    }
  };
  setUploadingFiles: React.Dispatch<React.SetStateAction<{
    [key: string]: {
      fileName: string;
      status: 'queued' | 'processing' | 'completed' | 'failed' | 'notfound';
      progress: number;
      message: string;
    }
  }>>;
  showUploadStatus: boolean;
  setShowUploadStatus: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function GalleriaRicordo({
  memory,
  uploadingFiles,
  setUploadingFiles,
  showUploadStatus,
  setShowUploadStatus
}: GalleriaRicordoProps) {
  // ... resto del codice ...

  return (
    <div>
      {/* Aggiungi il pulsante per mostrare lo stato dell'upload se ci sono file in caricamento */}
      {Object.keys(uploadingFiles).length > 0 && (
        <button
          onClick={() => setShowUploadStatus(true)}
          className="mb-4 flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors focus:outline-none"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          <span>Stato Upload</span>
        </button>
      )}

      {/* ... resto del JSX ... */}
    </div>
  );
} 