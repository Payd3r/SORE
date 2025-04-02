import React, { createContext, useContext, useState, useEffect } from 'react';

interface UploadingFile {
  fileName: string;
  status: 'queued' | 'processing' | 'completed' | 'failed' | 'notfound';
  progress: number;
  message: string;
}

interface UploadContextType {
  uploadingFiles: { [key: string]: UploadingFile };
  setUploadingFiles: React.Dispatch<React.SetStateAction<{ [key: string]: UploadingFile }>>;
  showUploadStatus: boolean;
  setShowUploadStatus: React.Dispatch<React.SetStateAction<boolean>>;
  hasActiveUploads: boolean;
}

const UploadContext = createContext<UploadContextType | undefined>(undefined);

export function UploadProvider({ children }: { children: React.ReactNode }) {
  const [uploadingFiles, setUploadingFiles] = useState<{ [key: string]: UploadingFile }>({});
  const [showUploadStatus, setShowUploadStatus] = useState(false);

  // Carica lo stato iniziale dal localStorage
  useEffect(() => {
    const savedUploadingFiles = localStorage.getItem('uploadingFiles');
    const savedShowUploadStatus = localStorage.getItem('isUploading');
    
    if (savedUploadingFiles) {
      setUploadingFiles(JSON.parse(savedUploadingFiles));
    }
    if (savedShowUploadStatus === 'true') {
      setShowUploadStatus(true);
    }
  }, []);

  // Salva lo stato nel localStorage quando cambia
  useEffect(() => {
    if (Object.keys(uploadingFiles).length > 0) {
      localStorage.setItem('uploadingFiles', JSON.stringify(uploadingFiles));
      localStorage.setItem('isUploading', 'true');
    } else {
      localStorage.removeItem('uploadingFiles');
      localStorage.removeItem('isUploading');
    }
  }, [uploadingFiles]);

  const hasActiveUploads = Object.keys(uploadingFiles).length > 0;

  return (
    <UploadContext.Provider value={{
      uploadingFiles,
      setUploadingFiles,
      showUploadStatus,
      setShowUploadStatus,
      hasActiveUploads
    }}>
      {children}
    </UploadContext.Provider>
  );
}

export function useUpload() {
  const context = useContext(UploadContext);
  if (context === undefined) {
    throw new Error('useUpload must be used within an UploadProvider');
  }
  return context;
} 