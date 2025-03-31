import { API_URLS } from './config';

export interface SpotifyTrack {
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
  external_urls: {
    spotify: string;
  };
  preview_url?: string;
}

interface SpotifySearchResponse {
  tracks: {
    items: SpotifyTrack[];
  };
}

export const searchTracks = async (query: string): Promise<SpotifyTrack[]> => {
  try {
    const response = await fetch(`${API_URLS.base}/api/spotify/search?q=${encodeURIComponent(query)}&limit=4`);
    if (!response.ok) {
      throw new Error('Errore nella ricerca delle canzoni');
    }
    const data: SpotifySearchResponse = await response.json();
    return data.tracks.items;
  } catch (error) {
    console.error('Errore nella ricerca delle canzoni:', error);
    return [];
  }
};

export const getTrackDetails = async (query: string): Promise<SpotifyTrack | null> => {
  try {
    const response = await fetch(`${API_URLS.base}/api/spotify/track?q=${encodeURIComponent(query)}`);
    if (!response.ok) {
      throw new Error('Errore nel recupero dei dettagli della canzone');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Errore nel recupero dei dettagli della canzone:', error);
    return null;
  }
}; 