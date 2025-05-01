import pool from '../config/db';
import { RowDataPacket, PoolConnection } from 'mysql2/promise';

export async function updateMemoryDates(memoryId: number, connection?: PoolConnection) {
  let conn: PoolConnection | undefined = connection;
  let needToRelease = false;

  try {
    //console.log('\x1b[36m%s\x1b[0m', `[Memory] Starting date update for memory ${memoryId}`);

    // Se non è stata fornita una connessione, ne creiamo una nuova
    if (!conn) {
      conn = await pool.promise().getConnection();
      needToRelease = true;
    }

    // Ottieni tutte le date delle immagini associate
    const [imagesResult] = await conn.query<(RowDataPacket & { id: number, created_at: Date })[]>(
      `SELECT id, created_at 
       FROM images 
       WHERE memory_id = ? 
       AND created_at IS NOT NULL 
       ORDER BY created_at ASC`,
      [memoryId]
    );

    if (!imagesResult || imagesResult.length === 0) {
      //console.log('\x1b[33m%s\x1b[0m', `[Memory] No images found for memory ${memoryId}`);
      return;
    }

    //console.log('\x1b[32m%s\x1b[0m', `[Memory] Found ${imagesResult.length} images`);

    // Converti le date in timestamp per calcoli più facili
    const dates = imagesResult.map(img => new Date(img.created_at).getTime());
    //console.log('\x1b[36m%s\x1b[0m', '[Memory] Original dates:', dates.map(d => new Date(d).toISOString()));

    // Se abbiamo solo una immagine, usala come riferimento
    if (dates.length === 1) {
      const singleDate = new Date(dates[0]);
      const startDate = singleDate;
      const endDate = new Date(singleDate.getTime() + 24 * 60 * 60 * 1000); // Aggiungi 1 giorno

      await conn.query(
        `UPDATE memories 
         SET 
          start_date = ?,
          end_date = ?
         WHERE id = ?`,
        [startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0], memoryId]
      );

      //console.log('\x1b[32m%s\x1b[0m', `[Memory] Single image case - Updated memory ${memoryId}:`, {
        date: singleDate.toISOString(),
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      });
      return;
    }

    // Calcola le differenze tra date consecutive
    const dateDiffs = [];
    for (let i = 1; i < dates.length; i++) {
      dateDiffs.push(dates[i] - dates[i-1]);
    }

    // Trova la differenza massima tra date consecutive
    const maxDiff = Math.max(...dateDiffs);
    const maxDiffIndex = dateDiffs.indexOf(maxDiff);

    //console.log('\x1b[36m%s\x1b[0m', '[Memory] Date differences:', dateDiffs.map(d => Math.round(d / (24 * 60 * 60 * 1000)) + ' days'));

    // Se la differenza massima è maggiore di 5 giorni, consideriamo le immagini prima e dopo come gruppi separati
    const FIVE_DAYS = 5 * 24 * 60 * 60 * 1000;
    if (maxDiff > FIVE_DAYS) {
      //console.log('\x1b[33m%s\x1b[0m', `[Memory] Found significant gap of ${Math.round(maxDiff / (24 * 60 * 60 * 1000))} days at index ${maxDiffIndex}`);

      // Prendi il gruppo più numeroso
      const group1Size = maxDiffIndex + 1;
      const group2Size = dates.length - (maxDiffIndex + 1);

      //console.log('\x1b[36m%s\x1b[0m', '[Memory] Group sizes:', {
        group1: group1Size,
        group2: group2Size
      });

      let validDates;
      if (group1Size >= group2Size) {
        validDates = dates.slice(0, group1Size);
      } else {
        validDates = dates.slice(group1Size);
      }

      //console.log('\x1b[32m%s\x1b[0m', '[Memory] Selected group dates:', validDates.map(d => new Date(d).toISOString()));

      // Calcola il range per il gruppo selezionato
      const startDate = new Date(validDates[0]);
      const endDate = new Date(validDates[validDates.length - 1]);

      // Verifica che la durata non superi i 20 giorni
      const maxDuration = 20 * 24 * 60 * 60 * 1000;
      const duration = endDate.getTime() - startDate.getTime();

      if (duration > maxDuration) {
        endDate.setTime(startDate.getTime() + maxDuration);
        //console.log('\x1b[33m%s\x1b[0m', '[Memory] Range exceeded 20 days, adjusted end date to:', endDate.toISOString());
      }

      // Identifica le immagini outlier (quelle non nel gruppo selezionato)
      const outlierImages = imagesResult.filter((img, index) => {
        const imgDate = new Date(img.created_at).getTime();
        return validDates.indexOf(imgDate) === -1;
      });

      //console.log('\x1b[36m%s\x1b[0m', `[Memory] Found ${outlierImages.length} outlier images:`, 
        outlierImages.map(img => ({
          id: img.id,
          date: new Date(img.created_at).toISOString()
        }))
      );

      // Aggiorna le date delle immagini outlier
      if (outlierImages.length > 0) {
        //console.log('\x1b[33m%s\x1b[0m', `[Memory] Updating ${outlierImages.length} outlier images`);
        
        for (const img of outlierImages) {
          const randomDate = new Date(
            startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime())
          );

          await conn.query(
            `UPDATE images 
             SET created_at = ? 
             WHERE id = ?`,
            [randomDate.toISOString(), img.id]
          );

          //console.log('\x1b[32m%s\x1b[0m', `[Memory] Updated image ${img.id}:`, {
            oldDate: new Date(img.created_at).toISOString(),
            newDate: randomDate.toISOString()
          });
        }
      }

      // Aggiorna le date del memory
      await conn.query(
        `UPDATE memories 
         SET 
          start_date = ?,
          end_date = ?
         WHERE id = ?`,
        [startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0], memoryId]
      );

      //console.log('\x1b[32m%s\x1b[0m', `[Memory] Successfully updated memory ${memoryId}:`, {
        totalImages: dates.length,
        validImages: validDates.length,
        outlierImages: outlierImages.length,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        duration: Math.round(duration / (24 * 60 * 60 * 1000)) + ' days'
      });
    } else {
      // Se non ci sono gap significativi, usa tutte le date
      const startDate = new Date(dates[0]);
      const endDate = new Date(dates[dates.length - 1]);
      const duration = endDate.getTime() - startDate.getTime();
      const maxDuration = 20 * 24 * 60 * 60 * 1000;

      if (duration > maxDuration) {
        endDate.setTime(startDate.getTime() + maxDuration);
        //console.log('\x1b[33m%s\x1b[0m', '[Memory] Range exceeded 20 days, adjusted end date to:', endDate.toISOString());
      }

      await conn.query(
        `UPDATE memories 
         SET 
          start_date = ?,
          end_date = ?
         WHERE id = ?`,
        [startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0], memoryId]
      );

      //console.log('\x1b[32m%s\x1b[0m', `[Memory] No significant gaps found - Updated memory ${memoryId}:`, {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        duration: Math.round(duration / (24 * 60 * 60 * 1000)) + ' days'
      });
    }
  } catch (error) {
    console.error('\x1b[31m%s\x1b[0m', '[Memory] Error updating dates:', error instanceof Error ? error.message : 'Unknown error');
    throw error;
  } finally {
    // Rilascia la connessione solo se l'abbiamo creata noi
    if (needToRelease && conn) {
      conn.release();
    }
  }
} 