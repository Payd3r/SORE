import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

interface ImageUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (files: File[]) => Promise<void>;
}

const MAX_IMAGES = 300;

export default function ImageUploadModal({ isOpen, onClose, onUpload }: ImageUploadModalProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const previewNames = useMemo(() => selectedFiles.slice(0, 6).map((file) => file.name), [selectedFiles]);

  const onSelect = (inputFiles: FileList | null) => {
    if (!inputFiles) {
      return;
    }

    const incoming = Array.from(inputFiles);
    const nextCount = selectedFiles.length + incoming.length;

    if (nextCount > MAX_IMAGES) {
      setError(`Puoi selezionare al massimo ${MAX_IMAGES} immagini.`);
      return;
    }

    setError(null);
    setSelectedFiles((previous) => [...previous, ...incoming]);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      setError('Seleziona almeno un file prima di caricare.');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      await onUpload(selectedFiles);
      setSelectedFiles([]);
      onClose();
    } catch (uploadError) {
      console.error(uploadError);
      setError('Upload non riuscito. Verifica connessione o formato file.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 18, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 18, scale: 0.98 }}
          className="w-full max-w-xl rounded-3xl border border-white/70 bg-white/90 p-5 shadow-2xl backdrop-blur-xl dark:border-gray-700 dark:bg-gray-900/90"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Carica immagini</h2>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-500 dark:bg-gray-800 dark:text-gray-300"
            >
              Chiudi
            </button>
          </div>

          {error && (
            <div className="mb-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-300">
              {error}
            </div>
          )}

          <label className="mb-3 block rounded-2xl border border-dashed border-[#9bcfff] bg-[#f0f7ff] p-5 text-center dark:border-blue-900/40 dark:bg-blue-950/20">
            <input
              type="file"
              className="hidden"
              accept="image/*"
              multiple
              disabled={isLoading}
              onChange={(event) => onSelect(event.target.files)}
            />
            <p className="text-sm font-medium text-[#0a3b75] dark:text-blue-200">Trascina o seleziona le immagini</p>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Caricamento in background con stato live</p>
          </label>

          <div className="mb-4 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>{selectedFiles.length} / {MAX_IMAGES} file selezionati</span>
            {selectedFiles.length > 0 && (
              <button
                type="button"
                onClick={() => setSelectedFiles([])}
                className="rounded-full bg-gray-100 px-3 py-1 font-medium dark:bg-gray-800"
              >
                Svuota
              </button>
            )}
          </div>

          {previewNames.length > 0 && (
            <div className="mb-5 rounded-2xl bg-gray-50 p-3 dark:bg-gray-800">
              <p className="mb-2 text-xs font-semibold text-gray-500 dark:text-gray-300">Anteprima selezione</p>
              <ul className="space-y-1">
                {previewNames.map((name) => (
                  <li key={name} className="truncate text-sm text-gray-700 dark:text-gray-200">
                    {name}
                  </li>
                ))}
                {selectedFiles.length > previewNames.length && (
                  <li className="text-xs text-gray-500 dark:text-gray-300">
                    +{selectedFiles.length - previewNames.length} file aggiuntivi
                  </li>
                )}
              </ul>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              disabled={isLoading}
              onClick={onClose}
              className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 dark:border-gray-700 dark:text-gray-200"
            >
              Annulla
            </button>
            <button
              type="button"
              disabled={isLoading}
              onClick={handleUpload}
              className="rounded-xl bg-gradient-to-r from-[#0a84ff] to-[#5ac8fa] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {isLoading ? 'Avvio upload...' : 'Avvia upload'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
