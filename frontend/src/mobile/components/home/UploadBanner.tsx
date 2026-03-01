import type { UploadSummary } from "../../../types/upload";

type UploadBannerProps = {
  summary: UploadSummary;
  hasActiveUploads: boolean;
  onClick: () => void;
};

function getBannerLabel(summary: UploadSummary, hasActive: boolean): string {
  if (hasActive && summary.inProgress > 0) {
    const pct = summary.total > 0 ? Math.round(summary.progress) : 0;
    return `${summary.inProgress} ${summary.inProgress === 1 ? "file" : "file"} in caricamento${pct > 0 ? ` · ${pct}%` : ""}`;
  }
  if (summary.completed > 0 && summary.failed === 0) {
    return `Caricamento completato (${summary.completed} ${summary.completed === 1 ? "file" : "file"})`;
  }
  if (summary.failed > 0) {
    return `${summary.failed} ${summary.failed === 1 ? "file non caricato" : "file non caricati"}. Tocca per dettagli`;
  }
  return "Caricamento in corso...";
}

export default function UploadBanner({
  summary,
  hasActiveUploads,
  onClick,
}: UploadBannerProps) {
  const label = getBannerLabel(summary, hasActiveUploads);
  const isComplete = !hasActiveUploads && summary.completed > 0 && summary.failed === 0;
  const hasFailed = summary.failed > 0;

  return (
    <button
      type="button"
      className={`pwa-upload-banner ${hasFailed ? "pwa-upload-banner-error" : ""} ${isComplete ? "pwa-upload-banner-success" : ""}`}
      onClick={onClick}
      aria-label="Dettaglio caricamento"
    >
      <span className="material-symbols-outlined pwa-upload-banner-icon">
        {hasFailed ? "error" : isComplete ? "check_circle" : "cloud_upload"}
      </span>
      <span className="pwa-upload-banner-label">{label}</span>
      {!isComplete && (
        <span className="material-symbols-outlined pwa-upload-banner-chevron">
          expand_less
        </span>
      )}
    </button>
  );
}
