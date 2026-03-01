import type { IdeaType } from '../../../api/ideas';
import MaterialIcon from '../ui/MaterialIcon';

const ideaTypeConfig: Array<{
  type: IdeaType;
  label: string;
  iconName: string;
}> = [
  { type: 'SEMPLICI', label: 'Semplici', iconName: 'auto_awesome' },
  { type: 'RISTORANTI', label: 'Ristoranti', iconName: 'restaurant' },
  { type: 'VIAGGI', label: 'Viaggi', iconName: 'send' },
  { type: 'SFIDE', label: 'Sfide', iconName: 'emoji_events' },
];

interface IdeaTypeSelectorProps {
  value: IdeaType;
  onChange: (value: IdeaType) => void;
}

export default function IdeaTypeSelector({ value, onChange }: IdeaTypeSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="block text-xs font-medium uppercase tracking-wide text-[var(--text-tertiary)]">
        TIPO IDEA
      </label>
      <div className="grid grid-cols-4 gap-2">
        {ideaTypeConfig.map(({ type, label, iconName }) => {
          const isActive = value === type;
          return (
            <button
              key={type}
              type="button"
              onClick={() => onChange(type)}
              className={`relative flex flex-col items-center justify-center gap-1.5 rounded-2xl border p-3 transition-all ${
                isActive
                  ? 'border-2 border-[var(--color-primary)] bg-[var(--color-home-accent-light)] shadow-sm'
                  : 'border-[var(--border-default)] bg-[var(--bg-input)]'
              }`}
            >
              {isActive && (
                <span className="absolute right-1.5 top-1.5" aria-hidden>
                  <MaterialIcon name="check_circle" size={20} className="text-[var(--color-primary)]" />
                </span>
              )}
              <MaterialIcon
                name={iconName}
                size={24}
                className={isActive ? 'text-[var(--color-primary)]' : 'text-[var(--text-tertiary)]'}
              />
              <span
                className={`text-xs font-semibold ${
                  isActive ? 'text-[var(--color-primary)]' : 'text-[var(--text-secondary)]'
                }`}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
