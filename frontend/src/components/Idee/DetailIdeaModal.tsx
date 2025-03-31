import { useState, useEffect } from 'react';
import type { Idea } from '../../api/ideas';
import { format, parseISO } from 'date-fns';
import { it } from 'date-fns/locale';
import { deleteIdea, updateIdea } from '../../api/ideas';

interface DetailIdeaModalProps {
  idea: Idea | null;
  isOpen: boolean;
  onClose: () => void;
  onIdeaDeleted?: () => void;
  onIdeaUpdated?: (updatedIdea: Idea) => void;
}

export default function DetailIdeaModal({ idea: initialIdea, isOpen, onClose, onIdeaDeleted, onIdeaUpdated }: DetailIdeaModalProps) {
  const [idea, setIdea] = useState<Idea | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (initialIdea) {
      setIdea(initialIdea);
      setTitle(initialIdea.title);
      setDescription(initialIdea.description || '');
    }
  }, [initialIdea]);

  useEffect(() => {
    if (!isOpen) {
      setIsEditing(false);
      if (initialIdea) {
        setTitle(initialIdea.title);
        setDescription(initialIdea.description || '');
      }
    }
  }, [isOpen, initialIdea]);

  const handleSave = async () => {
    if (isSaving || !idea) return;
    
    setIsSaving(true);
    try {
      const updatedIdea = await updateIdea(idea.id, { title, description });
      setIdea(updatedIdea);
      onIdeaUpdated?.(updatedIdea);
      setIsEditing(false);
    } catch (error) {
      console.error('Errore durante il salvataggio:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!idea) return;
    
    try {
      await deleteIdea(idea.id);
      onIdeaDeleted?.();
      onClose();
    } catch (error) {
      console.error('Errore durante l\'eliminazione:', error);
    }
  };

  if (!isOpen || !idea) return null;

  const getTypeColor = (type: string | undefined) => {
    if (!type) return {
      badge: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300',
      border: 'border-gray-500/20'
    };

    switch (type.toUpperCase()) {
      case 'RISTORANTI':
        return {
          badge: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300',
          border: 'border-orange-500/20'
        };
      case 'VIAGGI':
        return {
          badge: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
          border: 'border-blue-500/20'
        };
      case 'SFIDE':
        return {
          badge: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
          border: 'border-purple-500/20'
        };
      default:
        return {
          badge: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300',
          border: 'border-gray-500/20'
        };
    }
  };

  const colors = getTypeColor(idea.type);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Data non disponibile';
    try {
      const date = parseISO(dateString);
      return format(date, 'dd MMM yyyy', { locale: it });
    } catch (error) {
      return 'Data non valida';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full mx-4 overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <span className={`w-fit px-2.5 py-1 rounded-full text-sm font-medium ${colors.badge}`}>
                {idea.type === 'RISTORANTI' && 'Ristorante'}
                {idea.type === 'VIAGGI' && 'Viaggio'}
                {idea.type === 'SFIDE' && 'Sfida'}
                {idea.type === 'SEMPLICI' && 'Semplice'}
              </span>
              <div className="flex items-center justify-between">
                {isEditing ? (
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="input-base"
                    placeholder="Titolo dell'idea"
                  />
                ) : (
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {idea.title}
                  </h2>
                )}
                <div className="flex items-center gap-2">
                  {isEditing ? (
                    <button
                      onClick={handleSave}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 rounded-lg transition-colors focus:outline-none"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="hidden sm:inline">Salva</span>
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors focus:outline-none"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        <span className="hidden sm:inline">Modifica</span>
                      </button>
                      <button
                        onClick={handleDelete}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors focus:outline-none"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        <span className="hidden sm:inline">Elimina</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-2">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                Descrizione
              </h3>
              {isEditing ? (
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="input-base"
                  placeholder="Descrizione dell'idea..."
                  rows={4}
                />
              ) : (
                <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
                  {idea.description || 'Nessuna descrizione'}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>Creato da {idea.created_by_name}</span>
            </div>

            {idea.checked === 1 && idea.date_checked && (
              <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Completato il {formatDate(idea.date_checked)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 