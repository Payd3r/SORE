import { API_URLS } from './config';
import { ApiResponse } from './types';
import axios from 'axios';
import type { CarouselImage } from '../pages/DetailMemory';

export type MemoryType = 'VIAGGIO' | 'EVENTO' | 'SEMPLICE';

export interface Memory {
  id: number;
  title: string;
  type: MemoryType;
  start_date: string | null;
  end_date: string | null;
  location?: string | null;
  song?: string | null;
  images: {
    id: number;
    thumb_big_path: string | null;
    webp_path: string | null;
    created_at: string;
  }[];
  created_at: string;
  updated_at: string;
  tot_img: number;
}

export interface CreateMemoryRequest {
  title: string;
  type: MemoryType;
  song?: string | null;
  location?: string | null;
}

export interface CreateMemoryResponse {
  data: {
    id: number;
  }
}

export interface MemoryResponse {
  data: Memory;
  message: string;
}

export interface CarouselResponse {
  data: CarouselImage[];
}

export interface MemoryImage {
  id: number;
  thumb_big_path: string | null;
  webp_path: string | null;
  created_at: string;
  width: number;
  height: number;
}

export interface MemoryWithImages extends Memory {
  images: MemoryImage[];
}

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Token di autenticazione non trovato');
  }
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

export const getMemories = async (): Promise<Memory[]> => {
  try {
    const headers = getAuthHeaders();
    const response = await fetch(`${API_URLS.base}/api/memories/`, {
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || 'Errore nel recupero dei ricordi');
    }

    const data: ApiResponse<Memory[]> = await response.json();
    return data.data;
  } catch (error) {
    console.error('Errore nel recupero dei ricordi:', error);
    throw error;
  }
};

export const createMemory = async (data: CreateMemoryRequest): Promise<CreateMemoryResponse> => {
  try {
    const headers = getAuthHeaders();
    const response = await axios.post(`${API_URLS.base}/api/memories/`, data, {
      headers
    });
    return response.data;
  } catch (error) {
    throw new Error('Errore durante la creazione del ricordo');
  }
};

export const getMemory = async (id: string): Promise<MemoryResponse> => {
  try {
    const headers = getAuthHeaders();
    const response = await axios.get(`${API_URLS.base}/api/memories/${id}`, {
      headers
    });
    return response.data;
  } catch (error) {
    console.error('Errore nel recupero del ricordo:', error);
    throw error;
  }
};

export const getMemoryCarousel = async (id: string): Promise<CarouselResponse> => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Token di autenticazione non trovato');
  }

  try {
    const response = await fetch(`${API_URLS.base}/api/memories/carousel/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Errore nel recupero delle immagini del carosello');
    }

    return await response.json();
  } catch (error) {
    console.error('Errore nel recupero delle immagini del carosello:', error);
    throw error;
  }
};

export const updateMemory = async (id: string, data: Partial<Memory>): Promise<ApiResponse<Memory>> => {
  try {
    const headers = getAuthHeaders();
    const response = await axios.put(`${API_URLS.base}/api/memories/${id}`, data, {
      headers
    });
    return response.data;
  } catch (error) {
    console.error('Errore nell\'aggiornamento del ricordo:', error);
    throw error;
  }
};

export const deleteMemory = async (id: string): Promise<void> => {
  try {
    const headers = getAuthHeaders();
    const response = await axios.delete(`${API_URLS.base}/api/memories/${id}`, {
      headers
    });
    return response.data;
  } catch (error) {
    console.error('Errore nell\'eliminazione del ricordo:', error);
    throw error;
  }
};

