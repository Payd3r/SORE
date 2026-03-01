import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createMemory } from "../../api/memory";
import { createIdea } from "../../api/ideas";
import type { MemoryType } from "../../api/memory";
import type { IdeaType } from "../../api/ideas";
import { searchTracks } from "../../api/spotify";
import type { SpotifyTrack } from "../../api/spotify";
import { useUpload } from "../../contexts/UploadContext";
import { useAuth } from "../../contexts/AuthContext";
import { getImageUrl } from "../../api/images";
import ProfileDropdown from "../components/home/ProfileDropdown";
import { debounce } from "lodash";
import { invalidateOnIdeaChange, invalidateOnMemoryChange } from "../utils/queryInvalidations";

const TOTAL_STEPS = 3;

const MEMORY_CATEGORIES: { value: MemoryType; label: string; icon: string }[] = [
  { value: "VIAGGIO", label: "Viaggio", icon: "flight_takeoff" },
  { value: "EVENTO", label: "Evento", icon: "celebration" },
  { value: "SEMPLICE", label: "Semplice", icon: "photo_library" },
  { value: "FUTURO", label: "Futuro", icon: "schedule" },
];

const IDEA_CATEGORIES: { value: IdeaType; label: string; icon: string }[] = [
  { value: "RISTORANTI", label: "Ristorante", icon: "restaurant" },
  { value: "VIAGGI", label: "Viaggio", icon: "map" },
  { value: "SFIDE", label: "Sfida", icon: "flag" },
  { value: "SEMPLICI", label: "Semplice", icon: "lightbulb_outline" },
];

const MAX_IMAGES = 300;

