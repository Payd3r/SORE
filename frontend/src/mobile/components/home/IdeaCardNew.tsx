import MaterialIcon from '../ui/MaterialIcon';
import type { Idea } from '../../../api/ideas';

interface IdeaCardNewProps {
  idea: Idea;
  onOpen?: (idea: Idea) => void;
}

const TYPE_STYLES: Record<string, { bg: string; text: string }> = {
  RISTORANTI: { bg: 'bg-[var(--idea-badge-blue-bg)]', text: 'text-[var(--idea-badge-blue-text)]' },
  VIAGGI: { bg: 'bg-[var(--idea-badge-emerald-bg)]', text: 'text-[var(--idea-badge-emerald-text)]' },
  SFIDE: { bg: 'bg-[var(--idea-badge-purple-bg)]', text: 'text-[var(--idea-badge-purple-text)]' },
  SEMPLICI: { bg: 'bg-[var(--idea-badge-neutral-bg)]', text: 'text-[var(--idea-badge-neutral-text)]' },
};

const TYPE_LABELS: Record<string, string> = {
  RISTORANTI: 'Ristoranti',
  VIAGGI: 'Viaggi',
  SFIDE: 'Sfide',
  SEMPLICI: 'Semplici',
};

export default function IdeaCardNew({ idea, onOpen }: IdeaCardNewProps) {
  const typeKey = idea.type?.toUpperCase() ?? 'SEMPLICI';
  const style = TYPE_STYLES[typeKey] ?? TYPE_STYLES.SEMPLICI;
  const label = TYPE_LABELS[typeKey] ?? typeKey;

  return (
    <button
      type="button"
      onClick={() => onOpen?.(idea)}
      className="flex w-full items-center justify-between rounded-2xl border border-gray-100 bg-white p-4 text-left shadow-sm transition-all active:opacity-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2"
    >
      <div className="min-w-0 flex-1">
        <span
          className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${style.bg} ${style.text}`}
        >
          {label}
        </span>
        <h4 className="mt-1 line-clamp-1 text-base font-bold text-[var(--text-primary)]">
          {idea.title}
        </h4>
      </div>
      <MaterialIcon name="chevron_right" size={24} className="shrink-0 text-gray-300" />
    </button>
  );
}
