import { useCallback, useMemo, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { checkImageStatus, uploadImages } from '../api/images';
import { removeUploadJobFromOutbox, getUploadJobsFromOutbox, saveUploadJobToOutbox } from '../utils/uploadOutbox';
import { UploadFileItem, UploadJob, UploadJobMeta, UploadSummary } from '../types/upload';

const POLL_INTERVAL_MS = 2000;

const createJobId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `upload-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
};

const getJobStatus = (files: UploadFileItem[]): UploadJob['status'] => {
  if (files.some((file) => file.status === 'queued' || file.status === 'processing')) {
    return 'processing';
  }
  if (files.some((file) => file.status === 'failed' || file.status === 'notfound')) {
    return 'failed';
  }
  return 'completed';
};

export const useUploadManager = () => {
  const queryClient = useQueryClient();
  const [jobs, setJobs] = useState<UploadJob[]>([]);
  const timersRef = useRef<Record<string, number>>({});

  const saveJob = useCallback(async (job: UploadJob) => {
    try {
      await saveUploadJobToOutbox(job);
    } catch (error) {
      console.error('Impossibile salvare job upload in outbox:', error);
    }
  }, []);

  const stopPolling = useCallback((timerKey: string) => {
    const timer = timersRef.current[timerKey];
    if (timer) {
      window.clearTimeout(timer);
      delete timersRef.current[timerKey];
    }
  }, []);

  const updateJobFileState = useCallback(
    (jobId: string, fileName: string, updater: (file: UploadFileItem) => UploadFileItem) => {
      setJobs((previousJobs) =>
        previousJobs.map((job) => {
          if (job.id !== jobId) {
            return job;
          }

          const files = job.files.map((file) => (file.fileName === fileName ? updater(file) : file));
          const updatedJob: UploadJob = {
            ...job,
            status: getJobStatus(files),
            files
          };

          void saveJob(updatedJob);
          return updatedJob;
        })
      );
    },
    [saveJob]
  );

  const pollSingleFile = useCallback(
    async (jobId: string, fileName: string, backendJobId: string) => {
      const timerKey = `${jobId}:${backendJobId}`;
      stopPolling(timerKey);

      try {
        const status = await checkImageStatus(backendJobId);
        updateJobFileState(jobId, fileName, (previous) => ({
          ...previous,
          status: status.state,
          progress: status.progress ?? previous.progress,
          message: status.status || previous.message,
          jobId: backendJobId
        }));

        if (status.state === 'completed') {
          queryClient.invalidateQueries({ queryKey: ['gallery'] });
          queryClient.invalidateQueries({ queryKey: ['memories'] });
        }

        if (status.state === 'queued' || status.state === 'processing') {
          timersRef.current[timerKey] = window.setTimeout(() => {
            void pollSingleFile(jobId, fileName, backendJobId);
          }, POLL_INTERVAL_MS);
          return;
        }

        stopPolling(timerKey);
      } catch (error) {
        updateJobFileState(jobId, fileName, (previous) => ({
          ...previous,
          status: 'failed',
          message: 'Errore di rete durante il controllo stato',
          progress: previous.progress,
          jobId: backendJobId
        }));
        stopPolling(timerKey);
      }
    },
    [queryClient, stopPolling, updateJobFileState]
  );

  const enqueueUpload = useCallback(
    async (files: File[], meta?: UploadJobMeta) => {
      const localJobId = createJobId();
      const initialFiles: UploadFileItem[] = files.map((file) => ({
        fileName: file.name,
        status: 'queued',
        progress: 0,
        message: 'In coda',
      }));

      const initialJob: UploadJob = {
        id: localJobId,
        createdAt: Date.now(),
        status: 'queued',
        meta,
        files: initialFiles
      };

      setJobs((previousJobs) => [initialJob, ...previousJobs]);
      void saveJob(initialJob);

      try {
        const uploadResponse = await uploadImages(files, meta?.memoryId);

        const responseByFileName = new Map(uploadResponse.data.map((item) => [item.file, item]));

        setJobs((previousJobs) =>
          previousJobs.map((job) => {
            if (job.id !== localJobId) {
              return job;
            }

            const updatedFiles: UploadFileItem[] = job.files.map((file) => {
              const apiFile = responseByFileName.get(file.fileName);
              if (!apiFile) {
                return {
                  ...file,
                  status: 'failed',
                  progress: 0,
                  message: 'Il server non ha restituito lo stato del file'
                };
              }

              if (!apiFile.success || !apiFile.jobId) {
                return {
                  ...file,
                  status: 'failed',
                  progress: 0,
                  message: apiFile.error || 'Il file non è stato accodato'
                };
              }

              return {
                ...file,
                status: 'processing',
                progress: 0,
                message: 'Inizio processamento',
                jobId: apiFile.jobId
              };
            });

            const updatedJob: UploadJob = {
              ...job,
              files: updatedFiles,
              status: getJobStatus(updatedFiles)
            };

            void saveJob(updatedJob);
            return updatedJob;
          })
        );

        uploadResponse.data.forEach((fileResult) => {
          if (fileResult.success && fileResult.jobId) {
            void pollSingleFile(localJobId, fileResult.file, fileResult.jobId);
          }
        });

        return localJobId;
      } catch (error) {
        setJobs((previousJobs) =>
          previousJobs.map((job) => {
            if (job.id !== localJobId) {
              return job;
            }
            const failedFiles = job.files.map((file) => ({
              ...file,
              status: 'failed' as const,
              message: 'Upload non riuscito. Riprova.',
              progress: 0
            }));
            const failedJob: UploadJob = {
              ...job,
              status: 'failed',
              files: failedFiles
            };
            void saveJob(failedJob);
            return failedJob;
          })
        );
        throw error;
      }
    },
    [pollSingleFile, saveJob]
  );

  const retryFailedFiles = useCallback(
    (jobId: string) => {
      const targetJob = jobs.find((job) => job.id === jobId);
      if (!targetJob) {
        return;
      }

      targetJob.files.forEach((file) => {
        if ((file.status === 'failed' || file.status === 'notfound') && file.jobId) {
          updateJobFileState(jobId, file.fileName, (previous) => ({
            ...previous,
            status: 'queued',
            message: 'Riprovo in background...'
          }));
          void pollSingleFile(jobId, file.fileName, file.jobId);
        }
      });
    },
    [jobs, pollSingleFile, updateJobFileState]
  );

  const cancelJob = useCallback(async (jobId: string) => {
    setJobs((previousJobs) => previousJobs.filter((job) => job.id !== jobId));
    Object.keys(timersRef.current)
      .filter((key) => key.startsWith(`${jobId}:`))
      .forEach((key) => stopPolling(key));
    await removeUploadJobFromOutbox(jobId);
  }, [stopPolling]);

  const clearFinishedJobs = useCallback(async () => {
    const removable = jobs.filter((job) =>
      job.files.every((file) => file.status === 'completed' || file.status === 'failed' || file.status === 'notfound')
    );

    setJobs((previousJobs) =>
      previousJobs.filter((job) => !removable.some((removableJob) => removableJob.id === job.id))
    );

    await Promise.all(removable.map((job) => removeUploadJobFromOutbox(job.id)));
  }, [jobs]);

  const bootstrapPendingJobs = useCallback(async () => {
    const outboxJobs = await getUploadJobsFromOutbox();
    if (!outboxJobs.length) {
      return;
    }

    setJobs((previousJobs) => {
      const existing = new Set(previousJobs.map((job) => job.id));
      const mergeable = outboxJobs.filter((job) => !existing.has(job.id));
      return [...mergeable, ...previousJobs];
    });

    outboxJobs.forEach((job) => {
      job.files.forEach((file) => {
        if ((file.status === 'queued' || file.status === 'processing') && file.jobId) {
          void pollSingleFile(job.id, file.fileName, file.jobId);
        }
      });
    });
  }, [pollSingleFile]);

  const uploadingFiles = useMemo(() => {
    const record: Record<string, UploadFileItem> = {};
    jobs.forEach((job) => {
      job.files.forEach((file) => {
        record[`${job.id}:${file.fileName}`] = file;
      });
    });
    return record;
  }, [jobs]);

  const summary: UploadSummary = useMemo(() => {
    const allFiles = jobs.flatMap((job) => job.files);
    const total = allFiles.length;
    if (!total) {
      return { total: 0, completed: 0, failed: 0, inProgress: 0, progress: 0 };
    }

    const completed = allFiles.filter((file) => file.status === 'completed').length;
    const failed = allFiles.filter((file) => file.status === 'failed' || file.status === 'notfound').length;
    const inProgress = total - completed - failed;
    const progress = Math.round(allFiles.reduce((acc, file) => acc + file.progress, 0) / total);

    return {
      total,
      completed,
      failed,
      inProgress,
      progress
    };
  }, [jobs]);

  return {
    jobs,
    summary,
    uploadingFiles,
    hasActiveUploads: jobs.some((job) => job.files.some((file) => file.status === 'queued' || file.status === 'processing')),
    enqueueUpload,
    retryFailedFiles,
    cancelJob,
    clearFinishedJobs,
    bootstrapPendingJobs
  };
};
