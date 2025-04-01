import React, { useState, useRef, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { createMemory } from '../../api/memory';
import { uploadImages, pollImageStatus, ImageStatusResponse } from '../../api/images';
import { debounce } from 'lodash';
import { searchTracks } from '../../api/spotify';

type MemoryType = 'VIAGGIO' | 'EVENTO' | 'SEMPLICE';

interface MemoryUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
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

export default function MemoryUploadModal({ isOpen, onClose, onSuccess }: MemoryUploadModalProps) {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<MemoryType>('SEMPLICE');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [song, setSong] = useState('');
  const [location, setLocation] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const MAX_IMAGES = 300;
  const [songSuggestions, setSongSuggestions] = useState<SpotifyTrack[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoadingSongs, setIsLoadingSongs] = useState(false);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Reset dei campi quando il modal viene chiuso
  useEffect(() => {
    if (!isOpen) {
      setTitle('');
      setType('SEMPLICE');
      setStartDate(null);
      setEndDate(null);
      setSong('');
      setLocation('');
      setSelectedFiles([]);
      setError(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setSongSuggestions([]);
      setShowSuggestions(false);
    }
  }, [isOpen]);

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

  const searchSongs = debounce(async (query: string) => {
    if (query.length < 2) {
      setSongSuggestions([]);
      return;
    }
    setIsLoadingSongs(true);
    try {
      const tracks = await searchTracks(query);
      setSongSuggestions(tracks);
    } catch (error) {
      console.error('Errore nella ricerca delle canzoni:', error);
    } finally {
      setIsLoadingSongs(false);
    }
  }, 300);

  const handleSongInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSong(value);
    searchSongs(value);
    setShowSuggestions(true);
  };

  const handleSongSelect = (track: SpotifyTrack) => {
    const songString = `${track.name} - ${track.artists[0].name} - ${track.album.name}`;
    setSong(songString);
    setShowSuggestions(false);
    setSongSuggestions([]);
  };

  const resetForm = () => {
    setTitle('');
    setType('SEMPLICE');
    setStartDate(null);
    setEndDate(null);
    setSong('');
    setLocation('');
    setSelectedFiles([]);
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const validateForm = (): boolean => {
    if (!title.trim()) {
      setError('Inserisci un titolo');
      return false;
    }
    if (!startDate) {
      setError('Seleziona una data di inizio');
      return false;
    }
    if (type === 'VIAGGIO' && !endDate) {
      setError('Per i viaggi è necessaria una data di fine');
      return false;
    }
    if (!location.trim()) {
      setError('Inserisci una posizione');
      return false;
    }
    setError(null);
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    setError(null);
    try {
      // Creo il ricordo
      const memoryData = {
        title: title.trim(),
        type,
        startDate: format(startDate!, 'yyyy-MM-dd'),
        endDate: endDate ? format(endDate, 'yyyy-MM-dd') : undefined,
        song: song.trim() || undefined,
        location: location.trim(),
      };

      const response = await createMemory(memoryData);

      // Se ci sono immagini, le carico
      if (selectedFiles.length > 0) {
        try {
          const uploadResponse = await uploadImages(selectedFiles, response.data.id);

          // Avvia il polling per ogni immagine
          uploadResponse.data.forEach(({ jobId }) => {
            pollImageStatus(jobId, (status: ImageStatusResponse) => {
              if (status.state === 'completed') {
                // Notifica il componente padre che le immagini sono state caricate
                onSuccess?.();
              }
            });
          });
        } catch (uploadError) {
          setError('Errore durante il caricamento delle immagini');
          return;
        }
      }

      handleClose();
    } catch (err) {
      setError('Errore durante il salvataggio del ricordo');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const newFiles = Array.from(e.target.files);
    const remainingSlots = MAX_IMAGES - selectedFiles.length;

    if (newFiles.length > remainingSlots) {
      alert(`Puoi selezionare al massimo ${remainingSlots} immagini`);
      return;
    }

    setSelectedFiles(prev => [...prev, ...newFiles]);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={onClose} />

      <div className="min-h-screen flex items-center justify-center">
        <div className="w-full h-screen flex items-center justify-center p-0.5 sm:p-2">
          <div className="relative bg-white dark:bg-gray-900 rounded-lg sm:rounded-xl overflow-hidden max-h-[95vh] w-[95%] sm:max-w-[600px]">
            {/* Header */}
            <div className="px-3 sm:px-4 py-2 sm:py-3 border-b border-gray-200 dark:border-gray-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Nuovo Ricordo
              </h2>
            </div>

            {/* Form */}
            <div className="px-3 py-3 sm:p-4 space-y-3 overflow-y-auto">
              {error && (
                <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  {error}
                </div>
              )}

              {/* Titolo */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Titolo <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 placeholder-gray-500 dark:placeholder-gray-400"
                  placeholder="Titolo del ricordo"
                  required
                />
              </div>

              {/* Tipo */}
              <div>
                <div className="tab-menu">
                  <button
                    type="button"
                    className={`tab-menu-button ${
                      type === 'VIAGGIO'
                        ? 'tab-menu-button-active'
                        : 'tab-menu-button-inactive'
                    }`}
                    onClick={() => setType('VIAGGIO')}
                  >
                    Viaggio
                  </button>
                  <button
                    type="button"
                    className={`tab-menu-button ${
                      type === 'EVENTO'
                        ? 'tab-menu-button-active'
                        : 'tab-menu-button-inactive'
                    }`}
                    onClick={() => setType('EVENTO')}
                  >
                    Evento
                  </button>
                  <button
                    type="button"
                    className={`tab-menu-button ${
                      type === 'SEMPLICE'
                        ? 'tab-menu-button-active'
                        : 'tab-menu-button-inactive'
                    }`}
                    onClick={() => setType('SEMPLICE')}
                  >
                    Semplice
                  </button>
                </div>
              </div>

              {/* Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Data Inizio */}
                <div>
                  <label htmlFor="startDate" className="form-label">
                    Data Inizio <span className="text-red-500">*</span>
                  </label>
                  <div className="date-picker-container">
                    <DatePicker
                      selected={startDate}
                      onChange={(date) => setStartDate(date)}
                      dateFormat="dd/MM/yyyy"
                      locale={it}
                      placeholderText="Seleziona la data di inizio"
                      className="input-base"
                      calendarClassName="react-datepicker"
                      required
                    />
                  </div>
                </div>

                {/* Data Fine (solo per Viaggio e Evento) */}
                {(type === 'VIAGGIO' || type === 'EVENTO') && (
                  <div>
                    <label htmlFor="endDate" className="form-label">
                      Data Fine {type === 'VIAGGIO' && <span className="text-red-500">*</span>}
                    </label>
                    <div className="date-picker-container">
                      <DatePicker
                        selected={endDate}
                        onChange={(date) => setEndDate(date)}
                        dateFormat="dd/MM/yyyy"
                        locale={it}
                        placeholderText="Seleziona la data di fine"
                        className="input-base"
                        calendarClassName="react-datepicker"
                        required={type === 'VIAGGIO'}
                        minDate={startDate || undefined}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Canzone (solo per Viaggio e Evento) */}
              {(type === 'VIAGGIO' || type === 'EVENTO') && (
                <div className="relative">
                  <label htmlFor="song" className="form-label">
                    Canzone
                  </label>
                  <input
                    type="text"
                    id="song"
                    value={song}
                    onChange={handleSongInputChange}
                    className="input-base"
                    placeholder="Cerca una canzone..."
                  />
                  {showSuggestions && (song.length >= 2) && (
                    <div
                      ref={suggestionsRef}
                      className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-xl dark:shadow-2xl max-h-60 overflow-y-auto border border-gray-200 dark:border-gray-700"
                    >
                      {isLoadingSongs ? (
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
                              className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center gap-3 group transition-colors"
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
              )}

              {/* Posizione */}
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Posizione <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 placeholder-gray-500 dark:placeholder-gray-400"
                  placeholder="Dove è successo?"
                  required
                />
              </div>

              {/* Upload Immagini */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Immagini
                </label>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-2 sm:p-3 text-center bg-gray-50 dark:bg-gray-800">
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    multiple
                    onChange={handleFileSelect}
                  />
                  <div className="flex flex-col items-center justify-center gap-1 sm:gap-2">
                    <svg
                      className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400"
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
                    <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                      <button
                        type="button"
                        className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 focus:outline-none bg-transparent"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        Carica immagini
                      </button>
                      <span className="mx-1">o trascina qui</span>
                    </div>
                    <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                      PNG, JPG, HEIC, JPEG fino a 50MB
                    </p>
                  </div>
                </div>

                {/* Lista file selezionati */}
                {selectedFiles.length > 0 && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {selectedFiles.length} {selectedFiles.length === 1 ? 'immagine selezionata' : 'immagini selezionate'}
                      </p>
                      <button
                        onClick={() => setSelectedFiles([])}
                        className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-red-500 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400"
                      >
                        <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Rimuovi tutto
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 dark:border-gray-800 px-3 py-2 sm:px-4 sm:py-3">
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                  onClick={handleClose}
                  disabled={isLoading}
                >
                  Annulla
                </button>
                <button
                  type="button"
                  className={`px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center ${isLoading ? 'cursor-wait' : ''
                    }`}
                  onClick={handleSave}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Salvataggio...
                    </>
                  ) : (
                    'Salva'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 