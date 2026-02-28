import type { Idea } from '../../api/ideas';
import { Card } from './ui';

interface IdeaCardProps {
  idea: Idea;
  onToggleChecked?: (idea: Idea, checked: boolean) => void;
  onOpen?: (idea: Idea) => void;
}

const ideaTypeLabel: Record<string, string> = {
  RISTORANTI: 'Ristoranti',
  VIAGGI: 'Viaggi',
  SFIDE: 'Sfide',
  SEMPLICI: 'Semplici',
};

export default function IdeaCard({ idea, onToggleChecked, onOpen }: IdeaCardProps) {
  const isChecked = Boolean(idea.checked);
  const typeLabel = ideaTypeLabel[idea.type] ?? idea.type;

  return (
    <Card
      variant="content"
      title={idea.title}
      description={idea.description}
      meta={`${typeLabel} • ${isChecked ? 'Completata' : 'Da completare'}`}
      onClick={() => onOpen?.(idea)}
      className="w-full"
    >
      <div className="mt-2 flex items-center justify-between">
        <span
          className={`rounded-full px-2 py-1 text-xs ${
            isChecked
              ? 'bg-[var(--color-primary)]/15 text-[var(--color-primary)]'
              : 'bg-[var(--bg-input)] text-[var(--text-secondary)]'
          }`}
        >
          {isChecked ? 'Completata' : 'Da completare'}
        </span>
        <label className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
          <input
            type="checkbox"
            checked={isChecked}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => onToggleChecked?.(idea, e.target.checked)}
            className="h-4 w-4 accent-[var(--color-primary)]"
          />
          Fatto
        </label>
      </div>
    </Card>
  );
}
