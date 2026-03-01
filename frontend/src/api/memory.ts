import { API_URLS } from './config';
import { ApiResponse } from './types';
import axiosInstance from './config';
import type { CarouselImage } from '../desktop/pages/DetailMemory';
import { fetchWithAuth } from '../utils/fetchWithAuth';

export type MemoryType = 'VIAGGIO' | 'EVENTO' | 'SEMPLICE' | 'FUTURO';
export type MemoriesSortBy = 'created_desc' | 'most_viewed';

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
    display_order: number | null;
  }[];
  created_at: string;
  updated_at: string;
  tot_img: number;
  view_count?: number;
  last_viewed_at?: string | null;
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
  display_order: number | null;
  width: number;
  height: number;
}

export interface MemoryWithImages extends Memory {
  images: MemoryImage[];
}

export interface CreateShareLinkResponse {
  data: {
    url: string;
    token: string;
    expiresAt: string;
  };
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

export const getMemories = async (options?: { sort?: MemoriesSortBy }): Promise<Memory[]> => {
  try {
    const headers = getAuthHeaders();
    const query = new URLSearchParams();
    if (options?.sort) {
      query.set('sort', options.sort);
    }

    const endpoint = query.toString()
      ? `${API_URLS.base}/api/memories/?${query.toString()}`
      : `${API_URLS.base}/api/memories/`;

    const response = await fetchWithAuth(endpoint, {
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || 'Errore nel recupero dei ricordi');
    }

    const data: ApiResponse<Memory[]> = await response.json();
    return data.data;
  } catch (error) {
    throw error;
  }
};

export const createMemory = async (data: CreateMemoryRequest): Promise<CreateMemoryResponse> => {
  try {
    const headers = getAuthHeaders();
    const response = await axiosInstance.post(`${API_URLS.base}/api/memories/`, data, {
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
    const response = await axiosInstance.get(`${API_URLS.base}/api/memories/${id}`, {
      headers
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getMemoryCarousel = async (id: string): Promise<CarouselResponse> => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Token di autenticazione non trovato');
  }

  try {
    const response = await fetchWithAuth(`${API_URLS.base}/api/memories/carousel/${id}`, {
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
    throw error;
  }
};

export const updateMemory = async (id: string, data: Partial<Memory>): Promise<ApiResponse<Memory>> => {
  try {
    const headers = getAuthHeaders();
    const response = await axiosInstance.put(`${API_URLS.base}/api/memories/${id}`, data, {
      headers
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Funzione specifica per aggiornare il tipo di un ricordo
export const updateMemoryType = async (id: string, type: MemoryType): Promise<ApiResponse<Memory>> => {
  try {
    const headers = getAuthHeaders();
    const response = await axiosInstance.put(`${API_URLS.base}/api/memories/${id}`, { type }, {
      headers
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteMemory = async (id: string): Promise<void> => {
  try {
    const headers = getAuthHeaders();
    const response = await axiosInstance.delete(`${API_URLS.base}/api/memories/${id}`, {
      headers
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createShareLink = async (memoryId: string): Promise<CreateShareLinkResponse> => {
  const response = await fetchWithAuth(`${API_URLS.base}/api/memories/${memoryId}/share`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Errore durante la creazione del link di condivisione');
  }

  return response.json();
};

