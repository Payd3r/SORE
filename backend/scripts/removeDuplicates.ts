import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import pool from '../src/config/db';
import { Image } from '../src/types/db';
import dotenv from 'dotenv';

dotenv.config();

const MEDIA_BASE_PATH = 'media';

interface ImageWithHash extends Image {
  hash_original: string | null;
  hash_webp: string | null;
  folderPath: string;
  fileSize: number;
}

interface DuplicateGroup {
  hashKey: string;
  images: ImageWithHash[];
  keepImage: ImageWithHash;
  duplicates: ImageWithHash[];
}

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
 * Normalizza un percorso rimuovendo prefissi /media/ o media/
 */
function normalizePath(filePath: string): string {
  let cleanPath = filePath;
  if (cleanPath.startsWith('/media/')) {
    cleanPath = cleanPath.substring(7);
  } else if (cleanPath.startsWith('media\\') || cleanPath.startsWith('media/')) {
    cleanPath = cleanPath.substring(6);
  }
  return cleanPath;
}

/**
 * Ottiene il percorso assoluto di un file
 */
function getAbsolutePath(relativePath: string): string {
  const normalized = normalizePath(relativePath);
  return path.join(process.cwd(), MEDIA_BASE_PATH, normalized);
}

/**
 * Calcola la dimensione totale di una cartella
 */
function calculateFolderSize(folderPath: string): number {
  let totalSize = 0;
  try {
    const files = fs.readdirSync(folderPath);
    for (const file of files) {
      const filePath = path.join(folderPath, file);
      const stats = fs.statSync(filePath);
      if (stats.isFile()) {
        totalSize += stats.size;
      }
    }
  } catch (error) {
    // Ignora errori
  }
  return totalSize;
}

/**
 * Elimina una cartella e tutto il suo contenuto
 */
