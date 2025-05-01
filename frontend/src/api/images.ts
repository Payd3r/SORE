import { API_URLS, STATIC_URLS } from './config';
import { ApiResponse } from './types';
import { getAuthHeaders } from './auth';

export interface ImageType {
  id: string;
  latitude: number | null;
  longitude: number | null;
  created_by_user_id: number;
  created_at: string;
  type: string;
  created_by_name: string | null;
  image: string;
  thumb_big_path: string;
  webp_path?: string;  // Il percorso dell'immagine in alta risoluzione
  memory_id: number | -1; // -1 indica che l'immagine non è associata a nessun ricordo
  display_order?: number | null;
}

export interface ImageResponse {
  data: ImageType;
}

export interface ImageUploadResponse {
  message: string;
  data: Array<{
    success: boolean;
    file: string;
    jobId: string;
    status: string;
  }>;
}

export interface ImageStatusResponse {
  jobId: string;
  state: 'queued' | 'processing' | 'completed' | 'failed' | 'notfound';
  data: {
    filePath: string;
    originalName: string;
    memoryId: number | null;
    coupleId: number;
    userId: number;
    type: string;
  };
  progress: number;
  status: string;
}


export const getGalleryImages = async (): Promise<ImageType[]> => {
  try {
    const headers = getAuthHeaders(); // Questo lancerà un errore se il token non è presente
    const response = await fetch(`${API_URLS.base}/api/images/`, {
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || 'Errore nel recupero delle immagini');
    }

    const data: ApiResponse<ImageType[]> = await response.json();
    return data.data;
  } catch (error) {
    console.error('Errore nel recupero delle immagini:', error);
    throw error;
  }
};

export const uploadImages = async (files: File[], memory_id?: number): Promise<ImageUploadResponse> => {
  const headers = getAuthHeaders();
  const formData = new FormData();

  files.forEach(file => formData.append('images', file));
  if (memory_id) {
    formData.append('memory_id', memory_id.toString());
  }

  const response = await fetch(`${API_URLS.base}/api/images/upload`, {
    method: 'POST',
    headers: {
      'Authorization': headers.Authorization
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || 'Errore durante il caricamento delle immagini');
  }

  return response.json();
};

export const checkImageStatus = async (jobId: string): Promise<ImageStatusResponse> => {
  const headers = getAuthHeaders();
  const response = await fetch(`${API_URLS.base}/api/images/status/${jobId}`, {
    headers
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || 'Errore durante il controllo dello stato dell\'immagine');
  }

  return response.json();
};

export const pollImageStatus = async (
  jobId: string,
  onUpdate: (status: ImageStatusResponse) => void,
  interval: number = 2000
): Promise<void> => {
  const poll = async () => {
    try {
      const status = await checkImageStatus(jobId);
      onUpdate(status);

      if (status.state === 'completed' || status.state === 'failed') {
        return;
      }

      setTimeout(poll, interval);
    } catch (error) {
      console.error('Errore durante il polling dello stato:', error);
      onUpdate({
        jobId,
        state: 'failed',
        data: {
          filePath: '',
          originalName: '',
          memoryId: null,
          coupleId: 0,
          userId: 0,
          type: '',
        },
        progress: 0,
        status: '',
      });
    }
  };

  poll();
};

// Funzione di utilità per gestire i percorsi delle immagini
export const getImageUrl = (path: string) => {
  if (!path) return '';
  // Se il percorso è già un URL completo, lo restituiamo così com'è
  if (path.startsWith('http')) {
    return path;
  }
  // Altrimenti aggiungiamo il prefisso del server statico
  return `${STATIC_URLS.images}/${path}`;
};

export const getOriginalImage = async (imageId: number): Promise<ImageResponse> => {
  const headers = getAuthHeaders();

  try {
    const response = await fetch(`${API_URLS.base}/api/images/${imageId}`, {
      headers,
    });

    if (!response.ok) {
      throw new Error('Errore nel caricamento dell\'immagine originale');
    }

    return await response.json();
  } catch (error) {
    console.error('Errore durante il recupero dell\'immagine originale:', error);
    throw error;
  }
};

export const deleteImage = async (imageId: string): Promise<void> => {
  try {
    const response = await fetch(`${API_URLS.base}/api/images/${imageId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || 'Errore durante l\'eliminazione dell\'immagine');
    }
  } catch (error) {
    console.error('Errore durante l\'eliminazione dell\'immagine:', error);
    throw error;
  }
};

interface ImageMetadata {
  type: string;
  created_at: string;
  display_order?: number | null;
}

export const updateImageMetadata = async (imageId: string, metadata: ImageMetadata): Promise<void> => {
  try {
    const response = await fetch(`${API_URLS.base}/api/images/${imageId}/metadata`, {
      method: 'PUT',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(metadata),
    });

    if (!response.ok) {
      throw new Error('Errore durante l\'aggiornamento dei metadata');
    }
  } catch (error) {
    console.error('Errore nell\'aggiornamento dei metadata:', error);
    throw error;
  }
};

// Funzione specializzata per aggiornare solo il tipo di un'immagine
export const updateImageType = async (imageId: string, type: string): Promise<void> => {
  try {
    const response = await fetch(`${API_URLS.base}/api/images/${imageId}/type`, {
      method: 'PUT',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ type }),
    });

    if (!response.ok) {
      throw new Error('Errore durante l\'aggiornamento del tipo di immagine');
    }
  } catch (error) {
    console.error('Errore nell\'aggiornamento del tipo di immagine:', error);
    throw error;
  }
}; 