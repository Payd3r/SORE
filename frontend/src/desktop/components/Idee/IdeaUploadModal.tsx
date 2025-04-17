import { useState, useEffect } from 'react';
import { createIdea } from '../../../api/ideas';
import type { IdeaType } from '../../../api/ideas';
import { createPortal } from 'react-dom';

interface IdeaUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function IdeaUploadModal({ isOpen, onClose, onSuccess }: IdeaUploadModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<IdeaType>('SEMPLICI');
  const [isLoading, setIsLoading] = useState(false);

  // Reset dei campi quando il modal viene chiuso
  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setType('SEMPLICI');
  };

  const handleClose = () => {
    setTitle('');
    setDescription('');
    setType('RISTORANTI');
    onClose();
  };

  const validateForm = (): boolean => {
    if (!title.trim()) {
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      await createIdea({
        title: title.trim(),
        description: description.trim(),
        type,
      });

      handleClose();
      onSuccess?.();
    } catch (err) {
      console.error('Errore nel salvataggio:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const modalContent = (
    <div 
      className="fixed inset-0 z-[9999]"
      style={{ 
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        height: '100vh',
        width: '100vw',
        position: 'fixed',
        top: 0,
        left: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
      onClick={handleClose}
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-[90vw] sm:w-[30vw] max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
        style={{
          position: 'relative',
          margin: 'auto',
          maxHeight: '90vh'
        }}
      >
        <div className="p-6">
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Nuova Idea
              </h2>             
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Titolo
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 text-gray-900 dark:text-white bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-transparent focus:ring-2 focus:ring-primary-500/20 dark:focus:ring-primary-400/20 outline-none transition-all duration-200"
                  placeholder="Inserisci il titolo dell'idea"
                />
              </div>

              <div>
                <label htmlFor="description" className="form-label">
                  Descrizione
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="input-base"
                  placeholder="Inserisci una descrizione (opzionale)"
                  rows={4}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tipo
                </label>
                <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
                  {(['RISTORANTI', 'VIAGGI', 'SFIDE', 'SEMPLICI'] as IdeaType[]).map((t) => (
                    <button
                      key={t}
                      onClick={() => setType(t)}
                      className={`flex items-center justify-center h-[70px] sm:h-auto w-full sm:flex-1 px-4 py-2 rounded-xl sm:rounded-lg text-sm font-medium transition-colors focus:outline-none ${
                        type === t
                          ? 'bg-blue-500 text-white shadow-lg'
                          : 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/30'
                      }`}
                    >
                      {t === 'RISTORANTI' && 'Ristorante'}
                      {t === 'VIAGGI' && 'Viaggio'}
                      {t === 'SFIDE' && 'Sfida'}
                      {t === 'SEMPLICI' && 'Semplice'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-0 sm:mt-2">
              <button
                onClick={handleClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors focus:outline-none"
              >
                Annulla
              </button>
              <button
                onClick={handleSave}
                disabled={isLoading || !title.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none"
              >
                {isLoading ? 'Salvataggio...' : 'Salva'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
} 