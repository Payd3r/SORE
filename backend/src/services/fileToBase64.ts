import fs from 'fs';
import path from 'path';

const MEDIA_BASE_PATH = 'media';

export async function fileToBase64(filePath: string): Promise<string> {
  try {
    // Normalizza il percorso rimuovendo eventuali prefissi /media/ o media\
    let cleanPath = filePath;
    if (cleanPath.startsWith('/media/')) {
      cleanPath = cleanPath.substring(7);
    } else if (cleanPath.startsWith('media\\') || cleanPath.startsWith('media/')) {
      cleanPath = cleanPath.substring(6);
    }

    const absolutePath = path.join(process.cwd(), MEDIA_BASE_PATH, cleanPath);

    if (!fs.existsSync(absolutePath)) {
      console.error(`File non trovato: ${absolutePath}`);
      return '';
    }

    const buffer = await fs.promises.readFile(absolutePath);
    const base64 = buffer.toString('base64');
    return `data:image/jpeg;base64,${base64}`;
  } catch (error) {
    console.error(`Errore nella lettura del file ${filePath}:`, error);
    return '';
  }
} 