import React, { useState, useCallback } from 'react';
import { imageService, ImageStatusResponse } from '../api/imageService';
import { optimizeImage } from '../utils/imageOptimization';
import './ImageUpload.css';

interface ImageUploadProps {
  onUploadComplete?: () => void;
  onUploadError?: (error: Error) => void;
}

interface ImageStatus {
  jobId: string;
  fileName: string;
  status: ImageStatusResponse['state'];
  progress: number;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  onUploadComplete,
  onUploadError,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [imageStatuses, setImageStatuses] = useState<ImageStatus[]>([]);

  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    setIsUploading(true);
    setImageStatuses(files.map(file => ({
      jobId: '',
      fileName: file.name,
      status: 'queued' as const,
      progress: 0,
    })));

    try {
      // Ottimizza le immagini prima del caricamento
      const optimizedFiles = await Promise.all(
        files.map(async (file) => {
          try {
            const optimizedBlob = await optimizeImage(file);
            return new File([optimizedBlob], file.name, { type: 'image/jpeg' });
          } catch (error) {
            console.error('Errore nell\'ottimizzazione dell\'immagine:', error);
            return file; // Fallback al file originale in caso di errore
          }
        })
      );

      const response = await imageService.uploadImages(optimizedFiles);
      
      // Aggiorna gli stati iniziali con i jobId
      setImageStatuses(prev => prev.map((status, index) => ({
        ...status,
        jobId: response.data[index].jobId,
      })));

      // Avvia il polling per ogni immagine
      response.data.forEach(({ jobId }) => {
        imageService.pollImageStatus(jobId, (status: ImageStatusResponse) => {
          setImageStatuses(prev => prev.map(imgStatus => {
            if (imgStatus.jobId === jobId) {
              return {
                ...imgStatus,
                status: status.state,
                progress: status.state === 'processing' ? 50 : 
                         status.state === 'completed' ? 100 : 
                         status.state === 'failed' ? 0 : 25,
              };
            }
            return imgStatus;
          }));
        });
      });

      // Controlla periodicamente se tutte le immagini sono state processate
      const checkCompletion = setInterval(() => {
        setImageStatuses(prev => {
          const allCompleted = prev.every(status => 
            status.status === 'completed' || status.status === 'failed'
          );
          
          if (allCompleted) {
            clearInterval(checkCompletion);
            setIsUploading(false);
            const hasErrors = prev.some(status => status.status === 'failed');
            
            if (hasErrors) {
              onUploadError?.(new Error('Alcune immagini non sono state caricate correttamente'));
            } else {
              onUploadComplete?.();
            }
          }
          
          return prev;
        });
      }, 1000);

    } catch (error) {
      setIsUploading(false);
      onUploadError?.(error instanceof Error ? error : new Error('Errore durante l\'upload'));
    }
  }, [onUploadComplete, onUploadError]);

  const getStatusColor = (status: ImageStatusResponse['state']) => {
    switch (status) {
      case 'completed':
        return '#4CAF50';
      case 'failed':
        return '#f44336';
      case 'processing':
        return '#2196F3';
      case 'queued':
        return '#FFC107';
      default:
        return '#9E9E9E';
    }
  };

  const getStatusText = (status: ImageStatusResponse['state']) => {
    switch (status) {
      case 'completed':
        return 'Completato';
      case 'failed':
        return 'Fallito';
      case 'processing':
        return 'In elaborazione';
      case 'queued':
        return 'In coda';
      default:
        return 'Sconosciuto';
    }
  };

  return (
    <div className="image-upload-container">
      <div className="upload-section">
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileChange}
          disabled={isUploading}
          className="file-input"
        />
        <label className="upload-button">
          {isUploading ? 'Caricamento in corso...' : 'Seleziona immagini'}
        </label>
      </div>

      {imageStatuses.length > 0 && (
        <div className="status-list">
          {imageStatuses.map((status, index) => (
            <div key={status.jobId || index} className="status-item">
              <div className="status-info">
                <span className="file-name">{status.fileName}</span>
                <span 
                  className="status-badge"
                  style={{ backgroundColor: getStatusColor(status.status) }}
                >
                  {getStatusText(status.status)}
                </span>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ width: `${status.progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}; 