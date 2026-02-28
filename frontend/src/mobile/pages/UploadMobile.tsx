import { useEffect, useMemo, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';
import { createMemory, MemoryType } from '../../api/memory';
import { createIdea, IdeaType } from '../../api/ideas';
import { useUpload } from '../../contexts/UploadContext';
import { Button, Card as UiCard, SegmentedControl } from '../../components/ui';
import Skeleton from '../../components/ui/Skeleton';

type UploadTab = 'MEMORY' | 'IMAGE' | 'IDEA';

const MAX_IMAGES = 300;

const tabOptions: Array<{ id: UploadTab; label: string }> = [
  { id: 'MEMORY', label: 'Ricordo' },
  { id: 'IMAGE', label: 'Immagini' },
  { id: 'IDEA', label: 'Idea' }
];

const memoryTypeOptions: MemoryType[] = ['SEMPLICE', 'EVENTO', 'VIAGGIO', 'FUTURO'];
const ideaTypeOptions: IdeaType[] = ['SEMPLICI', 'RISTORANTI', 'VIAGGI', 'SFIDE'];

const prettyType = (value: string) => value.charAt(0) + value.slice(1).toLowerCase();

export default function UploadMobile() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { enqueueUpload } = useUpload();

  const [tab, setTab] = useState<UploadTab>('MEMORY');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [song, setSong] = useState('');
  const [memoryType, setMemoryType] = useState<MemoryType>('SEMPLICE');
  const [futureDate, setFutureDate] = useState('');

  const [ideaTitle, setIdeaTitle] = useState('');
  const [ideaDescription, setIdeaDescription] = useState('');
  const [ideaType, setIdeaType] = useState<IdeaType>('SEMPLICI');

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const previews = useMemo(
    () =>
      selectedFiles.slice(0, 6).map((file) => ({
        file,
        url: URL.createObjectURL(file)
      })),
    [selectedFiles]
  );

  useEffect(
    () => () => {
      previews.forEach((preview) => URL.revokeObjectURL(preview.url));
    },
    [previews]
  );

  const clearAll = () => {
    setTitle('');
    setLocation('');
    setSong('');
    setMemoryType('SEMPLICE');
    setFutureDate('');
    setIdeaTitle('');
    setIdeaDescription('');
    setIdeaType('SEMPLICI');
    setSelectedFiles([]);
  };

  const onSelectFiles = (inputFiles: FileList | null) => {
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
    setSelectedFiles((prev) => [...prev, ...incoming]);
  };

  const submitMemory = async () => {
    if (!title.trim()) {
      setError('Il titolo del ricordo è obbligatorio.');
      return;
    }
    if (memoryType !== 'FUTURO' && selectedFiles.length === 0) {
      setError('Aggiungi almeno una foto per il ricordo.');
      return;
    }

    const payload: any = {
      title: title.trim(),
      type: memoryType,
      location: location.trim() || undefined,
      song: song.trim() || undefined
    };

    if (memoryType === 'FUTURO' && futureDate) {
      payload.date = futureDate;
    }

    const response = await createMemory(payload);

    if (selectedFiles.length > 0) {
      await enqueueUpload(selectedFiles, { memoryId: response.data.id, kind: 'MEMORY' });
    }

    await queryClient.invalidateQueries({ queryKey: ['memories'] });
    await queryClient.invalidateQueries({ queryKey: ['gallery'] });
  };

  const submitImageOnly = async () => {
    if (selectedFiles.length === 0) {
      setError('Seleziona almeno una foto da caricare.');
      return;
    }
    await enqueueUpload(selectedFiles, { kind: 'IMAGE' });
    await queryClient.invalidateQueries({ queryKey: ['gallery'] });
  };

  const submitIdea = async () => {
    if (!ideaTitle.trim()) {
      setError('Il titolo dell’idea è obbligatorio.');
      return;
    }

    await createIdea({
      title: ideaTitle.trim(),
      description: ideaDescription.trim(),
      type: ideaType
    });
    await queryClient.invalidateQueries({ queryKey: ['ideas'] });
  };

  const handleSubmit = async () => {
    setError(null);
    setIsSaving(true);
    try {
      if (tab === 'MEMORY') {
        await submitMemory();
      } else if (tab === 'IMAGE') {
        await submitImageOnly();
      } else {
        await submitIdea();
      }

      clearAll();
      navigate('/');
    } catch (submitError) {
      console.error(submitError);
      setError('Operazione non completata. Riprova tra qualche secondo.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="h-full overflow-auto bg-[#f2f2f7] pb-28 dark:bg-black">
      <div className="sticky top-0 z-20 border-b border-white/60 bg-[#f2f2f7]/80 px-4 pb-4 pt-12 backdrop-blur-xl dark:border-gray-800 dark:bg-black/70">
        <h1 className="mb-4 text-center text-xl font-semibold tracking-tight text-[#111827] dark:text-white">
          Nuovo Upload
        </h1>
        <SegmentedControl
          value={tab}
          options={tabOptions.map((option) => ({ value: option.id, label: option.label }))}
          onChange={setTab}
          className="bg-white/80 dark:bg-gray-900/80"
        />
      </div>

      <div className="space-y-4 px-4 pt-4">
        {isSaving && (
          <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-4 dark:border-blue-900/40 dark:bg-blue-900/20">
            <p className="text-xs font-medium text-blue-600 dark:text-blue-300">Pipeline upload in esecuzione</p>
            <div className="mt-3 space-y-2" aria-hidden="true">
              <Skeleton className="h-3 w-3/4 bg-blue-100 dark:bg-blue-900/60" />
              <Skeleton className="h-3 w-2/3 bg-blue-100 dark:bg-blue-900/60" />
              <Skeleton className="h-3 w-1/2 bg-blue-100 dark:bg-blue-900/60" />
            </div>
          </div>
        )}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-300"
          >
            {error}
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {tab === 'MEMORY' && (
            <motion.section
              key="memory"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="space-y-4"
            >
              <UiCard>
                <h2 className="mb-3 text-sm font-semibold text-gray-800 dark:text-white">Titolo ricordo</h2>
                <Input value={title} onChange={setTitle} placeholder="Es. Weekend al mare" />
              </UiCard>

              <UiCard>
                <h2 className="mb-3 text-sm font-semibold text-gray-800 dark:text-white">Tipo ricordo</h2>
                <div className="grid grid-cols-2 gap-2">
                  {memoryTypeOptions.map((type) => (
                    <Pill
                      key={type}
                      active={memoryType === type}
                      label={prettyType(type)}
                      onClick={() => setMemoryType(type)}
                    />
                  ))}
                </div>
              </UiCard>

              {memoryType === 'FUTURO' && (
                <UiCard>
                  <h2 className="mb-3 text-sm font-semibold text-gray-800 dark:text-white">Data futura (opzionale)</h2>
                  <input
                    type="date"
                    value={futureDate}
                    onChange={(e) => setFutureDate(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 outline-none focus:border-[#0a84ff] dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                  />
                </UiCard>
              )}

              <UiCard>
                <h2 className="mb-3 text-sm font-semibold text-gray-800 dark:text-white">Posizione (opzionale)</h2>
                <Input value={location} onChange={setLocation} placeholder="Es. Firenze" />
              </UiCard>

              <UiCard>
                <h2 className="mb-3 text-sm font-semibold text-gray-800 dark:text-white">Canzone (opzionale)</h2>
                <Input value={song} onChange={setSong} placeholder="Titolo - artista" />
              </UiCard>

              <PhotoPicker selectedFiles={selectedFiles} onSelectFiles={onSelectFiles} setSelectedFiles={setSelectedFiles} previews={previews} />
            </motion.section>
          )}

          {tab === 'IMAGE' && (
            <motion.section
              key="image"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="space-y-4"
            >
              <UiCard>
                <h2 className="mb-3 text-sm font-semibold text-gray-800 dark:text-white">Carica in galleria</h2>
                <p className="mb-3 text-sm text-gray-500 dark:text-gray-300">
                  Carica foto in background. Puoi chiudere questa schermata e continuare a usare la PWA.
                </p>
                <PhotoPicker selectedFiles={selectedFiles} onSelectFiles={onSelectFiles} setSelectedFiles={setSelectedFiles} previews={previews} />
              </UiCard>
            </motion.section>
          )}

          {tab === 'IDEA' && (
            <motion.section
              key="idea"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="space-y-4"
            >
              <UiCard>
                <h2 className="mb-3 text-sm font-semibold text-gray-800 dark:text-white">Titolo idea</h2>
                <Input value={ideaTitle} onChange={setIdeaTitle} placeholder="Es. Cena in terrazza" />
              </UiCard>

              <UiCard>
                <h2 className="mb-3 text-sm font-semibold text-gray-800 dark:text-white">Descrizione</h2>
                <textarea
                  value={ideaDescription}
                  onChange={(e) => setIdeaDescription(e.target.value)}
                  placeholder="Aggiungi dettagli..."
                  className="h-28 w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 outline-none focus:border-[#0a84ff] dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                />
              </UiCard>

              <UiCard>
                <h2 className="mb-3 text-sm font-semibold text-gray-800 dark:text-white">Categoria</h2>
                <div className="grid grid-cols-2 gap-2">
                  {ideaTypeOptions.map((type) => (
                    <Pill
                      key={type}
                      active={ideaType === type}
                      label={prettyType(type)}
                      onClick={() => setIdeaType(type)}
                    />
                  ))}
                </div>
              </UiCard>
            </motion.section>
          )}
        </AnimatePresence>
      </div>

      <div className="fixed bottom-16 left-0 right-0 z-20 px-4 pb-3">
        <motion.div whileTap={{ scale: 0.98 }}>
          <Button type="button" onClick={handleSubmit} disabled={isSaving} className="w-full rounded-2xl bg-gradient-to-r from-[#0a84ff] to-[#5ac8fa] shadow-lg">
          {isSaving ? 'Elaborazione in corso...' : tab === 'IDEA' ? 'Salva Idea' : 'Avvia Upload'}
          </Button>
        </motion.div>
      </div>
    </div>
  );
}

function Input({
  value,
  onChange,
  placeholder
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 outline-none focus:border-[#0a84ff] dark:border-gray-700 dark:bg-gray-900 dark:text-white"
    />
  );
}

function Pill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl px-3 py-2 text-sm transition ${
        active
          ? 'bg-[#0a84ff] text-white'
          : 'bg-[#f4f4f5] text-gray-600 hover:bg-[#e6e6eb] dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
      }`}
    >
      {label}
    </button>
  );
}

function PhotoPicker({
  selectedFiles,
  onSelectFiles,
  setSelectedFiles,
  previews
}: {
  selectedFiles: File[];
  onSelectFiles: (files: FileList | null) => void;
  setSelectedFiles: Dispatch<SetStateAction<File[]>>;
  previews: Array<{ file: File; url: string }>;
}) {
  return (
    <div className="space-y-3">
      <label className="block rounded-2xl border border-dashed border-[#b9dbff] bg-[#f0f7ff] p-4 text-center dark:border-blue-900/50 dark:bg-blue-950/20">
        <input type="file" className="hidden" multiple accept="image/*" onChange={(e) => onSelectFiles(e.target.files)} />
        <div className="mx-auto mb-2 h-9 w-9 rounded-full bg-white/80 p-2 text-[#0a84ff] dark:bg-blue-900/60">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 16V8m0 0l-3 3m3-3l3 3M4 16.5A3.5 3.5 0 017.5 13h9a3.5 3.5 0 010 7h-9A3.5 3.5 0 014 16.5z" />
          </svg>
        </div>
        <p className="text-sm font-medium text-[#0a3b75] dark:text-blue-200">Tocca per selezionare foto</p>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">JPEG, PNG, WEBP, HEIC - max 50MB per file</p>
      </label>

      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-300">
        <span>{selectedFiles.length} / {MAX_IMAGES} selezionate</span>
        {selectedFiles.length > 0 && (
          <button
            type="button"
            onClick={() => setSelectedFiles([])}
            className="rounded-full bg-red-50 px-3 py-1 font-medium text-red-500 dark:bg-red-900/30"
          >
            Svuota
          </button>
        )}
      </div>

      {selectedFiles.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {previews.map((preview) => (
            <img key={`${preview.file.name}-${preview.file.lastModified}`} src={preview.url} alt={preview.file.name} className="h-20 w-full rounded-xl object-cover" />
          ))}
          {selectedFiles.length > previews.length && (
            <div className="flex h-20 items-center justify-center rounded-xl bg-gray-100 text-xs font-semibold text-gray-500 dark:bg-gray-800 dark:text-gray-300">
              +{selectedFiles.length - previews.length}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
