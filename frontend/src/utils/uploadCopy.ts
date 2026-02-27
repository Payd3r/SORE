import { UploadFileState } from '../types/upload';

export const getUploadStatusLabel = (state: UploadFileState): string => {
  switch (state) {
    case 'queued':
      return 'In coda';
    case 'processing':
      return 'In caricamento';
    case 'completed':
      return 'Completato';
    case 'failed':
      return 'Errore';
    case 'notfound':
      return 'Non trovato';
    default:
      return 'Sconosciuto';
  }
};

export const getUploadStatusMessage = (state: UploadFileState, customMessage?: string): string => {
  if (customMessage && customMessage.trim().length > 0) {
    return customMessage;
  }

  switch (state) {
    case 'queued':
      return 'File in coda. Inizio upload tra pochi secondi.';
    case 'processing':
      return 'Stiamo elaborando il file in background.';
    case 'completed':
      return 'Upload completato. Il file è disponibile in galleria.';
    case 'failed':
      return 'Upload non riuscito. Controlla la connessione e riprova.';
    case 'notfound':
      return 'Job non trovato. Potrebbe essere scaduto dal server.';
    default:
      return 'Stato non disponibile';
  }
};
