import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import type { Idea } from "../../../api/ideas";
import { checkIdea, updateIdea } from "../../../api/ideas";
import { invalidateOnIdeaChange } from "../../utils/queryInvalidations";
import { linkify } from "../../../utils/textUtils";

const IDEA_TYPE_LABELS: Record<string, string> = {
  RISTORANTI: "Ristoranti",
  VIAGGI: "Viaggi",
  SFIDE: "Sfide",
  SEMPLICI: "Semplici",
};

function getIdeaTypeLabel(type: string | null | undefined): string {
  if (!type) return "Idea";
  return IDEA_TYPE_LABELS[type.toUpperCase()] ?? type;
}

type HomeIdea = {
  id: number;
  title: string;
  description: string;
  type?: string | null;
  created_at: string;
  completed_at: string | null;
};

function ideaFromApi(api: Idea): HomeIdea {
  return {
    id: api.id,
    title: api.title,
    description: api.description ?? "",
    type: api.type ?? null,
    created_at: api.created_at,
    completed_at: api.date_checked ?? null,
  };
}

type IdeaDetailSheetProps = {
  idea: HomeIdea | null;
  onClose: () => void;
  onDelete?: (idea: HomeIdea) => void;
  onSaved?: (idea: HomeIdea) => void;
};

export default function IdeaDetailSheet({
  idea,
  onClose: _onClose,
  onDelete,
  onSaved,
}: IdeaDetailSheetProps) {
  const queryClient = useQueryClient();
  const [localChecked, setLocalChecked] = useState(!!idea?.completed_at);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(idea?.title ?? "");
  const [editDescription, setEditDescription] = useState(idea?.description ?? "");

  useEffect(() => {
    setLocalChecked(!!idea?.completed_at);
    setEditTitle(idea?.title ?? "");
    setEditDescription(idea?.description ?? "");
    if (!idea) setIsEditing(false);
  }, [idea?.id, idea?.title, idea?.description, idea?.completed_at, idea]);

  const checkMutation = useMutation({
    mutationFn: ({ ideaId, checked }: { ideaId: number; checked: boolean }) =>
      checkIdea(ideaId, checked),
    onSuccess: async () => {
      await invalidateOnIdeaChange(queryClient);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ ideaId, data }: { ideaId: number; data: { title: string; description: string } }) =>
      updateIdea(ideaId, data),
    onSuccess: async (updated: Idea) => {
      await invalidateOnIdeaChange(queryClient);
      setIsEditing(false);
      onSaved?.(ideaFromApi(updated));
    },
  });

  const handleToggle = () => {
    if (!idea) return;
    const nextChecked = !localChecked;
    setLocalChecked(nextChecked);
    checkMutation.mutate({ ideaId: idea.id, checked: nextChecked });
  };

  const handleSave = () => {
    if (!idea) return;
    updateMutation.mutate({
      ideaId: idea.id,
      data: { title: editTitle.trim(), description: editDescription.trim() },
    });
  };

  const handleCancelEdit = () => {
    setEditTitle(idea?.title ?? "");
    setEditDescription(idea?.description ?? "");
    setIsEditing(false);
  };

  if (!idea) return null;

  const dateStr = idea.created_at
    ? format(new Date(idea.created_at), "d MMM yyyy", { locale: it })
    : "";
  const typeLabel = getIdeaTypeLabel(idea.type);
  const completed = localChecked;
  const canEditOrDelete = !completed;

  return (
    <div className="pwa-idea-detail-sheet">
      <div className="pwa-idea-detail-badges-row">
        <span
          className={`pwa-idea-detail-type-badge ${completed ? "pwa-idea-detail-type-badge-completed" : ""}`}
        >
          {typeLabel}
        </span>
        {dateStr && (
          <span className="pwa-idea-detail-date-badge">{dateStr}</span>
        )}
      </div>

      {isEditing ? (
        <>
          <input
            type="text"
            className="pwa-idea-detail-input pwa-idea-detail-title-input"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            placeholder="Titolo"
            aria-label="Titolo"
          />
          <textarea
            className="pwa-idea-detail-input pwa-idea-detail-desc-input"
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            placeholder="Descrizione"
            rows={4}
            aria-label="Descrizione"
          />
          <div className="pwa-idea-detail-actions">
            <button
              type="button"
              className="pwa-idea-detail-btn pwa-idea-detail-btn-cancel"
              onClick={handleCancelEdit}
            >
              Annulla
            </button>
            <button
              type="button"
              className="pwa-idea-detail-btn pwa-idea-detail-btn-save"
              onClick={handleSave}
              disabled={updateMutation.isPending || !editTitle.trim()}
            >
              Salva
            </button>
          </div>
        </>
      ) : (
        <>
          <h2 className="pwa-idea-detail-title">{idea.title}</h2>
          {idea.description && (
            <p className="pwa-idea-detail-desc">{linkify(idea.description)}</p>
          )}
          <div className="pwa-idea-detail-actions">
            {canEditOrDelete && (
              <div className="pwa-idea-detail-actions-left">
                <button
                  type="button"
                  className="pwa-idea-detail-action-btn pwa-idea-detail-action-edit"
                  onClick={() => setIsEditing(true)}
                  aria-label="Modifica"
                >
                  <span className="material-symbols-outlined">edit</span>
                </button>
                {onDelete && (
                  <button
                    type="button"
                    className="pwa-idea-detail-action-btn pwa-idea-detail-action-delete"
                    onClick={() => onDelete(idea)}
                    aria-label="Elimina"
                  >
                    <span className="material-symbols-outlined">delete</span>
                  </button>
                )}
              </div>
            )}
            <button
              type="button"
              className="pwa-idea-detail-toggle"
              onClick={handleToggle}
            >
              {completed ? "Non completata" : "Completata"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
