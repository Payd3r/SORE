import type { Idea } from '../../../api/ideas';
import IdeaCardNew from './IdeaCardNew';

interface OurIdeasProps {
  ideas: Idea[];
  isLoading?: boolean;
  onOpenIdea?: (idea: Idea) => void;
  onSeeAll?: () => void;
}

export default function OurIdeas({ ideas, isLoading, onOpenIdea, onSeeAll }: OurIdeasProps) {
  if (isLoading) {
    return (
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
            Le nostre Idee
          </h2>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-2xl bg-[var(--bg-input)]" />
          ))}
        </div>
      </section>
    );
  }

  if (ideas.length === 0) {
    return null;
  }

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
          Le nostre Idee
        </h2>
        {onSeeAll && (
          <button
            type="button"
            onClick={onSeeAll}
            className="text-sm font-semibold text-[var(--color-link)] transition-colors hover:text-[var(--color-link-hover)] focus:outline-none focus-visible:underline"
          >
            Vedi tutto
          </button>
        )}
      </div>
      <div className="space-y-3">
        {ideas.slice(0, 5).map((idea) => (
          <IdeaCardNew key={idea.id} idea={idea} onOpen={onOpenIdea} />
        ))}
      </div>
    </section>
  );
}
