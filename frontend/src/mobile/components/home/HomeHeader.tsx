import { useRef } from 'react';
import { getImageUrl } from '../../../api/images';
import MaterialIcon from '../ui/MaterialIcon';
import NotificationsDropdown from './NotificationsDropdown';
import ProfileDropdown from './ProfileDropdown';

interface HomeHeaderProps {
  /** Nome da mostrare nel saluto, default "Lovers" */
  userName?: string;
  /** URL avatar utente */
  avatarUrl?: string | null;
  /** Nome da mostrare nel dropdown profilo (es. "Giulia & Matteo") */
  profileDisplayName?: string;
  /** Giorni insieme per il dropdown profilo */
  togetherDays?: number | null;
  /** Dropdown notifiche aperto */
  isNotificationsOpen?: boolean;
  /** Chiudi dropdown notifiche */
  onNotificationsClose?: () => void;
  /** Click sulla campanella notifiche */
  onNotificationsClick?: () => void;
  /** Dropdown profilo aperto */
  isProfileOpen?: boolean;
  /** Chiudi dropdown profilo */
  onProfileClose?: () => void;
  /** Click sull'avatar profilo */
  onProfileClick?: () => void;
}

export default function HomeHeader({
  userName = 'Lovers',
  avatarUrl,
  profileDisplayName,
  togetherDays,
  isNotificationsOpen = false,
  onNotificationsClose,
  onNotificationsClick,
  isProfileOpen = false,
  onProfileClose,
  onProfileClick,
}: HomeHeaderProps) {
  const bellRef = useRef<HTMLButtonElement>(null);
  const avatarRef = useRef<HTMLButtonElement>(null);
  const displayName = userName || 'Lovers';

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between bg-[var(--bg-card)]/80 px-6 pb-4 pt-12 backdrop-blur-md">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-[var(--text-primary)]">
          Hello, {displayName}
        </h1>
        <p className="text-sm font-medium text-[var(--text-tertiary)]">Welcome to SORE</p>
      </div>
      <div className="relative flex items-center gap-2">
        <button
          ref={bellRef}
          type="button"
          onClick={onNotificationsClick}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--bg-input)] text-[var(--text-primary)] transition-colors active:opacity-80"
          aria-label="Notifiche"
        >
          <MaterialIcon name="notifications" size={24} />
        </button>
        <button
          ref={avatarRef}
          type="button"
          onClick={onProfileClick}
          className="relative h-12 w-12 overflow-hidden rounded-full border-2 border-white shadow-sm transition-colors active:opacity-80"
          aria-label="Profilo"
        >
          {avatarUrl ? (
            <img src={getImageUrl(avatarUrl)} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[var(--bg-input)] text-sm font-semibold text-[var(--text-tertiary)]">
              {displayName.charAt(0)?.toUpperCase() ?? '?'}
            </div>
          )}
          <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-500" />
        </button>
      </div>
      <NotificationsDropdown
        isOpen={isNotificationsOpen}
        onClose={onNotificationsClose ?? (() => {})}
        anchorRef={bellRef}
      />
      <ProfileDropdown
        isOpen={isProfileOpen}
        onClose={onProfileClose ?? (() => {})}
        anchorRef={avatarRef}
        displayName={profileDisplayName ?? userName}
        avatarUrl={avatarUrl}
        togetherDays={togetherDays}
      />
    </header>
  );
}
