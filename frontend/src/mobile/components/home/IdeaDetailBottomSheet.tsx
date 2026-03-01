import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Idea } from '../../../api/ideas';
import { format, parseISO } from 'date-fns';
import { it } from 'date-fns/locale';
import { deleteIdea, updateIdea } from '../../../api/ideas';
import BottomSheet from '../../../components/ui/BottomSheet';
import MaterialIcon from '../ui/MaterialIcon';

interface IdeaDetailBottomSheetProps {
  idea: Idea | null;
  isOpen: boolean;
  onClose: () => void;
  onIdeaDeleted?: () => void;
  onIdeaUpdated?: (updatedIdea: Idea) => void;
}

export default function IdeaDetailBottomSheet({
  idea: initialIdea,
  isOpen,
  onClose,
  onIdeaDeleted,
  onIdeaUpdated,
}: IdeaDetailBottomSheetProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const queryClient = useQueryClient();

  const { data: idea = initialIdea } = useQuery<Idea>({
    queryKey: ['idea', initialIdea?.id],
    queryFn: () => Promise.resolve(initialIdea!),
    enabled: !!initialIdea,
    staleTime: 5 * 60 * 1000,
  });

  const updateMutation = useMutation({
    mutationFn: (updatedData: { title: string; description: string }) =>
      updateIdea(idea!.id, updatedData),
    onSuccess: (updatedIdea) => {
      queryClient.setQueryData(['idea', updatedIdea.id], updatedIdea);
      onIdeaUpdated?.(updatedIdea);
      setIsEditing(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteIdea(idea!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ideas'] });
      onIdeaDeleted?.();
      onClose();
    },
  });

  const completeMutation = useMutation({
    mutationFn: () =>
      updateIdea(idea!.id, {
        checked: 1,
        date_checked: new Date().toISOString(),
      } as unknown as { title: string; description: string }),
    onSuccess: (updatedIdea) => {
      queryClient.setQueryData(['idea', updatedIdea.id], updatedIdea);
      onIdeaUpdated?.(updatedIdea);
    },
  });

  useEffect(() => {
    if (idea) {
      setTitle(idea.title);
      setDescription(idea.description || '');
    }
  }, [idea]);

  useEffect(() => {
    if (!isOpen) {
      setIsEditing(false);
      if (idea) {
        setTitle(idea.title);
        setDescription(idea.description || '');
      }
    }
  }, [isOpen, idea]);

  const handleSave = () => {
    if (!idea) return;
    updateMutation.mutate({ title, description });
  };

  const handleDelete = () => {
    if (!idea) return;
    deleteMutation.mutate();
  };

  const handleComplete = () => {
    if (!idea || idea.checked === 1) return;
    completeMutation.mutate();
  };

  if (!idea) return null;

  const getTypeBadge = (type: string | undefined) => {
    switch (type?.toUpperCase()) {
      case 'RISTORANTI':
        return 'bg-[var(--idea-badge-blue-bg)] text-[var(--idea-badge-blue-text)]';
      case 'VIAGGI':
        return 'bg-[var(--idea-badge-emerald-bg)] text-[var(--idea-badge-emerald-text)]';
      case 'SFIDE':
        return 'bg-[var(--idea-badge-purple-bg)] text-[var(--idea-badge-purple-text)]';
      default:
        return 'bg-[var(--idea-badge-neutral-bg)] text-[var(--idea-badge-neutral-text)]';
    }
  };

  const getTypeLabel = (type: string | undefined) => {
    switch (type) {
      case 'RISTORANTI':
        return 'Ristorante';
      case 'VIAGGI':
        return 'Viaggio';
      case 'SFIDE':
        return 'Sfida';
      case 'SEMPLICI':
        return 'Semplice';
      default:
        return 'Semplice';
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Data non disponibile';
    try {
      const date = parseISO(dateString);
      return format(date, 'dd MMM yyyy', { locale: it });
    } catch {
      return 'Data non valida';
    }
  };

  return (
    <BottomSheet
      open={isOpen}
      onClose={onClose}
      contentClassName="flex flex-col overflow-hidden bg-[var(--bg-card)]"
    >
      <div className="flex justify-center border-b border-[var(--border-default)] px-8 pb-6 pt-2 text-center">
        <h2 className="text-lg font-semibold tracking-tight text-[var(--text-primary)]">Dettaglio Idea</h2>
      </div>

      <div className="flex-1 overflow-y-auto px-8 pb-8 pt-8">
        <div className="mb-4 flex justify-start">
          <span
            className={`inline-flex items-center rounded-md px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${getTypeBadge(idea.type)}`}
          >
            {getTypeLabel(idea.type)}
          </span>
        </div>

        <div className="mb-6">
          {isEditing ? (
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-2xl border border-[var(--border-default)] bg-[var(--bg-input)] px-4 py-3.5 text-lg font-semibold text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:ring-2 focus:ring-[var(--color-primary)]"
              placeholder="Titolo dell'idea"
            />
          ) : (
            <h3 className="text-2xl font-bold leading-tight text-[var(--text-primary)]">{idea.title}</h3>
          )}
        </div>

        <section className="mb-8">
          <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)]">
            Note
          </h4>
          {isEditing ? (
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-2xl border border-[var(--border-default)] bg-[var(--bg-input)] px-4 py-3 text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:ring-2 focus:ring-[var(--color-primary)]"
              placeholder="Aggiungi una descrizione..."
              rows={4}
            />
          ) : (
            <p className="leading-relaxed text-[var(--text-secondary)]">
              {idea.description || 'Nessuna descrizione'}
            </p>
          )}
        </section>

        <div className="mb-8 space-y-2 rounded-2xl bg-[var(--bg-input)] px-4 py-3">
          <div className="flex items-center gap-3 text-sm text-[var(--text-tertiary)]">
            <MaterialIcon name="person" size={18} className="shrink-0" />
            <span>Creato da {idea.created_by_name}</span>
          </div>
          {idea.checked === 1 && idea.date_checked && (
            <div className="flex items-center gap-3 text-sm text-green-600 dark:text-green-400">
              <MaterialIcon name="check_circle" size={18} className="shrink-0" />
              <span>Completato il {formatDate(idea.date_checked)}</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-3">
          <button
            type="button"
            onClick={isEditing ? handleSave : handleComplete}
            disabled={completeMutation.isPending || updateMutation.isPending}
            className="flex flex-col items-center justify-center gap-1 rounded-2xl bg-[#111111] px-2 py-3 text-white shadow-lg transition-transform active:scale-95 disabled:opacity-50"
          >
            <MaterialIcon name={isEditing ? 'check_circle' : 'check_circle'} size={20} />
            <span className="text-[10px] font-bold tracking-wide">{isEditing ? 'Salva' : 'Completa'}</span>
          </button>
          <button
            type="button"
            onClick={() => setIsEditing((prev) => !prev)}
            className="flex flex-col items-center justify-center gap-1 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-card)] px-2 py-3 text-[var(--text-secondary)] transition-colors active:scale-95"
          >
            <MaterialIcon name={isEditing ? 'close' : 'edit'} size={20} />
            <span className="text-[10px] font-bold tracking-wide">{isEditing ? 'Annulla' : 'Modifica'}</span>
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="flex flex-col items-center justify-center gap-1 rounded-2xl border border-red-100 bg-[var(--bg-card)] px-2 py-3 text-[var(--color-danger)] transition-colors active:scale-95 disabled:opacity-50"
          >
            <MaterialIcon name="delete" size={20} />
            <span className="text-[10px] font-bold tracking-wide">Elimina</span>
          </button>
        </div>
      </div>
    </BottomSheet>
  );
}
