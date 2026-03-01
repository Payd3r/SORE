import MaterialIcon from '../ui/MaterialIcon';

interface MediaUploadButtonProps {
  onSelectFiles: (files: FileList | null) => void;
  selectedCount?: number;
}

export default function MediaUploadButton({ onSelectFiles, selectedCount = 0 }: MediaUploadButtonProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold uppercase tracking-wide text-[var(--text-primary)]">
        MEDIA
      </label>
      <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-input)] p-8 shadow-sm transition-colors hover:bg-[var(--bg-secondary)] active:opacity-90">
        <input
          type="file"
          className="sr-only"
          multiple
          accept="image/*"
          onChange={(e) => onSelectFiles(e.target.files)}
        />
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--bg-card)] shadow-inner">
          <MaterialIcon name="photo_camera" size={28} className="text-[var(--color-primary)]" />
        </div>
        <span className="text-sm font-semibold uppercase text-[var(--text-secondary)]">ADD PHOTO</span>
        {selectedCount > 0 && (
          <span className="text-xs font-medium text-[var(--color-primary)]">
            {selectedCount} foto selezionate
          </span>
        )}
      </label>
    </div>
  );
}
