import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { IoCloudUploadOutline, IoCloseOutline, IoTrashOutline } from 'react-icons/io5';
import { createMemory, MemoryType } from '../../api/memory';
import { createIdea, IdeaType } from '../../api/ideas';
import { useUpload } from '../../contexts/UploadContext';
import { Button, Card, SegmentedControl } from '../components/ui';
import { MobileHeader, MobilePageWrapper } from '../components/layout';

type UploadTab = 'MEMORY' | 'IMAGE' | 'IDEA';

const MAX_IMAGES = 300;

const tabOptions: Array<{ key: UploadTab; label: string }> = [
  { key: 'MEMORY', label: 'Ricordo' },
  { key: 'IMAGE', label: 'Immagini' },
  { key: 'IDEA', label: 'Idea' }
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
      selectedFiles.slice(0, 12).map((file, index) => ({
        index,
        file,
        url: URL.createObjectURL(file)
      })),
    [selectedFiles]
  );

  const hiddenCount = selectedFiles.length - previews.length;

  useEffect(() => {
    return () => {
      previews.forEach((preview) => URL.revokeObjectURL(preview.url));
    };
  }, [previews]);

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

  const removeFileAtIndex = (indexToRemove: number) => {
    setSelectedFiles((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const submitMemory = async () => {
    if (!title.trim()) {
      setError('Il titolo del ricordo e obbligatorio.');
      return;
    }
    if (memoryType !== 'FUTURO' && selectedFiles.length === 0) {
      setError('Aggiungi almeno una foto per il ricordo.');
      return;
    }

    const payload: {
      title: string;
      type: MemoryType;
      location?: string;
      song?: string;
      date?: string;
    } = {
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
      setError('Il titolo dell\'idea e obbligatorio.');
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

  const ctaLabel = isSaving ? 'Elaborazione in corso...' : tab === 'IDEA' ? 'Salva idea' : 'Carica foto';

  return (
    <MobilePageWrapper accentBg className="h-full overflow-auto pb-28">
      <MobileHeader
        title="Carica foto"
        onBack={() => navigate(-1)}
        rightActions={
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="rounded-full px-3 py-2 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-input)]"
          >
            Annulla
          </button>
        }
      />

      <section className="space-y-4 pt-4">
        <SegmentedControl value={tab} options={tabOptions} onChange={setTab} />

        {error && (
          <div className="rounded-card border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
            {error}
          </div>
        )}

        {isSaving && (
          <Card className="p-4">
            <p className="text-sm font-medium text-[var(--text-primary)]">Pipeline upload in esecuzione</p>
            <p className="mt-1 text-xs text-[var(--text-secondary)]">Caricamento e indicizzazione in background...</p>
          </Card>
        )}

        {(tab === 'MEMORY' || tab === 'IMAGE') && (
          <>
            <UploadDropZone onSelectFiles={onSelectFiles} selectedCount={selectedFiles.length} />

            {selectedFiles.length > 0 && (
              <Card className="p-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-medium text-[var(--text-primary)]">{selectedFiles.length} foto selezionate</p>
                  <button
                    type="button"
                    onClick={() => setSelectedFiles([])}
                    className="inline-flex items-center gap-1 rounded-full bg-[var(--bg-input)] px-3 py-1 text-xs text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]"
                  >
                    <IoTrashOutline className="h-3.5 w-3.5" />
                    Svuota
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {previews.map((preview) => (
                    <div key={`${preview.file.name}-${preview.file.lastModified}-${preview.index}`} className="relative">
                      <img src={preview.url} alt={preview.file.name} className="h-24 w-full rounded-xl object-cover" />
                      <button
                        type="button"
                        onClick={() => removeFileAtIndex(preview.index)}
                        className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white"
                        aria-label="Rimuovi immagine"
                      >
                        <IoCloseOutline className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                  {hiddenCount > 0 && (
                    <div className="flex h-24 items-center justify-center rounded-xl bg-[var(--bg-input)] text-xs font-semibold text-[var(--text-secondary)]">
                      +{hiddenCount}
                    </div>
                  )}
                </div>
              </Card>
            )}
          </>
        )}

        {tab === 'MEMORY' && (
          <Card className="space-y-3 p-4">
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">Dettagli ricordo</h2>
            <Input value={title} onChange={setTitle} placeholder="Titolo ricordo *" />
            <div className="grid grid-cols-2 gap-2">
              {memoryTypeOptions.map((type) => (
                <Pill key={type} active={memoryType === type} label={prettyType(type)} onClick={() => setMemoryType(type)} />
              ))}
            </div>
            {memoryType === 'FUTURO' && (
              <input
                type="date"
                value={futureDate}
                onChange={(e) => setFutureDate(e.target.value)}
                className="w-full rounded-input border border-[var(--border-default)] bg-[var(--bg-card)] px-4 py-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--border-focus)]"
              />
            )}
            <Input value={location} onChange={setLocation} placeholder="Posizione (opzionale)" />
            <Input value={song} onChange={setSong} placeholder="Canzone (opzionale)" />
          </Card>
        )}

        {tab === 'IDEA' && (
          <Card className="space-y-3 p-4">
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">Nuova idea</h2>
            <Input value={ideaTitle} onChange={setIdeaTitle} placeholder="Titolo idea *" />
            <textarea
              value={ideaDescription}
              onChange={(e) => setIdeaDescription(e.target.value)}
              placeholder="Descrizione"
              className="h-28 w-full resize-none rounded-input border border-[var(--border-default)] bg-[var(--bg-card)] px-4 py-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--border-focus)]"
            />
            <div className="grid grid-cols-2 gap-2">
              {ideaTypeOptions.map((type) => (
                <Pill key={type} active={ideaType === type} label={prettyType(type)} onClick={() => setIdeaType(type)} />
              ))}
            </div>
          </Card>
        )}
      </section>

      <div className="fixed bottom-16 left-0 right-0 z-20 px-4 pb-3">
        <Button type="button" onClick={handleSubmit} disabled={isSaving} fullWidth className="rounded-[14px] shadow-[var(--shadow-md)]">
          {ctaLabel}
        </Button>
      </div>
    </MobilePageWrapper>
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
      className="w-full rounded-input border border-[var(--border-default)] bg-[var(--bg-card)] px-4 py-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--border-focus)]"
    />
  );
}

function Pill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        active
          ? 'rounded-input bg-[var(--color-primary)] px-3 py-2 text-sm font-medium text-[var(--text-inverse)]'
          : 'rounded-input bg-[var(--bg-input)] px-3 py-2 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]'
      }
    >
      {label}
    </button>
  );
}

function UploadDropZone({
  onSelectFiles,
  selectedCount
}: {
  onSelectFiles: (files: FileList | null) => void;
  selectedCount: number;
}) {
  return (
    <label className="block cursor-pointer rounded-card border-2 border-dashed border-[var(--border-default)] bg-[var(--bg-input)] px-6 py-10 text-center">
      <input type="file" className="hidden" multiple accept="image/*" onChange={(e) => onSelectFiles(e.target.files)} />
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--bg-card)] text-[var(--color-primary)]">
        <IoCloudUploadOutline className="h-6 w-6" />
      </div>
      <p className="text-sm font-semibold text-[var(--text-primary)]">Trascina le foto qui</p>
      <p className="mt-1 text-sm text-[var(--text-secondary)]">oppure tocca per selezionare</p>
      <p className="mt-3 text-xs text-[var(--text-tertiary)]">JPEG, PNG, WEBP, HEIC - max 50MB per file</p>
      {selectedCount > 0 && (
        <p className="mt-2 text-xs font-medium text-[var(--color-primary)]">{selectedCount} foto pronte per l'upload</p>
      )}
    </label>
  );
}
