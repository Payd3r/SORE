import { API_URLS } from './config';
import { ApiResponse } from './types';
import axiosInstance from './config';
import { fetchWithAuth } from '../utils/fetchWithAuth';

export type IdeaType = 'RISTORANTI' | 'VIAGGI' | 'SFIDE' | 'SEMPLICI';

export interface Idea {
    id: number;
    title: string;
    description: string;
    type: IdeaType;
    couple_id: number;
    created_by_user_id: number;
    created_at: string;
    updated_at: string;
    checked: number;
    date_checked: string | null;
    created_by_name: string;
}

interface CreateIdeaData {
    title: string;
    description?: string;
    type: IdeaType;
}

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
    };
};

export const getIdeas = async (): Promise<Idea[]> => {
    try {
        const response = await axiosInstance.get<ApiResponse<Idea[]>>(
            `${API_URLS.base}/api/ideas`,
            { headers: getAuthHeaders() }
        );
        return response.data.data;
    } catch (error) {
        console.error('Errore nel recupero delle idee:', error);
        throw error;
    }
};

export const createIdea = async (data: CreateIdeaData): Promise<Idea> => {
    try {
        const response = await axiosInstance.post<ApiResponse<Idea>>(
            `${API_URLS.base}/api/ideas`,
            data,
            { headers: getAuthHeaders() }
        );
        return response.data.data;
    } catch (error) {
        console.error('Errore nella creazione dell\'idea:', error);
        throw error;
    }
};

export const deleteIdea = async (ideaId: number): Promise<void> => {
    try {
        const response = await fetchWithAuth(`${API_URLS.base}/api/ideas/${ideaId}`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            throw new Error('Errore durante l\'eliminazione dell\'idea');
        }
    } catch (error) {
        console.error('Errore durante l\'eliminazione dell\'idea:', error);
        throw error;
    }
};

export const checkIdea = async (ideaId: number, checked: boolean): Promise<Idea> => {
    try {
        const response = await fetchWithAuth(`${API_URLS.base}/api/ideas/${ideaId}/check`, {
            method: 'PUT',
            headers: {
                ...getAuthHeaders(),
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ checked }),
        });

        if (!response.ok) {
            throw new Error('Errore durante l\'aggiornamento dell\'idea');
        }

        const result = await response.json();
        return result.data;
    } catch (error) {
        console.error('Errore durante l\'aggiornamento dell\'idea:', error);
        throw error;
    }
};

export const updateIdea = async (ideaId: number, data: { title: string; description: string }): Promise<Idea> => {
    try {
        const response = await fetchWithAuth(`${API_URLS.base}/api/ideas/${ideaId}`, {
            method: 'PUT',
            headers: {
                ...getAuthHeaders(),
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error('Errore durante l\'aggiornamento dell\'idea');
        }

        const result = await response.json();
        return result.data;
    } catch (error) {
        console.error('Errore durante l\'aggiornamento dell\'idea:', error);
        throw error;
    }
}; 