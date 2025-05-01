import { API_URLS } from './config';
import axiosInstance from './config';

export interface HomeStats {
  data: {
    num_ricordi: number;
    num_foto: number;
    num_idee: number;
    num_luoghi: number;
    Ricordi: Array<{
      id: number;
      title: string;
      data_inizio: string;
      data_fine: string | null;
      image: string;
    }>;
    Images: Array<{
      id: number;
      created_at: string;
      image: string;
    }>;
    Ideas: Array<{
      id: number;
      title: string;
      description: string;
      created_at: string;
      completed_at: string | null;
    }>;
    Songs: Array<{
      id: number;
      title: string;
      artist: string;
      album: string;
      created_at: string;
    }>;
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

export const getHomeData = async (): Promise<HomeStats> => {
  try {
    const headers = getAuthHeaders();
    const response = await axiosInstance.get(`${API_URLS.base}/api/home`, {
      headers
    });
    return response.data;
  } catch (error) {
    console.error('Errore nel recupero dei dati della home:', error);
    throw error;
  }
}; 