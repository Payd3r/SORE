import { useState } from 'react';
import { IoCalendarOutline, IoClose } from 'react-icons/io5';
import { updateMemoryType } from '../../../api/memory';
import { useQueryClient } from '@tanstack/react-query';
import { MemoryType } from '../../../api/types';

interface TransformFutureMemoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  memory: {
    id: number;
    title: string;
    start_date?: string | null;
  } | null;
}

export default function TransformFutureMemoryModal({ 
  isOpen, 
  onClose, 
  memory 
}: TransformFutureMemoryModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedType, setSelectedType] = useState<MemoryType>('SEMPLICE');
  const queryClient = useQueryClient();

  if (!isOpen || !memory) return null;

  const handleTransform = async () => {
    setIsLoading(true);
    try {
      await updateMemoryType(memory.id.toString(), selectedType);
      
      // Invalida le query per aggiornare la UI
      queryClient.invalidateQueries({ queryKey: ['memories'] });
      queryClient.invalidateQueries({ queryKey: ['memory', memory.id] });
      
      onClose();
    } catch (error) {
      console.error('Errore durante la trasformazione del ricordo:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const memoryTypes: { type: MemoryType; label: string; description: string }[] = [
    {
      type: 'SEMPLICE',
      label: 'Ricordo Semplice',
      description: 'Un ricordo normale con foto e dettagli'
    },
    {
      type: 'EVENTO',
      label: 'Evento',
      description: 'Un evento speciale o celebrazione'
    },
    {
      type: 'VIAGGIO',
      label: 'Viaggio',
      description: 'Un viaggio o vacanza'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900">
              <IoCalendarOutline className="w-5 h-5 text-blue-600 dark:text-blue-300" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Trasforma Ricordo Futuro
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Scegli il nuovo tipo di ricordo
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <IoClose className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-4">
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">
              {memory.title}
            </h3>
            {memory.start_date && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Data prevista: {new Date(memory.start_date).toLocaleDateString('it-IT')}
              </p>
            )}
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Seleziona il nuovo tipo di ricordo:
            </label>
            <div className="space-y-2">
              {memoryTypes.map((memoryType) => (
                <label
                  key={memoryType.type}
                  className={`flex items-start p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedType === memoryType.type
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                >
                  <input
                    type="radio"
                    name="memoryType"
                    value={memoryType.type}
                    checked={selectedType === memoryType.type}
                    onChange={(e) => setSelectedType(e.target.value as MemoryType)}
                    className="mt-1 mr-3 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 dark:text-white">
                      {memoryType.label}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {memoryType.description}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 mb-6">
            <p>
              <strong>Nota:</strong> Una volta trasformato, questo ricordo diventerà un ricordo normale 
              e potrai aggiungere foto e dettagli come qualsiasi altro ricordo.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
          >
            Annulla
          </button>
          <button
            onClick={handleTransform}
            disabled={isLoading}
            className="flex-1 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Trasformando...
              </>
            ) : (
              'Trasforma Ricordo'
            )}
          </button>
        </div>
      </div>
    </div>
  );
} 