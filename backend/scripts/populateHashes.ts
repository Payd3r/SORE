import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import pool from '../src/config/db';
import { Image } from '../src/types/db';
import dotenv from 'dotenv';

dotenv.config();

const MEDIA_BASE_PATH = 'media';

/**
 * Calcola hash SHA256 di un file
 */
function calculateFileHash(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    const stream = fs.createReadStream(filePath);

    stream.on('data', (data) => hash.update(data));
    stream.on('end', () => resolve(hash.digest('hex')));
    stream.on('error', reject);
  });
}

/**
 * Normalizza un percorso rimuovendo prefissi /media/ o media/ e convertendo backslash in forward slash
 */
function normalizePath(filePath: string): string {
  let cleanPath = filePath;
  if (cleanPath.startsWith('/media/')) {
    cleanPath = cleanPath.substring(7);
  } else if (cleanPath.startsWith('media\\') || cleanPath.startsWith('media/')) {
    cleanPath = cleanPath.substring(6);
  }
  // Converti tutti i backslash in forward slash (per compatibilità Windows -> Linux)
  cleanPath = cleanPath.replace(/\\/g, '/');
  return cleanPath;
}

/**
 * Ottiene il percorso assoluto di un file
 */
function getAbsolutePath(relativePath: string): string {
  const normalized = normalizePath(relativePath);
  return path.join(process.cwd(), MEDIA_BASE_PATH, normalized);
}

async function populateHashes() {
  console.log('🚀 Avvio popolamento hash per immagini esistenti...\n');

  try {
    // Recupera tutte le immagini dal database
    const [images] = await pool.promise().query<Image[]>(
      'SELECT id, original_path, webp_path FROM images ORDER BY id'
    );

    const totalImages = images.length;
    console.log(`📊 Trovate ${totalImages} immagini da processare\n`);

    let processed = 0;
    let updated = 0;
    let errors = 0;
    const errorsList: Array<{ id: number; error: string }> = [];

    for (const image of images) {
      processed++;
      const progress = ((processed / totalImages) * 100).toFixed(1);
      process.stdout.write(`\r⏳ Progresso: ${processed}/${totalImages} (${progress}%)`);

      try {
        let hashOriginal: string | null = null;
        let hashWebp: string | null = null;

        // Calcola hash del file originale
        if (image.original_path) {
          const originalPath = getAbsolutePath(image.original_path);
          if (fs.existsSync(originalPath)) {
            hashOriginal = await calculateFileHash(originalPath);
          } else {
            console.error(`\n⚠️  File originale non trovato: ${originalPath} (ID: ${image.id})`);
          }
        }

        // Calcola hash del file WebP
        if (image.webp_path) {
          const webpPath = getAbsolutePath(image.webp_path);
          if (fs.existsSync(webpPath)) {
            hashWebp = await calculateFileHash(webpPath);
          } else {
            console.error(`\n⚠️  File WebP non trovato: ${webpPath} (ID: ${image.id})`);
          }
        }

        // Aggiorna il database solo se almeno un hash è stato calcolato
        if (hashOriginal || hashWebp) {
          await pool.promise().query(
            'UPDATE images SET hash_original = ?, hash_webp = ? WHERE id = ?',
            [hashOriginal, hashWebp, image.id]
          );
          updated++;
        } else {
          errors++;
          errorsList.push({
            id: image.id,
            error: 'Nessun file trovato per calcolare hash'
          });
        }
      } catch (error) {
        errors++;
        const errorMessage = error instanceof Error ? error.message : 'Errore sconosciuto';
        errorsList.push({
          id: image.id,
          error: errorMessage
        });
        console.error(`\n❌ Errore processando immagine ID ${image.id}: ${errorMessage}`);
      }
    }

    console.log('\n\n✅ Popolamento hash completato!');
    console.log(`📈 Statistiche:`);
    console.log(`   - Immagini processate: ${processed}`);
    console.log(`   - Hash aggiornati: ${updated}`);
    console.log(`   - Errori: ${errors}`);

    if (errorsList.length > 0) {
      console.log(`\n⚠️  Errori dettagliati:`);
      errorsList.slice(0, 10).forEach((err) => {
        console.log(`   - ID ${err.id}: ${err.error}`);
      });
      if (errorsList.length > 10) {
        console.log(`   ... e altri ${errorsList.length - 10} errori`);
      }
    }

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Errore fatale durante il popolamento hash:', error);
    process.exit(1);
  }
}

// Esegui lo script
populateHashes();

