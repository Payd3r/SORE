import { API_URLS } from './config';

export interface SharedMemory {
  token: string;
  memoryId: number;
  title: string;
  type: string;
  start_date: string | null;
  end_date: string | null;
  location: string | null;
  song: string | null;
  description: string | null;
  image: string | null;
}

export interface SharedMemoryResponse {
  data: SharedMemory;
}

export const getSharedMemory = async (token: string): Promise<SharedMemoryResponse> => {
  const response = await fetch(`${API_URLS.base}/api/share/${token}`);

  if (!response.ok) {
    throw new Error('Link condiviso non valido o scaduto');
  }

  return response.json();
};
