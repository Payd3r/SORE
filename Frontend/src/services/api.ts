
import axios from 'axios';
import { User, Couple, Memory, Image, Idea, GeoLocation } from '@/types';

// Base API URL - replace with your actual API URL
const API_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:5000/api'
  : '/api';

// Create an axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // Increased timeout for image uploads (30 seconds)
});

// Add authorization header to requests if a token exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with an error status
      console.error('API Error:', error.response.status, error.response.data);
      
      // Handle 401 unauthorized - token expired or invalid
      if (error.response.status === 401 && localStorage.getItem('token')) {
        localStorage.removeItem('token');
        // Redirect to login page if needed
        window.location.href = '/';
      }
    } else if (error.request) {
      // Request was made but no response received
      console.error('Network Error:', error.request);
    } else {
      // Error in setting up the request
      console.error('Request Error:', error.message);
    }
    return Promise.reject(error);
  }
);

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
    try {
      return (await api.get(`/couples/${coupleId}/images`, { params: filters })).data;
    } catch (error) {
      console.error('Error fetching images:', error);
      throw error;
    }
  },
  
  getImage: async (imageId: string) => {
    try {
      return (await api.get(`/images/${imageId}`)).data;
    } catch (error) {
      console.error('Error fetching image:', error);
      throw error;
    }
  },
  
  uploadImage: async (formData: FormData) => {
    try {
      return (await api.post('/images/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        timeout: 60000 // 60 seconds timeout for large uploads
      })).data;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  },
  
  updateImage: async (imageId: string, data: Partial<Image> & {
    locationName?: string;
    latitude?: number;
    longitude?: number;
  }) => {
    try {
      return (await api.put(`/images/${imageId}`, data)).data;
    } catch (error) {
      console.error('Error updating image:', error);
      throw error;
    }
  },
  
  deleteImage: async (imageId: string) => {
    try {
      return (await api.delete(`/images/${imageId}`)).data;
    } catch (error) {
      console.error('Error deleting image:', error);
      throw error;
    }
  },
  
  toggleFavorite: async (imageId: string, isFavorite: boolean) => {
    try {
      return (await api.put(`/images/${imageId}/favorite`, { isFavorite })).data;
    } catch (error) {
      console.error('Error toggling favorite:', error);
      throw error;
    }
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
