import { useUpload } from '../../../contexts/UploadContext';
import MaterialIcon from '../ui/MaterialIcon';

export default function HomeUploadBar() {
  const { hasActiveUploads, summary } = useUpload();

  if (!hasActiveUploads || summary.total === 0) {
    return null;
  }

  const progress = Math.min(100, Math.max(0, summary.progress));

  return (
    <button
      type="button"
      className="flex w-full items-center gap-3 rounded-2xl bg-[var(--color-home-accent-light)] px-4 py-3 text-left transition-colors active:opacity-95"
      onClick={() => window.dispatchEvent(new CustomEvent('sore:open-upload-detail'))}
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/60">
        <MaterialIcon name="photo_library" size={24} className="text-[var(--color-home-accent)]" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-[var(--text-primary)]">Uploading memories...</p>
        <div className="mt-1.5 flex items-center gap-2">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/60">
            <div
              className="h-full rounded-full bg-[var(--color-home-accent)] transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="shrink-0 text-xs text-[var(--text-tertiary)]">{progress}%</span>
        </div>
      </div>

      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-home-accent)] text-white">
        <MaterialIcon name="chevron_right" size={18} />
      </div>
    </button>
  );
}
