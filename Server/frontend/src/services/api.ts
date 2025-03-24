import axios from 'axios';
import { Memory, Image, Idea, ImageType } from '../types/api';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://192.168.0.59:3002/api',
});

// Auth interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor per gestire gli errori
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 403) {
      // Se l'utente non è autenticato o non ha i permessi, rimuovi il token
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Auth
export const login = (email: string, password: string) =>
  api.post('/auth/login', { email, password });

export const registerWithExistingCouple = (data: {
  name: string;
  email: string;
  password: string;
  coupleId: number;
}) => api.post('/auth/register/join', { ...data, coupleId: Number(data.coupleId) });

export const registerWithNewCouple = (data: {
  name: string;
  email: string;
  password: string;
  coupleName: string;
  anniversaryDate: string;
}) => api.post('/auth/register/new', data);

// User
export const getUserProfile = (userId: number) =>
  api.get(`/users/${Number(userId)}`);

export const updateUserProfile = (userId: number, data: {
  name?: string;
  email?: string;
  profilePicture?: string;
  themePreference?: 'light' | 'dark';
}) => api.put(`/users/${Number(userId)}`, data);

// Couple
export const getCoupleDetails = (coupleId: number) =>
  api.get(`/couples/${Number(coupleId)}`);

export const updateCoupleDetails = (coupleId: number, data: {
  name?: string;
  anniversaryDate?: string;
}) => api.put(`/couples/${Number(coupleId)}`, data);

// Memories
export const getMemories = async (coupleId: number, filters?: {
  category?: string;
  month?: number;
  year?: number;
  type?: 'viaggio' | 'evento' | 'semplice';
}): Promise<Memory[]> => {
  try {
    const queryParams = new URLSearchParams();
    if (filters?.category) queryParams.append('category', filters.category);
    if (filters?.month) queryParams.append('month', filters.month.toString());
    if (filters?.year) queryParams.append('year', filters.year.toString());
    if (filters?.type) queryParams.append('type', filters.type);

    const response = await api.get(`/couples/${Number(coupleId)}/memories${queryParams.toString() ? `?${queryParams.toString()}` : ''}`);
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 403) {
        throw new Error('Non hai i permessi per visualizzare questi ricordi');
      }
      if (error.response?.status === 404) {
        throw new Error('Nessun ricordo trovato');
      }
      throw new Error(error.response?.data?.message || 'Errore nel caricamento dei ricordi');
    }
    throw error;
  }
};

export const getMemory = async (memoryId: string): Promise<Memory> => {
  const response = await api.get<{ data: Memory }>(`/memories/${memoryId}`);
  return response.data.data;
};

export const createMemory = async (coupleId: number, memory: {
  title: string;
  description: string;
  date: string;
  type: 'viaggio' | 'evento' | 'semplice';
  start_date?: string;
  end_date?: string;
  location?: string;
  song?: string;
  category?: string;
  images?: string[];
}): Promise<Memory> => {
  try {
    const response = await api.post(`/couples/${Number(coupleId)}/memories`, memory);
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 403) {
        throw new Error('Non hai i permessi per creare ricordi per questa coppia');
      }
      throw new Error(error.response?.data?.message || 'Errore nella creazione del ricordo');
    }
    throw error;
  }
};

export const updateMemory = async (coupleId: number, memoryId: number, memory: {
  title?: string;
  description?: string;
  date?: string;
  type?: 'viaggio' | 'evento' | 'semplice';
  start_date?: string;
  end_date?: string;
  location?: string;
  song?: string;
  category?: string;
}): Promise<Memory> => {
  try {
    const response = await api.put<{ data: Memory }>(`/couples/${Number(coupleId)}/memories/${memoryId}`, memory);
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 403) {
        throw new Error('Non hai i permessi per modificare questo ricordo');
      }
      if (error.response?.status === 404) {
        throw new Error('Ricordo non trovato');
      }
      throw new Error(error.response?.data?.message || 'Errore nell\'aggiornamento del ricordo');
    }
    throw error;
  }
};

export const deleteMemory = async (coupleId: number, memoryId: number): Promise<void> => {
  try {
    await api.delete(`/couples/${Number(coupleId)}/memories/${memoryId}`);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 403) {
        throw new Error('Non hai i permessi per eliminare questo ricordo');
      }
      if (error.response?.status === 404) {
        throw new Error('Ricordo non trovato');
      }
      throw new Error(error.response?.data?.message || 'Errore nell\'eliminazione del ricordo');
    }
    throw error;
  }
};

// Images
export const getImages = async (coupleId: number): Promise<Image[]> => {
  const response = await api.get(`/couples/${Number(coupleId)}/images`);
  return response.data.data;
};

export const getImage = async (imageId: number): Promise<Image> => {
  const response = await api.get<{ data: Image }>(`/images/${imageId}`);
  return response.data.data;
};

export const uploadImage = async (coupleId: number, file: File): Promise<Image> => {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('type', 'semplice');
  const response = await api.post(`/couples/${Number(coupleId)}/images`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data.data;
};

export const updateImageMetadata = async (imageId: number, metadata: Partial<Image>): Promise<Image> => {
  const response = await api.patch<{ data: Image }>(`/images/${imageId}`, metadata);
  return response.data.data;
};

export const deleteImage = async (imageId: number): Promise<void> => {
  await api.delete(`/images/${imageId}`);
};

// Ideas
export const getIdeas = async (coupleId: number): Promise<Idea[]> => {
  const response = await api.get(`/couples/${Number(coupleId)}/ideas`);
  return response.data.data;
};

export const getIdea = async (ideaId: number): Promise<Idea> => {
  const response = await api.get<{ data: Idea }>(`/ideas/${ideaId}`);
  return response.data.data;
};

export const createIdea = async (coupleId: number, idea: {
  title: string;
  description: string;
  category: string;
  due_date?: string;
}): Promise<Idea> => {
  const response = await api.post<{ data: Idea }>(`/couples/${Number(coupleId)}/ideas`, idea);
  return response.data.data;
};

export const updateIdea = async (ideaId: number, updates: {
  title?: string;
  description?: string;
  category?: string;
  due_date?: string;
}): Promise<Idea> => {
  const response = await api.patch<{ data: Idea }>(`/ideas/${ideaId}`, updates);
  return response.data.data;
};

export const checkIdea = async (ideaId: number, checked: boolean): Promise<Idea> => {
  const response = await api.patch<{ data: Idea }>(`/ideas/${ideaId}/check`, { checked });
  return response.data.data;
};

export const deleteIdea = async (ideaId: number): Promise<void> => {
  await api.delete(`/ideas/${ideaId}`);
};

// Memory Images
export const uploadMemoryImage = async (memoryId: string, formData: FormData): Promise<Image> => {
  const response = await api.post<{ data: Image }>(`/memories/${memoryId}/images`, formData);
  return response.data.data;
};