async function deleteFolder(folderPath: string): Promise<void> {
  try {
    if (fs.existsSync(folderPath)) {
      await fs.promises.rm(folderPath, { recursive: true, force: true });
    }
  } catch (error) {
    throw new Error(`Errore eliminazione cartella ${folderPath}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Seleziona quale immagine mantenere in un gruppo di duplicati
 */
function selectImageToKeep(images: ImageWithHash[]): { keep: ImageWithHash; duplicates: ImageWithHash[] } {
  // Ordina per created_at ASC (più vecchia prima)
  const sorted = [...images].sort((a, b) => {
    const dateA = new Date(a.created_at).getTime();
    const dateB = new Date(b.created_at).getTime();
    return dateA - dateB;
  });

  // Se una ha memory_id e l'altra no, preferire quella con memory_id
  const withMemory = sorted.find(img => img.memory_id !== null);
  const withoutMemory = sorted.find(img => img.memory_id === null);

  if (withMemory && withoutMemory) {
    // Se la più vecchia ha memory_id, mantenerla
    if (sorted[0].memory_id !== null) {
      return { keep: sorted[0], duplicates: sorted.slice(1) };
    }
    // Altrimenti mantenere quella con memory_id (anche se più recente)
    return { keep: withMemory, duplicates: sorted.filter(img => img.id !== withMemory.id) };
  }

  // Se entrambe hanno memory_id o nessuna ha memory_id, mantenere la più vecchia
  return { keep: sorted[0], duplicates: sorted.slice(1) };
}

async function removeDuplicates(dryRun: boolean = true) {
  console.log('🔍 Avvio ricerca duplicati immagini...\n');
  if (dryRun) {
    console.log('⚠️  MODALITÀ DRY-RUN: nessuna modifica verrà applicata\n');
  } else {
    console.log('⚠️  MODALITÀ ELIMINAZIONE: i duplicati verranno eliminati!\n');
  }

  try {
    // Recupera tutte le immagini dal database con hash
    const [images] = await pool.promise().query<ImageWithHash[]>(
      `SELECT 
        id, 
        original_path, 
        webp_path, 
        thumb_big_path,
        thumb_small_path,
        memory_id,
        couple_id,
        created_at,
        hash_original,
        hash_webp
      FROM images 
      WHERE hash_original IS NOT NULL AND hash_webp IS NOT NULL
      ORDER BY couple_id, created_at`
    );

    const totalImages = images.length;
    console.log(`📊 Trovate ${totalImages} immagini con hash calcolati\n`);

    if (totalImages === 0) {
      console.log('⚠️  Nessuna immagine con hash trovata. Esegui prima populateHashes.ts');
      process.exit(0);
    }

    // Raggruppa per (hash_original, hash_webp, couple_id)
    // Nota: i duplicati devono essere nella stessa coppia
    const hashGroups = new Map<string, ImageWithHash[]>();

    for (const image of images) {
      if (!image.hash_original || !image.hash_webp) continue;

      const hashKey = `${image.couple_id}:${image.hash_original}:${image.hash_webp}`;
      
      if (!hashGroups.has(hashKey)) {
        hashGroups.set(hashKey, []);
      }
      hashGroups.get(hashKey)!.push(image);
    }

    // Identifica gruppi con duplicati (più di un elemento)
    const duplicateGroups: DuplicateGroup[] = [];

    for (const [hashKey, groupImages] of hashGroups.entries()) {
      if (groupImages.length > 1) {
        // Calcola informazioni aggiuntive per ogni immagine
        const imagesWithInfo: ImageWithHash[] = await Promise.all(
          groupImages.map(async (img) => {
            const folderPath = path.dirname(getAbsolutePath(img.original_path || ''));
            let fileSize = 0;
            try {
              fileSize = calculateFolderSize(folderPath);
            } catch (error) {
              // Ignora errori
            }
            return {
              ...img,
              folderPath,
              fileSize
            };
          })
        );

        const { keep, duplicates } = selectImageToKeep(imagesWithInfo);
        duplicateGroups.push({
          hashKey,
          images: imagesWithInfo,
          keepImage: keep,
          duplicates
        });
      }
    }

    console.log(`\n📋 Trovati ${duplicateGroups.length} gruppi di duplicati\n`);

    if (duplicateGroups.length === 0) {
      console.log('✅ Nessun duplicato trovato!');
      process.exit(0);
    }

    // Statistiche
    let totalDuplicates = 0;
    let totalSpaceToRecover = 0;
    let memoryTransfers = 0;

    // Mostra dettagli per ogni gruppo
    for (let i = 0; i < duplicateGroups.length; i++) {
      const group = duplicateGroups[i];
      totalDuplicates += group.duplicates.length;
      
      console.log(`\n📦 Gruppo ${i + 1}/${duplicateGroups.length}:`);
      console.log(`   Hash: ${group.hashKey.split(':')[1].substring(0, 16)}...`);
      console.log(`   Duplicati trovati: ${group.images.length}`);
      console.log(`   ✅ Mantenere: ID ${group.keepImage.id} (created: ${new Date(group.keepImage.created_at).toLocaleDateString()})`);
      if (group.keepImage.memory_id) {
        console.log(`      - Associata a memory ID: ${group.keepImage.memory_id}`);
      }

      for (const dup of group.duplicates) {
        totalSpaceToRecover += dup.fileSize;
        console.log(`   ❌ Eliminare: ID ${dup.id} (created: ${new Date(dup.created_at).toLocaleDateString()}, size: ${(dup.fileSize / 1024 / 1024).toFixed(2)} MB)`);
        if (dup.memory_id) {
          console.log(`      - Associata a memory ID: ${dup.memory_id}`);
          // Se il duplicato ha memory_id e quello mantenuto no, trasferiamo
          if (!group.keepImage.memory_id) {
            memoryTransfers++;
            console.log(`      ⚠️  L'associazione al memory verrà trasferita all'immagine mantenuta`);
          }
        }
      }
    }

    console.log(`\n\n📊 Statistiche:`);
    console.log(`   - Gruppi di duplicati: ${duplicateGroups.length}`);
    console.log(`   - Immagini duplicate da eliminare: ${totalDuplicates}`);
    console.log(`   - Spazio da recuperare: ${(totalSpaceToRecover / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   - Trasferimenti memory_id: ${memoryTransfers}`);

    if (dryRun) {
      console.log(`\n⚠️  DRY-RUN: nessuna modifica applicata.`);
      console.log(`   Esegui con --execute per applicare le modifiche`);
      process.exit(0);
    }

    // Esegui eliminazione
    console.log(`\n🗑️  Avvio eliminazione duplicati...\n`);

    let deleted = 0;
    let errors = 0;
    const errorsList: Array<{ id: number; error: string }> = [];

    for (const group of duplicateGroups) {
      // Gestisci trasferimenti memory_id
      for (const dup of group.duplicates) {
        if (dup.memory_id && !group.keepImage.memory_id) {
          try {
            await pool.promise().query(
              'UPDATE images SET memory_id = ? WHERE id = ?',
              [dup.memory_id, group.keepImage.id]
            );
            console.log(`   ✅ Trasferito memory_id ${dup.memory_id} da immagine ${dup.id} a ${group.keepImage.id}`);
          } catch (error) {
            console.error(`   ❌ Errore trasferimento memory_id: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
        }
      }

      // Elimina duplicati
      for (const dup of group.duplicates) {
        try {
          // Elimina cartella fisica
          await deleteFolder(dup.folderPath);

          // Elimina record DB
          await pool.promise().query('DELETE FROM images WHERE id = ?', [dup.id]);

          deleted++;
          console.log(`   ✅ Eliminata immagine ID ${dup.id}`);
        } catch (error) {
          errors++;
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          errorsList.push({ id: dup.id, error: errorMessage });
          console.error(`   ❌ Errore eliminazione immagine ID ${dup.id}: ${errorMessage}`);
        }
      }
    }

    console.log(`\n\n✅ Eliminazione completata!`);
    console.log(`📈 Risultati:`);
    console.log(`   - Immagini eliminate: ${deleted}`);
    console.log(`   - Errori: ${errors}`);
    console.log(`   - Spazio recuperato: ${(totalSpaceToRecover / 1024 / 1024).toFixed(2)} MB`);

    if (errorsList.length > 0) {
      console.log(`\n⚠️  Errori dettagliati:`);
      errorsList.forEach((err) => {
        console.log(`   - ID ${err.id}: ${err.error}`);
      });
    }

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Errore fatale durante la rimozione duplicati:', error);
    process.exit(1);
  }
}

// Parse arguments
const args = process.argv.slice(2);
const dryRun = !args.includes('--execute');

removeDuplicates(dryRun);