export default function AddMobile() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { enqueueUpload, setShowUploadStatus } = useUpload();
  const [profileOpen, setProfileOpen] = useState(false);
  const avatarRef = useRef<HTMLButtonElement>(null);

  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [kind, setKind] = useState<"memory" | "idea" | null>(null);

  // Memory
  const [memoryType, setMemoryType] = useState<MemoryType>("SEMPLICE");
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [song, setSong] = useState("");
  const [futureDate, setFutureDate] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Idea
  const [ideaType, setIdeaType] = useState<IdeaType>("SEMPLICI");
  const [description, setDescription] = useState("");

  // Spotify
  const [songSuggestions, setSongSuggestions] = useState<SpotifyTrack[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoadingSongs, setIsLoadingSongs] = useState(false);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const [error, setError] = useState<string | null>(null);

  const createMemoryMutation = useMutation({
    mutationFn: (data: Parameters<typeof createMemory>[0]) => createMemory(data),
    onSuccess: async () => {
      await invalidateOnMemoryChange(queryClient);
    },
  });

  const createIdeaMutation = useMutation({
    mutationFn: (data: { title: string; description?: string; type: IdeaType }) =>
      createIdea(data),
    onSuccess: async () => {
      await invalidateOnIdeaChange(queryClient);
    },
  });

  const searchSongs = debounce(async (query: string) => {
    if (query.length < 2) {
      setSongSuggestions([]);
      return;
    }
    setIsLoadingSongs(true);
    try {
      const tracks = await searchTracks(query);
      setSongSuggestions(tracks);
    } catch {
      setSongSuggestions([]);
    } finally {
      setIsLoadingSongs(false);
    }
  }, 300);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSongChange = (value: string) => {
    setSong(value);
    searchSongs(value);
    setShowSuggestions(true);
  };

  const handleSongSelect = (track: SpotifyTrack) => {
    setSong(`${track.name} - ${track.artists[0].name} - ${track.album.name}`);
    setShowSuggestions(false);
    setSongSuggestions([]);
  };

  const handleBack = () => {
    setError(null);
    if (step === 2) setStep(1);
    else if (step === 1) {
      setStep(0);
      setKind(null);
    } else {
      navigate(-1);
    }
  };

  const handleKindSelect = (k: "memory" | "idea") => {
    setKind(k);
    setError(null);
    if (k === "memory") {
      setMemoryType("SEMPLICE");
      setTitle("");
      setLocation("");
      setSong("");
      setFutureDate("");
      setSelectedFiles([]);
    } else {
      setIdeaType("SEMPLICI");
      setTitle("");
      setDescription("");
    }
  };

  const handleStepForward = () => {
    setError(null);
    if (step === 0 && kind) setStep(1);
    else if (step === 1) setStep(2);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const newFiles = Array.from(e.target.files);
    const remaining = MAX_IMAGES - selectedFiles.length;
    if (newFiles.length > remaining) {
      setError(`Puoi selezionare al massimo ${remaining} altre immagini`);
      return;
    }
    setSelectedFiles((prev) => [...prev, ...newFiles]);
    setError(null);
  };

  const validateMemory = (): boolean => {
    if (!title.trim()) {
      setError("Inserisci un titolo");
      return false;
    }
    if (memoryType !== "FUTURO" && selectedFiles.length === 0) {
      setError("Seleziona almeno un'immagine");
      return false;
    }
    return true;
  };

  const validateIdea = (): boolean => {
    if (!title.trim()) {
      setError("Inserisci un titolo");
      return false;
    }
    return true;
  };

  const handleSubmitMemory = async () => {
    if (!validateMemory()) return;
    setError(null);
    try {
      const memoryData: Parameters<typeof createMemory>[0] = {
        title: title.trim(),
        type: memoryType,
        location: location.trim() || undefined,
        song: song.trim() || undefined,
      };
      const res = await createMemoryMutation.mutateAsync(memoryData);
      const memoryId = res.data.id;

      if (selectedFiles.length > 0) {
        setShowUploadStatus(true);
        void enqueueUpload(selectedFiles, { memoryId, kind: "MEMORY" });
      }

      navigate("/");
    } catch {
      setError("Errore durante il salvataggio del ricordo");
    }
  };

  const handleSubmitIdea = async () => {
    if (!validateIdea()) return;
    setError(null);
    try {
      await createIdeaMutation.mutateAsync({
        title: title.trim(),
        description: description.trim() || undefined,
        type: ideaType,
      });
      navigate("/");
    } catch {
      setError("Errore durante il salvataggio dell'idea");
    }
  };

  const isLoading = createMemoryMutation.isPending || createIdeaMutation.isPending;

  const progressPercent = ((step + 1) / TOTAL_STEPS) * 100;

  return (
    <section className="pwa-page pwa-add-page">
      <header className="pwa-add-header">
        <div className="pwa-add-header-inner">
          <h1 className="pwa-add-title">
            {step === 0 ? "Aggiungi" : step === 1 ? "Categoria" : kind === "memory" ? "Nuovo ricordo" : "Nuova idea"}
          </h1>
          <div className="pwa-add-profile-wrap">
            <button
              ref={avatarRef}
              type="button"
              className="pwa-add-avatar"
              onClick={() => setProfileOpen((o) => !o)}
              aria-label="Menu profilo"
              aria-expanded={profileOpen}
              aria-haspopup="true"
            >
              {user?.profile_picture_url ? (
                <img src={getImageUrl(user.profile_picture_url)} alt="" className="pwa-add-avatar-img" />
              ) : (
                <span className="pwa-add-avatar-initial">{(user?.name || "U").charAt(0).toUpperCase()}</span>
              )}
            </button>
            <ProfileDropdown
              open={profileOpen}
              onClose={() => setProfileOpen(false)}
              anchorRef={avatarRef}
            />
          </div>
        </div>
        {step === 0 && (
          <p className="pwa-add-subtitle">Scegli cosa vuoi creare</p>
        )}
      </header>

      <div className="pwa-add-progress-wrap" role="progressbar" aria-valuenow={step + 1} aria-valuemin={1} aria-valuemax={TOTAL_STEPS} aria-label="Avanzamento">
        <div className="pwa-add-progress-track">
          <div className="pwa-add-progress-fill" style={{ width: `${progressPercent}%` }} />
        </div>
        <p className="pwa-add-progress-text">Passo {step + 1} di {TOTAL_STEPS}</p>
      </div>

      {error && (
        <div className="pwa-add-error" role="alert">
          {error}
        </div>
      )}

      <div className="pwa-add-content">
        {step === 0 && (
          <div className="pwa-add-kind-cards">
            <button
              type="button"
              className={`pwa-add-kind-card ${kind === "memory" ? "pwa-add-kind-card-selected" : ""}`}
              onClick={() => handleKindSelect("memory")}
            >
              <span className="material-symbols-outlined pwa-add-kind-icon">photo_library</span>
              <span className="pwa-add-kind-label">Ricordo</span>
              <span className="pwa-add-kind-hint">Foto e momenti</span>
            </button>
            <button
              type="button"
              className={`pwa-add-kind-card ${kind === "idea" ? "pwa-add-kind-card-selected" : ""}`}
              onClick={() => handleKindSelect("idea")}
            >
              <span className="material-symbols-outlined pwa-add-kind-icon">lightbulb</span>
              <span className="pwa-add-kind-label">Idea</span>
              <span className="pwa-add-kind-hint">Da fare insieme</span>
            </button>
          </div>
        )}

        {step === 1 && kind && (
          <div className="pwa-add-section">
            <p className="pwa-add-section-label">Scegli la categoria</p>
            <div className="pwa-add-category-grid">
              {(kind === "memory" ? MEMORY_CATEGORIES : IDEA_CATEGORIES).map((cat) => {
                const selected = kind === "memory"
                  ? memoryType === cat.value
                  : ideaType === cat.value;
                return (
                  <button
                    key={cat.value}
                    type="button"
                    className={`pwa-add-category-card ${selected ? "pwa-add-category-card-selected" : ""}`}
                    onClick={() => {
                      if (kind === "memory") {
                        const newType = cat.value as MemoryType;
                        setMemoryType(newType);
                        if (newType === "FUTURO") setSelectedFiles([]);
                      } else {
                        setIdeaType(cat.value as IdeaType);
                      }
                    }}
                  >
                    <span className="material-symbols-outlined pwa-add-category-icon">{cat.icon}</span>
                    <span className="pwa-add-category-label">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {(step === 0 || step === 1) && (
        <footer className="pwa-add-footer">
          <button
            type="button"
            className="pwa-add-btn pwa-add-btn-back"
            onClick={handleBack}
          >
            Indietro
          </button>
          <button
            type="button"
            className="pwa-add-btn pwa-add-btn-next"
            onClick={handleStepForward}
            disabled={step === 0 && !kind}
          >
            {step === 0 ? "Avanti" : "Continua"}
          </button>
        </footer>
      )}

      {step === 2 && kind === "memory" && (
        <div className="pwa-add-content">
        <div className="pwa-add-form">
          <div className="pwa-add-field">
            <label htmlFor="add-title" className="pwa-add-label">
              Titolo <span className="pwa-add-required">*</span>
            </label>
            <input
              id="add-title"
              type="text"
              className="pwa-add-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Titolo del ricordo"
            />
          </div>

          {(memoryType === "VIAGGIO" || memoryType === "EVENTO") && (
            <div className="pwa-add-field pwa-add-field-relative">
              <label htmlFor="add-song" className="pwa-add-label">Canzone</label>
              <input
                id="add-song"
                type="text"
                className="pwa-add-input"
                value={song}
                onChange={(e) => handleSongChange(e.target.value)}
                placeholder="Cerca una canzone..."
              />
              {showSuggestions && song.length >= 2 && (
                <div ref={suggestionsRef} className="pwa-add-suggestions">
                  {isLoadingSongs ? (
                    <div className="pwa-add-suggestions-loading">Ricerca...</div>
                  ) : songSuggestions.length > 0 ? (
                    <ul className="pwa-add-suggestions-list">
                      {songSuggestions.map((track) => (
                        <li
                          key={track.id}
                          className="pwa-add-suggestion-item"
                          onClick={() => handleSongSelect(track)}
                          onTouchEnd={(e) => {
                            e.preventDefault();
                            handleSongSelect(track);
                          }}
                        >
                          <span className="pwa-add-suggestion-name">{track.name}</span>
                          <span className="pwa-add-suggestion-artist">
                            {track.artists[0].name} · {track.album.name}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="pwa-add-suggestions-empty">Nessun risultato</div>
                  )}
                </div>
              )}
            </div>
          )}

          {memoryType === "FUTURO" && (
            <div className="pwa-add-field">
              <label htmlFor="add-future-date" className="pwa-add-label">Data (opzionale)</label>
              <input
                id="add-future-date"
                type="date"
                className="pwa-add-input"
                value={futureDate}
                onChange={(e) => setFutureDate(e.target.value)}
              />
            </div>
          )}

          <div className="pwa-add-field">
            <label htmlFor="add-location" className="pwa-add-label">Posizione</label>
            <input
              id="add-location"
              type="text"
              className="pwa-add-input"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Dove è successo?"
            />
          </div>

          {memoryType !== "FUTURO" && (
            <div className="pwa-add-field">
              <label className="pwa-add-label">Immagini <span className="pwa-add-required">*</span></label>
              <div className="pwa-add-upload-zone">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="pwa-add-file-input"
                  onChange={handleFileSelect}
                />
                <button
                  type="button"
                  className="pwa-add-upload-trigger"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <span className="material-symbols-outlined">cloud_upload</span>
                  <span>Carica immagini</span>
                  <span className="pwa-add-upload-hint">PNG, JPG, HEIC fino a 100MB</span>
                </button>
              </div>
              {selectedFiles.length > 0 && (
                <div className="pwa-add-files-summary">
                  <span>{selectedFiles.length} {selectedFiles.length === 1 ? "immagine" : "immagini"} selezionate</span>
                  <button
                    type="button"
                    className="pwa-add-clear-files"
                    onClick={() => setSelectedFiles([])}
                  >
                    Rimuovi
                  </button>
                </div>
              )}
            </div>
          )}

        </div>
        </div>
      )}

      {step === 2 && kind === "idea" && (
        <div className="pwa-add-content">
        <div className="pwa-add-form">
          <div className="pwa-add-field">
            <label htmlFor="add-idea-title" className="pwa-add-label">
              Titolo <span className="pwa-add-required">*</span>
            </label>
            <input
              id="add-idea-title"
              type="text"
              className="pwa-add-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Titolo dell'idea"
            />
          </div>
          <div className="pwa-add-field">
            <label htmlFor="add-description" className="pwa-add-label">Descrizione</label>
            <textarea
              id="add-description"
              className="pwa-add-textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descrizione (opzionale)"
              rows={4}
            />
          </div>
        </div>
        </div>
      )}

      {step === 2 && (
        <footer className="pwa-add-footer">
          <button
            type="button"
            className="pwa-add-btn pwa-add-btn-back"
            onClick={handleBack}
          >
            Indietro
          </button>
          {kind === "memory" ? (
            <button
              type="button"
              className="pwa-add-btn pwa-add-btn-next"
              onClick={handleSubmitMemory}
              disabled={isLoading}
            >
              {isLoading ? "Salvataggio..." : "Salva ricordo"}
            </button>
          ) : (
            <button
              type="button"
              className="pwa-add-btn pwa-add-btn-next"
              onClick={handleSubmitIdea}
              disabled={isLoading}
            >
              {isLoading ? "Salvataggio..." : "Salva idea"}
            </button>
          )}
        </footer>
      )}
    </section>
  );
}
