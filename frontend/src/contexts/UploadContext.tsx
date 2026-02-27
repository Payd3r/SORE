import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useUploadManager } from '../hooks/useUploadManager';
import { UploadFileItem, UploadJob, UploadJobMeta, UploadSummary } from '../types/upload';

type UploadingFileRecord = Record<string, UploadFileItem>;

interface UploadContextType {
  uploadingFiles: UploadingFileRecord;
  setUploadingFiles: React.Dispatch<React.SetStateAction<UploadingFileRecord>>;
  showUploadStatus: boolean;
  setShowUploadStatus: React.Dispatch<React.SetStateAction<boolean>>;
  hasActiveUploads: boolean;
  jobs: UploadJob[];
  summary: UploadSummary;
  enqueueUpload: (files: File[], meta?: UploadJobMeta) => Promise<string>;
  retryFailedFiles: (jobId: string) => void;
  cancelJob: (jobId: string) => Promise<void>;
  clearFinishedJobs: () => Promise<void>;
  bootstrapPendingJobs: () => Promise<void>;
}

const UploadContext = createContext<UploadContextType | undefined>(undefined);

export function UploadProvider({ children }: { children: React.ReactNode }) {
  const manager = useUploadManager();
  const [legacyUploadingFiles, setLegacyUploadingFiles] = useState<UploadingFileRecord>({});
  const [showUploadStatus, setShowUploadStatus] = useState(false);

  // Compatibilità con i componenti legacy che salvano direttamente lo stato file.
  useEffect(() => {
    const savedUploadingFiles = localStorage.getItem('uploadingFiles-legacy');
    if (savedUploadingFiles) {
      try {
        setLegacyUploadingFiles(JSON.parse(savedUploadingFiles));
      } catch {
        localStorage.removeItem('uploadingFiles-legacy');
      }
    }
  }, []);

  useEffect(() => {
    if (Object.keys(legacyUploadingFiles).length > 0) {
      localStorage.setItem('uploadingFiles-legacy', JSON.stringify(legacyUploadingFiles));
    } else {
      localStorage.removeItem('uploadingFiles-legacy');
    }
  }, [legacyUploadingFiles]);

  const uploadingFiles = useMemo(
    () => ({ ...legacyUploadingFiles, ...manager.uploadingFiles }),
    [legacyUploadingFiles, manager.uploadingFiles]
  );

  const setUploadingFiles = useCallback<React.Dispatch<React.SetStateAction<UploadingFileRecord>>>((updater) => {
    setLegacyUploadingFiles((previous) => (typeof updater === 'function' ? updater(previous) : updater));
  }, []);

  const hasActiveUploads =
    manager.hasActiveUploads ||
    Object.values(legacyUploadingFiles).some((file) => file.status === 'queued' || file.status === 'processing');

  return (
    <UploadContext.Provider
      value={{
        uploadingFiles,
        setUploadingFiles,
        showUploadStatus,
        setShowUploadStatus,
        hasActiveUploads,
        jobs: manager.jobs,
        summary: manager.summary,
        enqueueUpload: manager.enqueueUpload,
        retryFailedFiles: manager.retryFailedFiles,
        cancelJob: manager.cancelJob,
        clearFinishedJobs: manager.clearFinishedJobs,
        bootstrapPendingJobs: manager.bootstrapPendingJobs
      }}
    >
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