import { useState, useEffect, useRef } from "react";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import type { Memory } from "../../../api/memory";
import { searchTracks } from "../../../api/spotify";
import type { SpotifyTrack } from "../../../api/spotify";

type MemoryEditSheetProps = {
  memory: Memory;
  onClose: () => void;
  onSave: (data: Partial<Memory>) => Promise<void>;
};

export default function MemoryEditSheet({
  memory,
  onClose,
  onSave,
}: MemoryEditSheetProps) {
  const [title, setTitle] = useState(memory.title);
  const [startDate, setStartDate] = useState(
    memory.start_date ? format(new Date(memory.start_date), "yyyy-MM-dd", { locale: it }) : ""
  );
  const [endDate, setEndDate] = useState(
    memory.end_date ? format(new Date(memory.end_date), "yyyy-MM-dd", { locale: it }) : ""
  );
  const [location, setLocation] = useState(memory.location ?? "");
  const [song, setSong] = useState(memory.song ?? "");
  const [suggestions, setSuggestions] = useState<SpotifyTrack[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTitle(memory.title);
    setStartDate(
      memory.start_date ? format(new Date(memory.start_date), "yyyy-MM-dd", { locale: it }) : ""
    );
    setEndDate(
      memory.end_date ? format(new Date(memory.end_date), "yyyy-MM-dd", { locale: it }) : ""
    );
    setLocation(memory.location ?? "");
    setSong(memory.song ?? "");
  }, [memory.id, memory.title, memory.start_date, memory.end_date, memory.location, memory.song]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const searchSongs = (query: string) => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    if (query.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    searchTimeoutRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const tracks = await searchTracks(query);
        setSuggestions(tracks);
        setShowSuggestions(true);
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 300);
  };

  const handleSongSelect = (track: SpotifyTrack) => {
    setSong(`${track.name} - ${track.artists[0].name} - ${track.album.name}`);
    setShowSuggestions(false);
    setSuggestions([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data: Partial<Memory> = {
        title: title.trim(),
        start_date: startDate || null,
        end_date: endDate || null,
        location: location.trim() || null,
        song: song.trim() || null,
      };
      if (!data.end_date) delete data.end_date;
      await onSave(data);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="pwa-idea-detail-sheet">
      <div className="pwa-memory-edit-sheet-header">
        <h2 className="pwa-memory-edit-sheet-title">Modifica ricordo</h2>
        <button
          type="button"
          className="pwa-memory-detail-futuro-close"
          onClick={onClose}
          aria-label="Chiudi"
        >
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>
      <form onSubmit={handleSubmit} className="pwa-memory-edit-sheet-form">
        <label className="pwa-add-label">
          Titolo
          <input
            type="text"
            className="pwa-idea-detail-input pwa-idea-detail-title-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Titolo del ricordo"
            required
          />
        </label>
        <label className="pwa-add-label">
          Data inizio
          <input
            type="date"
            className="pwa-add-input"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </label>
        <label className="pwa-add-label">
          Data fine (opzionale)
          <input
            type="date"
            className="pwa-add-input"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            min={startDate || undefined}
          />
        </label>
        <label className="pwa-add-label">
          Luogo
          <input
            type="text"
            className="pwa-idea-detail-input"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Luogo"
          />
        </label>
        <div className="pwa-memory-edit-sheet-song-wrap" ref={suggestionsRef}>
          <label className="pwa-add-label">
            Canzone
            <input
              type="text"
              className="pwa-idea-detail-input"
              value={song}
              onChange={(e) => {
                setSong(e.target.value);
                searchSongs(e.target.value);
              }}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              placeholder="Cerca una canzone..."
            />
          </label>
          {showSuggestions && (
            <div className="pwa-memory-edit-sheet-suggestions">
              {loading ? (
                <p className="pwa-memory-edit-sheet-suggestions-loading">Ricerca...</p>
              ) : suggestions.length > 0 ? (
                <ul className="pwa-memory-edit-sheet-suggestions-list">
                  {suggestions.map((track) => (
                    <li key={track.id}>
                      <button
                        type="button"
                        className="pwa-memory-edit-sheet-suggestion-item"
                        onClick={() => handleSongSelect(track)}
                      >
                        <span className="pwa-memory-edit-sheet-suggestion-title">{track.name}</span>
                        <span className="pwa-memory-edit-sheet-suggestion-meta">
                          {track.artists[0].name} · {track.album.name}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          )}
        </div>
        <div className="pwa-idea-detail-actions">
          <button
            type="button"
            className="pwa-idea-detail-btn pwa-idea-detail-btn-cancel"
            onClick={onClose}
          >
            Annulla
          </button>
          <button
            type="submit"
            className="pwa-idea-detail-btn pwa-idea-detail-btn-save"
            disabled={saving || !title.trim()}
          >
            {saving ? "Salvataggio..." : "Salva"}
          </button>
        </div>
      </form>
    </div>
  );
}
