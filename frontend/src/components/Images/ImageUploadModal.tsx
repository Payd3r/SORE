import { useState, useRef, useCallback, useEffect } from 'react';

interface ImageUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (files: File[]) => Promise<void>;
}

export default function ImageUploadModal({ isOpen, onClose, onUpload }: ImageUploadModalProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const MAX_IMAGES = 300;
  const [isDragging, setIsDragging] = useState(false);

  // Reset dei campi quando il modal viene chiuso
  useEffect(() => {
    if (!isOpen) {
      setSelectedFiles([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [isOpen]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const newFiles = Array.from(e.target.files);
    const remainingSlots = MAX_IMAGES - selectedFiles.length;

    if (newFiles.length > remainingSlots) {
      alert(`Puoi selezionare al massimo ${remainingSlots} immagini`);
      return;
    }

    setSelectedFiles(prev => [...prev, ...newFiles]);
  }, [selectedFiles.length]);

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setIsLoading(true);
    try {
      onClose();
      await onUpload(selectedFiles);
      setSelectedFiles([]);
    } catch (error) {
      console.error('Error uploading images:', error);
      alert('Errore nel caricamento delle immagini');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {isLoading && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60]" />
      )}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={onClose} />

      <div className="min-h-screen flex items-center justify-center">
        <div className="w-full h-screen flex items-center justify-center p-0.5 sm:p-4">
          <div className="relative bg-white dark:bg-gray-900 rounded-lg sm:rounded-xl overflow-hidden max-h-[99vh] w-[95%] sm:max-w-[500px]">
            <div className="px-3 sm:px-6 py-2.5 sm:py-4 border-b border-gray-200 dark:border-gray-800">
              <h2 className="text-sm sm:text-lg font-semibold text-gray-900 dark:text-white">
                Carica immagini
              </h2>
            </div>

            <div className="p-4 sm:p-6">
              <div
                className={`border-2 border-dashed rounded-lg p-4 sm:p-6 text-center ${
                  isDragging && !isLoading
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-300 dark:border-gray-700'
                }`}
                onDragOver={(e) => {
                  if (isLoading) return;
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => {
                  if (isLoading) return;
                  setIsDragging(false);
                }}
                onDrop={(e) => {
                  if (isLoading) return;
                  e.preventDefault();
                  setIsDragging(false);
                  
                  if (!e.dataTransfer.files) return;
                  
                  const newFiles = Array.from(e.dataTransfer.files);
                  const remainingSlots = MAX_IMAGES - selectedFiles.length;

                  if (newFiles.length > remainingSlots) {
                    alert(`Puoi selezionare al massimo ${remainingSlots} immagini`);
                    return;
                  }

                  setSelectedFiles(prev => [...prev, ...newFiles]);
                }}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  multiple
                  onChange={handleFileSelect}
                  disabled={isLoading}
                />
                
                <svg
                  className="mx-auto h-8 w-8 sm:h-12 sm:w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                <div className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                  <p>
                    Trascina e rilascia le immagini qui, o
                    <button
                      type="button"
                      className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 focus:outline-none bg-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isLoading}
                    >
                      seleziona i file
                    </button>
                  </p>
                  <p className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-500">
                    PNG, JPG, HEIC, JPEG fino a 50MB
                  </p>
                </div>
              </div>

              {selectedFiles.length > 0 && (
                <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                  {selectedFiles.length} file selezionati
                </div>
              )}
            </div>

            <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-200 dark:border-gray-800">
              <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
                <button
                  type="button"
                  className="hidden sm:block px-3 py-1.5 sm:py-2 text-[11px] sm:text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md sm:rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={onClose}
                  disabled={isLoading}
                >
                  Annulla
                </button>
                <button
                  type="button"
                  disabled={isLoading || selectedFiles.length === 0}
                  className={`w-full sm:w-auto px-3 py-1.5 sm:py-2 text-[11px] sm:text-sm font-medium text-white rounded-md sm:rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isLoading || selectedFiles.length === 0
                      ? 'bg-blue-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                  onClick={handleUpload}
                >
                  {isLoading ? 'Caricamento...' : 'Carica'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 