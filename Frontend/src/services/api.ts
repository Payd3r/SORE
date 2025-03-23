
import axios from 'axios';
import { User, Couple, Memory, Image, Idea, GeoLocation } from '@/types';

// Base API URL - replace with your actual API URL
const API_URL = 'http://localhost:5000/api';

// Create an axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add authorization header to requests if a token exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authApi = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    // Store token
    localStorage.setItem('token', response.data.token);
    return response.data.user;
  },
  
  register: async (name: string, email: string, password: string) => {
    const response = await api.post('/auth/register', { name, email, password });
    // Store token
    localStorage.setItem('token', response.data.token);
    return response.data.user;
  },
  
  logout: async () => {
    localStorage.removeItem('token');
    return await api.post('/auth/logout');
  },
  
  getCurrentUser: async () => {
    return (await api.get('/auth/user')).data;
  }
};

// Users API
export const usersApi = {
  getUser: async (userId: string) => {
    return (await api.get(`/users/${userId}`)).data;
  },
  
  updateUser: async (userId: string, data: FormData) => {
    return (await api.put(`/users/${userId}`, data, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })).data;
  }
};

// Couples API
export const couplesApi = {
  createCouple: async (data: { name: string, description?: string, startDate: Date, anniversaryDate?: Date }) => {
    return (await api.post('/couples', data)).data;
  },
  
  getCouple: async (coupleId: string) => {
    return (await api.get(`/couples/${coupleId}`)).data;
  },
  
  updateCouple: async (coupleId: string, data: FormData) => {
    return (await api.put(`/couples/${coupleId}`, data, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })).data;
  },
  
  joinCouple: async (coupleId: string) => {
    return (await api.post(`/couples/${coupleId}/members`)).data;
  },
  
  leaveCouple: async (coupleId: string) => {
    return (await api.delete(`/couples/${coupleId}/members`)).data;
  }
};

// Memories API
export const memoriesApi = {
  getMemories: async (coupleId: string, filters?: { type?: string; startDate?: Date; endDate?: Date }) => {
    return (await api.get(`/couples/${coupleId}/memories`, { params: filters })).data;
  },
  
  getMemory: async (memoryId: string) => {
    return (await api.get(`/memories/${memoryId}`)).data;
  },
  
  createMemory: async (data: Omit<Memory, 'id' | 'createdAt' | 'updatedAt' | 'images'> & {
    imageIds?: string[];
    locationName?: string;
    latitude?: number;
    longitude?: number;
  }) => {
    return (await api.post('/memories', data)).data;
  },
  
  updateMemory: async (memoryId: string, data: Partial<Memory> & {
    imageIds?: string[];
    locationName?: string;
    latitude?: number;
    longitude?: number;
  }) => {
    return (await api.put(`/memories/${memoryId}`, data)).data;
  },
  
  deleteMemory: async (memoryId: string) => {
    return (await api.delete(`/memories/${memoryId}`)).data;
  }
};

// Images API
export const imagesApi = {
  getImages: async (coupleId: string, filters?: { type?: string; startDate?: Date; endDate?: Date }) => {
    return (await api.get(`/couples/${coupleId}/images`, { params: filters })).data;
  },
  
  getImage: async (imageId: string) => {
    return (await api.get(`/images/${imageId}`)).data;
  },
  
  uploadImage: async (formData: FormData) => {
    return (await api.post('/images/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })).data;
  },
  
  updateImage: async (imageId: string, data: Partial<Image> & {
    locationName?: string;
    latitude?: number;
    longitude?: number;
  }) => {
    return (await api.put(`/images/${imageId}`, data)).data;
  },
  
  deleteImage: async (imageId: string) => {
    return (await api.delete(`/images/${imageId}`)).data;
  },
  
  toggleFavorite: async (imageId: string, isFavorite: boolean) => {
    return (await api.put(`/images/${imageId}/favorite`, { isFavorite })).data;
  }
};

// Ideas API
export const ideasApi = {
  getIdeas: async (coupleId: string, filters?: { type?: string; completed?: boolean }) => {
    return (await api.get(`/couples/${coupleId}/ideas`, { params: filters })).data;
  },
  
  getIdea: async (ideaId: string) => {
    return (await api.get(`/ideas/${ideaId}`)).data;
  },
  
  createIdea: async (data: Omit<Idea, 'id' | 'createdAt' | 'completed' | 'completedAt' | 'completedById' | 'completedByName'> & {
    locationName?: string;
    latitude?: number;
    longitude?: number;
  }) => {
    return (await api.post('/ideas', data)).data;
  },
  
  updateIdea: async (ideaId: string, data: Partial<Idea> & {
    locationName?: string;
    latitude?: number;
    longitude?: number;
  }) => {
    return (await api.put(`/ideas/${ideaId}`, data)).data;
  },
  
  deleteIdea: async (ideaId: string) => {
    return (await api.delete(`/ideas/${ideaId}`)).data;
  },
  
  completeIdea: async (ideaId: string) => {
    return (await api.put(`/ideas/${ideaId}/complete`)).data;
  }
};

// Stats API
export const statsApi = {
  getCoupleStats: async (coupleId: string) => {
    return (await api.get(`/couples/${coupleId}/stats`)).data;
  }
};

export default {
  auth: authApi,
  users: usersApi,
  couples: couplesApi,
  memories: memoriesApi,
  images: imagesApi,
  ideas: ideasApi,
  stats: statsApi
};
