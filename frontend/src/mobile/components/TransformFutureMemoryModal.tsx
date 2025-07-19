import { useState } from 'react';
import { IoCalendarOutline, IoClose } from 'react-icons/io5';
import { updateMemoryType } from '../../api/memory';
import { useQueryClient } from '@tanstack/react-query';
import { MemoryType } from '../../api/types';

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
    <div className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900">
              <IoCalendarOutline className="w-4 h-4 text-blue-600 dark:text-blue-300" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                Trasforma Ricordo
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Scegli il nuovo tipo
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <IoClose className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="mb-3">
            <h3 className="font-medium text-gray-900 dark:text-white text-sm mb-1">
              {memory.title}
            </h3>
            {memory.start_date && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Data prevista: {new Date(memory.start_date).toLocaleDateString('it-IT')}
              </p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
              Seleziona il nuovo tipo:
            </label>
            <div className="space-y-2">
              {memoryTypes.map((memoryType) => (
                <label
                  key={memoryType.type}
                  className={`flex items-start p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedType === memoryType.type
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-600'
                  }`}
                >
                  <input
                    type="radio"
                    name="memoryType"
                    value={memoryType.type}
                    checked={selectedType === memoryType.type}
                    onChange={(e) => setSelectedType(e.target.value as MemoryType)}
                    className="mt-0.5 mr-2 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 dark:text-white text-sm">
                      {memoryType.label}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {memoryType.description}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 mb-4">
            <p>
              <strong>Nota:</strong> Una volta trasformato, questo ricordo diventerà un ricordo normale 
              e potrai aggiungere foto e dettagli.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-2 p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-3 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 text-sm"
          >
            Annulla
          </button>
          <button
            onClick={handleTransform}
            disabled={isLoading}
            className="flex-1 px-3 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
          >
            {isLoading ? (
              <>
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Trasformando...
              </>
            ) : (
              'Trasforma'
            )}
          </button>
        </div>
      </div>
    </div>
  );
} 