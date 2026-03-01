type HomeIdea = {
  id: number;
  title: string;
  description: string;
  created_at: string;
  completed_at: string | null;
};

type IdeaListItemProps = {
  idea: HomeIdea;
  onSelect: (idea: HomeIdea) => void;
};

export default function IdeaListItem({ idea, onSelect }: IdeaListItemProps) {
  const completed = !!idea.completed_at;

  return (
    <button
      type="button"
      className="pwa-idea-row"
      onClick={() => onSelect(idea)}
    >
      <div
        className={`pwa-idea-row-icon ${completed ? "pwa-idea-row-icon-done" : ""}`}
      >
        {completed ? (
          <span className="material-symbols-outlined">check</span>
        ) : (
          <span className="material-symbols-outlined">lightbulb</span>
        )}
      </div>
      <div className="pwa-idea-row-content">
        <h3 className="pwa-idea-row-title">{idea.title}</h3>
        {idea.description && (
          <p className="pwa-idea-row-desc">{idea.description}</p>
        )}
      </div>
      <span className="material-symbols-outlined pwa-idea-row-chevron">
        chevron_right
      </span>
    </button>
  );
}
