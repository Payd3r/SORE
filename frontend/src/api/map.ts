import { API_URLS } from './config';
import axiosInstance from './config';
import { fetchWithAuth } from '../utils/fetchWithAuth';

export interface ImageLocation {
  id: number;
  lat: number;
  lon: number;
  country: string;
  created_at: string;
  thumb_big_path: string;
  thumb_small_path: string;
}

export interface MapMemory {
  id: number;
  title: string;
  type: string;
  start_date: string | null;
  end_date: string | null;
  lat: number;
  lon: number;
  thumb_path: string | null;
  thumb_small_path: string | null;
  image_id: number;
}

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    Authorization: `Bearer ${token}`,
  };
};

export const getMapImages = async (): Promise<ImageLocation[]> => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Token di autenticazione non trovato');
  }

  try {
    const response = await fetchWithAuth(`${API_URLS.base}/api/map/images`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error('Errore nel recupero delle immagini della mappa');
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Errore nel recupero delle immagini della mappa:', error);
    throw error;
  }
};

export const getMemoryMapImages = async (memoryId: number): Promise<ImageLocation[]> => {
  try {
    const response = await axiosInstance.get(`${API_URLS.base}/api/map/memory/${memoryId}`, {
      headers: getAuthHeaders(),
    });
    return response.data.data;
  } catch (error) {
    console.error('Errore nel caricamento delle immagini del ricordo:', error);
    throw error;
  }
};

export const getMapImagesByBounds = async (
  north: number,
  south: number,
  east: number,
  west: number
): Promise<ImageLocation[]> => {
  try {
    const response = await axiosInstance.get(`${API_URLS.base}/api/map/images/bounds`, {
      headers: getAuthHeaders(),
      params: {
        north,
        south,
        east,
        west,
      },
    });
    return response.data.data;
  } catch (error) {
    console.error('Errore nel caricamento delle immagini per area:', error);
    throw error;
  }
}; 

export const getMapMemories = async (): Promise<MapMemory[]> => {
  try {
    const response = await axiosInstance.get(`${API_URLS.base}/api/map/memories`, {
      headers: getAuthHeaders(),
    });
    return response.data.data;
  } catch (error) {
    console.error('Errore nel caricamento dei ricordi della mappa:', error);
    throw error;
  }
};