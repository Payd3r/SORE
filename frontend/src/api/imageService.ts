import axios from 'axios';

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
}

const API_BASE_URL = '/api/images';

export const imageService = {
  uploadImages: async (files: File[]): Promise<ImageUploadResponse> => {
    const formData = new FormData();
    files.forEach(file => formData.append('images', file));
    
    const response = await axios.post<ImageUploadResponse>(`${API_BASE_URL}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  },

  checkImageStatus: async (jobId: string): Promise<ImageStatusResponse> => {
    const response = await axios.get<ImageStatusResponse>(`${API_BASE_URL}/status/${jobId}`);
    return response.data;
  },

  pollImageStatus: async (
    jobId: string,
    onUpdate: (status: ImageStatusResponse) => void,
    interval: number = 2000
  ): Promise<void> => {
    const poll = async () => {
      try {
        const status = await imageService.checkImageStatus(jobId);
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
        });
      }
    };
    
    poll();
  },
}; 