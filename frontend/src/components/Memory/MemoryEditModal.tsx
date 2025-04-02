import React, { useState, useEffect, useRef } from 'react';
import type { Memory } from '../../api/memory';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { debounce } from 'lodash';
import { searchTracks } from '../../api/spotify';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { createPortal } from 'react-dom';
import { useQueryClient } from '@tanstack/react-query';

interface ExtendedMemory extends Memory {
  created_by_name: string;
  created_by_user_id: number;
  description: string;
}

interface MemoryEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  memory: ExtendedMemory;
  onSave: (updatedMemory: Partial<Memory>) => Promise<void>;
}

interface SpotifyTrack {
  id: string;
  name: string;
  artists: Array<{ name: string }>;
  album: {
    name: string;
    images: Array<{
      url: string;
      height: number;
      width: number;
    }>;
  };
}

const MemoryEditModal: React.FC<MemoryEditModalProps> = ({ isOpen, onClose, memory, onSave }) => {
  const [formData, setFormData] = useState<{
    title: string;
    start_date: string;
    end_date?: string;
    location: string;
    song: string;
    description: string;
  }>({
    title: memory.title,
    start_date: memory.start_date ? format(new Date(memory.start_date), 'yyyy-MM-dd', { locale: it }) : '',
    end_date: memory.end_date ? format(new Date(memory.end_date), 'yyyy-MM-dd', { locale: it }) : '',
    location: memory.location || '',
    song: memory.song || '',
    description: memory.description || ''
  });

  const [songSuggestions, setSongSuggestions] = useState<SpotifyTrack[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (isOpen) {
      setFormData({
        title: memory.title,
        start_date: memory.start_date ? format(new Date(memory.start_date), 'yyyy-MM-dd', { locale: it }) : '',
        end_date: memory.end_date ? format(new Date(memory.end_date), 'yyyy-MM-dd', { locale: it }) : '',
        location: memory.location || '',
        song: memory.song || '',
        description: memory.description || ''
      });
    }
  }, [isOpen, memory]);

  const searchSongs = debounce(async (query: string) => {
    if (query.length < 2) {
      setSongSuggestions([]);
      return;
    }
    setIsLoading(true);
    try {
      const tracks = await searchTracks(query);
      setSongSuggestions(tracks);
    } catch (error) {
      console.error('Errore nella ricerca delle canzoni:', error);
    } finally {
      setIsLoading(false);
    }
  }, 300);

  const handleSongInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData({ ...formData, song: value });
    searchSongs(value);
    setShowSuggestions(true);
  };

  const handleSongSelect = (track: SpotifyTrack) => {
    const songString = `${track.name} - ${track.artists[0].name} - ${track.album.name}`;
    setFormData({ ...formData, song: songString });
    setShowSuggestions(false);
    setSongSuggestions([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const dataToSave = { ...formData };
    if (!dataToSave.end_date) {
      delete dataToSave.end_date;
    }
    try {
      await onSave(dataToSave);
      queryClient.invalidateQueries({ queryKey: ['memory', memory.id] });
      onClose();
    } catch (error) {
      console.error('Errore durante il salvataggio:', error);
    }
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

  if (!isOpen) return null;

  const modalContent = (
    <div 
      className="fixed inset-0 z-[9999]"
      style={{ 
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        height: '100vh',
        width: '100vw',
        position: 'fixed',
        top: 0,
        left: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-[90vw] sm:w-[40vw] max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
        style={{
          position: 'relative',
          margin: 'auto',
          maxHeight: '90vh'
        }}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Modifica Ricordo</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="form-label">
                Titolo
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="input-base"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="form-label">
                  Data di inizio
                </label>
                <div className="date-picker-container">
                  <DatePicker
                    selected={formData.start_date ? new Date(formData.start_date) : null}
                    onChange={(date) => setFormData({ ...formData, start_date: date ? format(date, 'yyyy-MM-dd') : '' })}
                    dateFormat="dd/MM/yyyy"
                    locale={it}
                    placeholderText="Seleziona la data di inizio"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="form-label">
                  Data di fine (opzionale)
                </label>
                <div className="date-picker-container">
                  <DatePicker
                    selected={formData.end_date ? new Date(formData.end_date) : null}
                    onChange={(date) => setFormData({ ...formData, end_date: date ? format(date, 'yyyy-MM-dd') : '' })}
                    dateFormat="dd/MM/yyyy"
                    locale={it}
                    placeholderText="Seleziona la data di fine"
                    minDate={formData.start_date ? new Date(formData.start_date) : undefined}
                    openToDate={formData.start_date ? new Date(formData.start_date) : undefined}
                    calendarStartDay={1}
                    className="input-base"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="form-label">
                Luogo
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="input-base"
                placeholder="Inserisci il luogo..."
              />
            </div>

            <div className="relative">
              <label className="form-label">
                Canzone
              </label>
              <input
                type="text"
                value={formData.song}
                onChange={handleSongInputChange}
                className="input-base"
                placeholder="Cerca una canzone..."
              />
              {showSuggestions && (formData.song.length >= 2) && (
                <div
                  ref={suggestionsRef}
                  className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-xl dark:shadow-2xl max-h-60 overflow-y-auto border border-gray-200 dark:border-gray-700"
                >
                  {isLoading ? (
                    <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                      <div className="animate-spin inline-block w-5 h-5 border-2 border-current border-t-transparent rounded-full mr-2"></div>
                      Ricerca in corso...
                    </div>
                  ) : songSuggestions.length > 0 ? (
                    <ul className="py-1">
                      {songSuggestions.map((track) => (
                        <li
                          key={track.id}
                          onClick={() => handleSongSelect(track)}
                          className="px-4 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center gap-3 group transition-colors"
                        >                          
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white group-hover:text-blue-500 dark:group-hover:text-blue-400">
                              {track.name}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {track.artists[0].name} • {track.album.name}
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                      Nessun risultato trovato
                    </div>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="form-label">
                Descrizione
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="input-base"
                placeholder="Aggiungi una descrizione..."
              />
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
              >
                Annulla
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors"
              >
                Salva modifiche
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default MemoryEditModal; 