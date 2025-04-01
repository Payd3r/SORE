import { API_URLS } from './config';
import axios from 'axios';

export interface HomeStats {
  statistics: {
    tot_ricordi: number;
    tot_foto: number;
    tot_idee: number;
    tot_luoghi: number;
  };
  recent_memories: Array<{
    id: number;
    title: string;
    start_date: string;
    end_date: string | null;
    thumb_big_path: string;
  }>;
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
    const response = await axios.get(`${API_URLS.base}/api/home`, {
      headers
    });
    return response.data;
  } catch (error) {
    console.error('Errore nel recupero dei dati della home:', error);
    throw error;
  }
}; 