import { API_URLS } from './config';

export interface RecapStats {
    data: {
        statistics: {
            tot_ricordi: number;
            tot_foto: number;
            tot_idee: number;
            tot_luoghi: number;
            tot_ricordi_viaggi: number;
            tot_ricordi_eventi: number;
            tot_ricordi_semplici: number;
            tot_idee_checked: number;
            tot_idee_unchecked: number;
            tot_foto_paesaggi: number;
            tot_foto_coppia: number;
            tot_foto_singolo: number;
        };
        luoghi: Array<{
            location: string;
            start_date: string;
        }>;
        canzoni: Array<{
            song: string;
            start_date: string;
        }>;
    }
}

export interface RecapConfronto {
    data: {
        totals: {
            tot_ricordi: number;
            tot_images: number;
            tot_idee: number;
        };
        users: Array<{
            id_utente: number;
            nome_utente: string;
            tot_ricordi_creati: number;
            tot_images_create: number;
            tot_idee_create: number;
        }>;
    };
}

export interface RecapAttivita {
    data: {
        images: Array<{
            id: number;
            thumb_big_path: string;
            type: 'coppia' | 'singolo' | 'paesaggio';
            created_by_user_name: string;
        }>;
        memories: Array<{
            id: number;
            type: 'viaggio' | 'evento' | 'semplice' | 'futuro';
            start_date: string;
            end_date: string | null;
            thumb_big_path: string;
            created_by_user_name: string;
        }>;
    };
}

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    if (!token) {
        throw new Error('No authentication token found');
    }
    return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
    };
};

export const getRecapData = async (): Promise<RecapStats> => {
    try {
        const headers = getAuthHeaders();
        const response = await fetch(`${API_URLS.base}/api/recap`, {
            headers
        });

        if (!response.ok) {
            throw new Error('Failed to fetch recap data');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching recap data:', error);
        throw error;
    }
};

export const getRecapConfronto = async (): Promise<RecapConfronto> => {
    try {
        const headers = getAuthHeaders();
        const response = await fetch(`${API_URLS.base}/api/recap/confronto`, {
            headers
        });

        if (!response.ok) {
            throw new Error('Failed to fetch recap confronto data');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching recap confronto data:', error);
        throw error;
    }
};

export const getRecapAttivita = async (): Promise<RecapAttivita> => {
    try {
        const headers = getAuthHeaders();
        const response = await fetch(`${API_URLS.base}/api/recap/attivita`, {
            headers
        });

        if (!response.ok) {
            throw new Error('Failed to fetch recap confronto data');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching recap confronto data:', error);
        throw error;
    }
}; 