import { API_URLS } from './config';
import axios from 'axios';

interface HomeImage {
  id: number;
  created_at: Date;
  image: string;
}

interface HomeRicordo {
  id: number;
  title: string;
  data_inizio: Date;
  data_fine: Date | null;
}

export interface HomeStats {
  data: {
    num_ricordi: number;
    num_foto: number;
    num_idee: number;
    num_luoghi: number;
    Ricordi: HomeRicordo[];
    Images: HomeImage[];
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
    const response = await axios.get(`${API_URLS.base}/api/home`, {
      headers
    });
    return response.data;
  } catch (error) {
    console.error('Errore nel recupero dei dati della home:', error);
    throw error;
  }
}; 