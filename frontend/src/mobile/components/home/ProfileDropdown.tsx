import { useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import type { RefObject } from 'react';
import { getImageUrl } from '../../../api/images';
import { useAuth } from '../../../contexts/AuthContext';
import { cn } from '../../../components/ui/cn';
import MaterialIcon from '../ui/MaterialIcon';

interface ProfileDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  anchorRef: RefObject<HTMLButtonElement | null>;
  /** Nome utente o coppia (es. "Giulia & Matteo") */
  displayName?: string;
  /** URL avatar/profilo */
  avatarUrl?: string | null;
  /** Giorni insieme (da anniversary_date) */
  togetherDays?: number | null;
}

export default function ProfileDropdown({
  isOpen,
  onClose,
  anchorRef,
  displayName = 'Lovers',
  avatarUrl,
  togetherDays,
}: ProfileDropdownProps) {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = useCallback(
    (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(target) &&
        anchorRef.current &&
        !anchorRef.current.contains(target)
      ) {
        onClose();
      }
    },
    [onClose, anchorRef]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isOpen, handleClickOutside]);

  const handleProfileClick = () => {
    onClose();
    navigate('/profilo');
  };

  const handleSettingsClick = () => {
    onClose();
    navigate('/profilo');
  };

  const handleLogout = () => {
    onClose();
    logout();
    navigate('/welcome');
  };

  if (!isOpen) return null;

  const anchorRect = anchorRef.current?.getBoundingClientRect();
  const style: React.CSSProperties = anchorRect
    ? {
        position: 'fixed',
        top: anchorRect.bottom + 8,
        right: window.innerWidth - anchorRect.right,
        width: Math.min(320, window.innerWidth - 24),
      }
    : { position: 'fixed', top: 16, right: 16, width: Math.min(320, window.innerWidth - 24) };

  const content = (
    <div
      ref={dropdownRef}
      className="z-50 overflow-hidden rounded-2xl bg-[var(--bg-card)] shadow-lg"
      style={style}
    >
      <div className="flex items-center gap-3 border-b border-[var(--border-default)] px-4 py-4">
        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full bg-[var(--bg-input)]">
          {avatarUrl ? (
            <img
              src={getImageUrl(avatarUrl)}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-lg font-semibold text-[var(--text-tertiary)]">
              {displayName.charAt(0)?.toUpperCase() ?? '?'}
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-bold text-[var(--text-primary)]">
            {displayName}
          </p>
          {togetherDays != null && togetherDays >= 0 && (
            <p className="text-xs uppercase tracking-wide text-[var(--text-tertiary)]">
              Together {togetherDays} days
            </p>
          )}
        </div>
      </div>

      <div className="p-2">
        <button
          type="button"
          onClick={handleProfileClick}
          className={cn(
            'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors',
            'bg-transparent text-[var(--text-primary)]'
          )}
        >
          <MaterialIcon name="person" size={20} className="shrink-0 text-[var(--text-secondary)]" />
          <span className="font-medium">Our Profile</span>
        </button>
        <button
          type="button"
          onClick={handleSettingsClick}
          className={cn(
            'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors',
            'bg-transparent text-[var(--text-primary)]'
          )}
        >
          <MaterialIcon name="settings" size={20} className="shrink-0 text-[var(--text-secondary)]" />
          <span className="font-medium">Settings</span>
        </button>
        <button
          type="button"
          onClick={handleLogout}
          className={cn(
            'mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors',
            'bg-transparent text-red-600 dark:text-red-400'
          )}
        >
          <MaterialIcon name="logout" size={20} className="shrink-0" />
          <span className="font-medium">Log out</span>
        </button>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
