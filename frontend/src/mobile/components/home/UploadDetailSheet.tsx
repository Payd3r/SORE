import { useEffect, useRef } from "react";
import type { UploadJob, UploadFileItem, UploadSummary } from "../../../types/upload";

type UploadDetailSheetProps = {
  jobs: UploadJob[];
  summary?: UploadSummary;
  onClose: () => void;
  onRetry: (jobId: string) => void;
  onCancelJob: (jobId: string) => void;
  onClearFinished: () => void;
};

function fileStatusLabel(status: UploadFileItem["status"]): string {
  switch (status) {
    case "queued":
      return "In coda";
    case "processing":
      return "In caricamento";
    case "completed":
      return "Completato";
    case "failed":
    case "notfound":
      return "Non caricato";
    default:
      return status;
  }
}

function fileStatusIcon(status: UploadFileItem["status"]): string {
  switch (status) {
    case "queued":
      return "schedule";
    case "processing":
      return "sync";
    case "completed":
      return "check_circle";
    case "failed":
    case "notfound":
      return "error";
    default:
      return "help";
  }
}

export default function UploadDetailSheet({
  jobs,
  summary,
  onClose,
  onRetry,
  onCancelJob,
  onClearFinished,
}: UploadDetailSheetProps) {
  const allJobsFinished =
    jobs.length > 0 &&
    jobs.every((job) =>
      job.files.every(
        (f) =>
          f.status === "completed" || f.status === "failed" || f.status === "notfound"
      )
    );

  const clearedRef = useRef(false);
  useEffect(() => {
    if (!allJobsFinished || clearedRef.current) return;
    clearedRef.current = true;
    const t = setTimeout(() => {
      onClearFinished();
      onClose();
    }, 800);
    return () => clearTimeout(t);
  }, [allJobsFinished, onClearFinished, onClose]);

  const progress = summary?.progress ?? 0;
  const total = summary?.total ?? 0;
  const completed = summary?.completed ?? 0;

  return (
    <div className="pwa-upload-detail-sheet">
      <div className="pwa-upload-detail-header">
        <h2 className="pwa-upload-detail-title">Caricamento</h2>
      </div>

      {total > 0 && (
        <div className="pwa-upload-detail-progress-wrap" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} aria-label="Avanzamento caricamento">
          <div className="pwa-upload-detail-progress-track">
            <div className="pwa-upload-detail-progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <p className="pwa-upload-detail-progress-text">{completed} di {total} file</p>
        </div>
      )}

      <div className="pwa-upload-detail-list pwa-upload-detail-list-plain">
        {jobs.map((job) => {
          const canRetry = job.files.some(
            (f) => f.status === "failed" || f.status === "notfound"
          );
          const allDone = job.files.every(
            (f) =>
              f.status === "completed" ||
              f.status === "failed" ||
              f.status === "notfound"
          );

          return (
            <div key={job.id} className="pwa-upload-detail-item">
              <div className="pwa-upload-detail-item-head">
                <span className="pwa-upload-detail-item-files-count">
                  {job.files.length} {job.files.length === 1 ? "file" : "file"}
                </span>
                <div className="pwa-upload-detail-item-actions">
                  {canRetry && (
                    <button
                      type="button"
                      className="pwa-upload-detail-action"
                      onClick={() => onRetry(job.id)}
                    >
                      Riprova
                    </button>
                  )}
                  {!allDone && (
                    <button
                      type="button"
                      className="pwa-upload-detail-action pwa-upload-detail-action-danger"
                      onClick={() => onCancelJob(job.id)}
                    >
                      Annulla
                    </button>
                  )}
                </div>
              </div>
              <ul className="pwa-upload-detail-files">
                {job.files.map((file) => (
                  <li key={file.fileName} className="pwa-upload-detail-file">
                    <span
                      className={`material-symbols-outlined pwa-upload-detail-file-icon pwa-upload-detail-file-icon-${file.status}`}
                    >
                      {fileStatusIcon(file.status)}
                    </span>
                    <div className="pwa-upload-detail-file-info">
                      <span className="pwa-upload-detail-file-name">
                        {file.fileName}
                      </span>
                      <span className="pwa-upload-detail-file-status">
                        {fileStatusLabel(file.status)}
                        {file.status === "processing" && file.progress > 0 && ` · ${file.progress}%`}
                        {file.message && file.status !== "queued" && ` · ${file.message}`}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

    </div>
  );
}
