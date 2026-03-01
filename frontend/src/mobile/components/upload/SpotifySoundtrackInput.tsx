import { useState, useRef, useEffect } from 'react';
import { debounce } from 'lodash';
import { searchTracks, type SpotifyTrack } from '../../../api/spotify';
import MaterialIcon from '../ui/MaterialIcon';

interface SpotifySoundtrackInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function SpotifySoundtrackInput({
  value,
  onChange,
  placeholder = 'Incolla link Spotify o nome canzone',
}: SpotifySoundtrackInputProps) {
  const [suggestions, setSuggestions] = useState<SpotifyTrack[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoadingSongs, setIsLoadingSongs] = useState(false);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const searchSongs = debounce(async (query: string) => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }
    setIsLoadingSongs(true);
    try {
      const tracks = await searchTracks(query);
      setSuggestions(tracks);
    } catch {
      setSuggestions([]);
    } finally {
      setIsLoadingSongs(false);
    }
  }, 300);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onChange(val);
    searchSongs(val);
    setShowSuggestions(true);
  };

  const handleSelect = (track: SpotifyTrack) => {
    const songString = `${track.name} - ${track.artists[0]?.name || 'Unknown'} - ${track.album?.name || ''}`;
    onChange(songString);
    setShowSuggestions(false);
    setSuggestions([]);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative space-y-2">
      <label className="block text-sm font-semibold uppercase tracking-wide text-[var(--text-primary)]">
        SPOTIFY SONG
      </label>
      <div className="relative">
        <MaterialIcon name="graphic_eq" size={24} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1DB954]" aria-hidden />
        <input
          type="text"
          value={value}
          onChange={handleInputChange}
          placeholder={placeholder}
          className="w-full rounded-2xl border border-[var(--border-default)] bg-[var(--bg-input)] py-3 pl-12 pr-4 text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] outline-none focus:border-[var(--border-focus)] focus:ring-1 focus:ring-[var(--color-primary)]"
        />
        {showSuggestions && value.length >= 2 && (
          <div
            ref={suggestionsRef}
            className="absolute left-0 right-0 top-full z-20 mt-1 max-h-60 overflow-y-auto rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] shadow-lg"
          >
            {isLoadingSongs ? (
              <div className="flex items-center justify-center gap-2 py-4 text-sm text-[var(--text-tertiary)]">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--color-primary)] border-t-transparent" />
                Ricerca...
              </div>
            ) : suggestions.length > 0 ? (
              <ul className="py-1">
                {suggestions.map((track) => (
                  <li key={track.id}>
                    <button
                      type="button"
                      onClick={() => handleSelect(track)}
                      onTouchEnd={(e) => {
                        e.preventDefault();
                        handleSelect(track);
                      }}
                      className="w-full px-4 py-3 text-left text-sm text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-input)] active:bg-[var(--bg-secondary)]"
                    >
                      <span className="font-medium">{track.name}</span>
                      <span className="block text-xs text-[var(--text-tertiary)]">
                        {track.artists[0]?.name} • {track.album?.name}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-4 py-3 text-sm text-[var(--text-tertiary)]">
                Nessun risultato
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
