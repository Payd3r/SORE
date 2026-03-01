import { getImageUrl } from '../../../api/images';
import MaterialIcon from '../ui/MaterialIcon';

interface ProfileHeaderProps {
  /** URL immagine profilo (utente o coppia) */
  avatarUrl?: string | null;
  /** Nome coppia (es. "Marco & Giulia") */
  displayName: string;
  /** Data anniversario per "Together since [anno]" */
  anniversaryDate?: string | null;
  /** Callback per modifica foto (icona cloud) */
  onEditPhoto?: () => void;
}

export default function ProfileHeader({
  avatarUrl,
  displayName,
  anniversaryDate,
  onEditPhoto,
}: ProfileHeaderProps) {
  const year = anniversaryDate ? new Date(anniversaryDate).getFullYear() : null;

  return (
    <div className="flex flex-col items-center pt-2 pb-4">
      <div className="relative">
        <div className="h-24 w-24 overflow-hidden rounded-full bg-[var(--bg-input)]">
          {avatarUrl ? (
            <img
              src={getImageUrl(avatarUrl)}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-2xl font-semibold text-[var(--text-secondary)]">
              {displayName.charAt(0)?.toUpperCase() ?? '?'}
            </div>
          )}
        </div>
        {onEditPhoto && (
          <button
            type="button"
            onClick={onEditPhoto}
            className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-primary)] text-white shadow-md transition-colors active:opacity-90"
            aria-label="Modifica foto profilo"
          >
            <MaterialIcon name="cloud_upload" size={18} />
          </button>
        )}
      </div>
      <h2 className="mt-3 text-center text-lg font-bold text-[var(--text-primary)]">
        {displayName}
      </h2>
      {year && (
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          Together since {year}
        </p>
      )}
    </div>
  );
}
