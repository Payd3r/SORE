import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { createMemory, type MemoryType } from '../../api/memory';
import { createIdea, type IdeaType } from '../../api/ideas';
import { useUpload } from '../../contexts/UploadContext';
import { MobilePageWrapper } from '../components/layout';
import {
  AddMobileHeader,
  MemoryTypeSelector,
  IdeaTypeSelector,
  DateLocationRow,
  SpotifySoundtrackInput,
  MediaUploadButton,
} from '../components/upload';

type UploadTab = 'MEMORY' | 'IDEA';

const MAX_IMAGES = 300;

const tabOptions: Array<{ key: UploadTab; label: string }> = [
  { key: 'MEMORY', label: 'Ricordo' },
  { key: 'IDEA', label: 'Idea' },
];

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
    if (!inputFiles) return;

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
      song: song.trim() || undefined,
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

  const submitIdea = async () => {
    if (!ideaTitle.trim()) {
      setError('Il titolo dell\'idea è obbligatorio.');
      return;
    }

    await createIdea({
      title: ideaTitle.trim(),
      description: ideaDescription.trim(),
      type: ideaType,
    });
    await queryClient.invalidateQueries({ queryKey: ['ideas'] });
  };

  const handleSubmit = async () => {
    setError(null);
    setIsSaving(true);
    try {
      if (tab === 'MEMORY') {
        await submitMemory();
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

  const pageTitle = tab === 'MEMORY' ? 'Nuova Memoria' : 'Nuova Idea';

  const saveLabel = isSaving ? '...' : 'SALVA';

  return (
    <MobilePageWrapper accentBg className="flex h-full min-h-0 flex-col overflow-hidden !p-0">
      <AddMobileHeader title={pageTitle} />

      <section className="flex-1 space-y-4 overflow-auto px-4 pt-4 pb-[calc(6.5rem+env(safe-area-inset-bottom,0px))]">
        {/* Tab selector: usa token design per tema chiaro/scuro */}
        <div className="flex gap-1 rounded-2xl bg-[var(--bg-input)] p-1">
          {tabOptions.map((opt) => {
            const isActive = tab === opt.key;
            return (
              <button
                key={opt.key}
                type="button"
                onClick={() => setTab(opt.key)}
                className={`flex-1 rounded-xl py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-[var(--bg-card)] text-[var(--color-primary)] shadow-sm border border-[var(--border-default)]'
                    : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:opacity-90'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        {error && (
          <div className="rounded-2xl border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/10 px-4 py-3 text-sm text-[var(--color-danger)]">
            {error}
          </div>
        )}

        {isSaving && (
          <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-card)] p-4 shadow-sm">
            <p className="text-sm font-medium text-[var(--text-primary)]">Pipeline upload in esecuzione</p>
            <p className="mt-1 text-xs text-[var(--text-secondary)]">
              Caricamento e indicizzazione in background...
            </p>
          </div>
        )}

        {/* MEMORY tab */}
        {tab === 'MEMORY' && (
          <div className="space-y-4">
            <MemoryTypeSelector value={memoryType} onChange={setMemoryType} />

            <div className="space-y-2">
              <label className="block text-xs font-medium uppercase tracking-wide text-[var(--text-tertiary)]">
                TITLE
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Dai un nome..."
                className="w-full rounded-2xl border border-[var(--border-default)] bg-[var(--bg-input)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] outline-none focus:border-[var(--border-focus)] focus:ring-1 focus:ring-[var(--color-primary)]"
              />
            </div>

            <DateLocationRow
              date={futureDate}
              onDateChange={setFutureDate}
              location={location}
              onLocationChange={setLocation}
              showDate={memoryType === 'FUTURO'}
            />

            <SpotifySoundtrackInput value={song} onChange={setSong} />

            <MediaUploadButton onSelectFiles={onSelectFiles} selectedCount={selectedFiles.length} />
          </div>
        )}

        {/* IDEA tab */}
        {tab === 'IDEA' && (
          <div className="space-y-4">
            <IdeaTypeSelector value={ideaType} onChange={setIdeaType} />

            <div className="space-y-2">
              <label className="block text-xs font-medium uppercase tracking-wide text-[var(--text-tertiary)]">
                TITLE
              </label>
              <input
                type="text"
                value={ideaTitle}
                onChange={(e) => setIdeaTitle(e.target.value)}
                placeholder="Titolo idea *"
                className="w-full rounded-2xl border border-[var(--border-default)] bg-[var(--bg-input)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] outline-none focus:border-[var(--border-focus)] focus:ring-1 focus:ring-[var(--color-primary)]"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-medium uppercase tracking-wide text-[var(--text-tertiary)]">
                DESCRIPTION
              </label>
              <textarea
                value={ideaDescription}
                onChange={(e) => setIdeaDescription(e.target.value)}
                placeholder="Racconta l'idea..."
                rows={4}
                className="w-full resize-none rounded-2xl border border-[var(--border-default)] bg-[var(--bg-input)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] outline-none focus:border-[var(--border-focus)] focus:ring-1 focus:ring-[var(--color-primary)]"
              />
            </div>
          </div>
        )}

        {/* Bottone SALVA subito sotto il form */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSaving}
          className="mt-6 w-full rounded-2xl bg-[var(--color-primary)] py-4 text-base font-semibold uppercase text-white transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saveLabel}
        </button>
      </section>
    </MobilePageWrapper>
  );
}
