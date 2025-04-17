import { createPortal } from 'react-dom';
import { IoTrashOutline } from 'react-icons/io5';
import { useEffect, useRef } from 'react';

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}

export default function DeleteModal({ isOpen, onClose, onDelete, isDeleting }: DeleteModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // Imposta la classe modal-open sul body quando il modal è aperto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

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
      onClick={onClose}
    >
      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <div 
            ref={modalRef}
            className="relative w-[90vw] sm:w-[40vw] max-h-[90vh] bg-white dark:bg-gray-800 rounded-xl p-6 shadow-xl" 
            onClick={e => {
              e.stopPropagation();
            }}
            style={{
              maxHeight: '90vh'
            }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <IoTrashOutline className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Elimina Ricordo
              </h3>
            </div>

            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Sei sicuro di voler eliminare questo ricordo? Questa azione non può essere annullata.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Annulla
              </button>
              <button
                onClick={onDelete}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 disabled:bg-red-400 disabled:cursor-not-allowed transition-colors"
              >
                {isDeleting ? 'Eliminazione...' : 'Elimina'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
} 