import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useUpload } from '../../contexts/UploadContext';
import { getUploadStatusLabel, getUploadStatusMessage } from '../../utils/uploadCopy';

export default function MobileUploadStatus() {
  const { jobs, summary, hasActiveUploads, retryFailedFiles, cancelJob, clearFinishedJobs } = useUpload();
  const [isOpen, setIsOpen] = useState(false);

  const hasFailures = summary.failed > 0;
  const isCompleted = summary.total > 0 && summary.completed + summary.failed === summary.total;

  const headline = useMemo(() => {
    if (hasFailures) {
      return `${summary.failed} file con errore`;
    }
    if (isCompleted) {
      return 'Upload completato';
    }
    return `Caricamento ${summary.progress}%`;
  }, [hasFailures, isCompleted, summary.failed, summary.progress]);

  if (!hasActiveUploads && summary.total === 0) {
    return null;
  }

  return (
    <>
      <motion.button
        type="button"
        onClick={() => setIsOpen(true)}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`fixed bottom-20 left-4 right-4 z-[70] rounded-2xl border px-4 py-3 text-left shadow-lg backdrop-blur-xl ${
          hasFailures
            ? 'border-red-200 bg-red-50/85 dark:border-red-900/40 dark:bg-red-900/30'
            : 'border-white/70 bg-white/80 dark:border-gray-700 dark:bg-gray-900/85'
        }`}
      >
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">{headline}</p>
            <p className="text-xs text-gray-500 dark:text-gray-300">
              {summary.completed}/{summary.total} completati
            </p>
          </div>
          <div className="h-10 w-10 rounded-full border border-white/80 bg-white/70 p-1 dark:border-gray-700 dark:bg-gray-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#0a84ff] to-[#5ac8fa] transition-all"
              style={{ width: `${Math.max(12, summary.progress)}%` }}
            />
          </div>
        </div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-[90] bg-black/45"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 240 }}
              className="absolute bottom-0 left-0 right-0 max-h-[80vh] rounded-t-3xl bg-[#f8f8fb] p-4 dark:bg-gray-950"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-gray-300 dark:bg-gray-700" />
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Upload in background</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Controlla lo stato file e gestisci retry/cancellazioni.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-full bg-gray-200 px-3 py-1 text-xs font-semibold text-gray-600 dark:bg-gray-800 dark:text-gray-300"
                >
                  Chiudi
                </button>
              </div>

              <div className="space-y-3 overflow-auto pb-2">
                {jobs.map((job) => (
                  <div key={job.id} className="rounded-2xl bg-white p-3 shadow-sm dark:bg-gray-900">
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-xs font-semibold text-gray-700 dark:text-gray-200">
                        Job {job.id.slice(0, 8)} · {job.files.length} file
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => retryFailedFiles(job.id)}
                          className="rounded-full bg-[#d7ebff] px-2 py-1 text-[11px] font-medium text-[#0a84ff] dark:bg-blue-900/40 dark:text-blue-300"
                        >
                          Riprova falliti
                        </button>
                        <button
                          type="button"
                          onClick={() => void cancelJob(job.id)}
                          className="rounded-full bg-red-50 px-2 py-1 text-[11px] font-medium text-red-500 dark:bg-red-900/30"
                        >
                          Annulla
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {job.files.map((file) => (
                        <div key={`${job.id}-${file.fileName}`} className="rounded-xl bg-gray-50 p-2 dark:bg-gray-800">
                          <div className="mb-1 flex items-center justify-between gap-2">
                            <p className="truncate text-xs font-medium text-gray-700 dark:text-gray-200">{file.fileName}</p>
                            <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-gray-500 dark:bg-gray-700 dark:text-gray-200">
                              {getUploadStatusLabel(file.status)}
                            </span>
                          </div>
                          <div className="h-1.5 rounded-full bg-gray-200 dark:bg-gray-700">
                            <div
                              className={`h-full rounded-full transition-all ${
                                file.status === 'failed' || file.status === 'notfound' ? 'bg-red-500' : 'bg-[#0a84ff]'
                              }`}
                              style={{ width: `${Math.max(6, file.progress)}%` }}
                            />
                          </div>
                          <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">
                            {getUploadStatusMessage(file.status, file.message)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => void clearFinishedJobs()}
                className="mt-4 w-full rounded-2xl bg-gradient-to-r from-[#0a84ff] to-[#5ac8fa] px-4 py-3 text-sm font-semibold text-white"
              >
                Pulisci upload completati
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
