/**
 * Script diagnostico: verifica dati per la mappa (memories con immagini geolocalizzate)
 * Esecuzione: npx ts-node scripts/check-map-data.ts
 */
import pool from '../src/config/db';

async function main() {
  const coupleId = 1;

  console.log('=== Diagnostica mappa per couple_id =', coupleId, '===\n');

  const [imagesWithCoords] = await pool.promise().query<any[]>(
    `SELECT id, memory_id, couple_id, latitude, longitude, thumb_small_path
     FROM images WHERE couple_id = ? AND latitude IS NOT NULL AND longitude IS NOT NULL`,
    [coupleId]
  );
  console.log('1. Immagini con coordinate (lat/lon not null):', imagesWithCoords.length);

  const [imagesWithMemory] = await pool.promise().query<any[]>(
    `SELECT id, memory_id, couple_id, latitude, longitude
     FROM images WHERE couple_id = ? AND memory_id IS NOT NULL AND latitude IS NOT NULL AND longitude IS NOT NULL`,
    [coupleId]
  );
  console.log('2. Immagini con memory_id + coordinate:', imagesWithMemory.length);

  const [memoriesCount] = await pool.promise().query<any[]>(
    `SELECT COUNT(*) as cnt FROM memories WHERE couple_id = ?`,
    [coupleId]
  );
  console.log('3. Totale ricordi per la coppia:', (memoriesCount[0] as any).cnt);

  const [mapMemoriesQuery] = await pool.promise().query<any[]>(
    `SELECT m.id as memory_id, m.title, m.type,
       i.id as image_id, i.latitude as lat, i.longitude as lon
     FROM memories m
     JOIN images i ON i.memory_id = m.id
     WHERE m.couple_id = ? AND i.couple_id = ?
       AND i.latitude IS NOT NULL AND i.longitude IS NOT NULL
       AND (m.type IS NULL OR m.type <> 'FUTURO')
     ORDER BY m.id, i.display_order ASC, i.id ASC
     LIMIT 5`,
    [coupleId, coupleId]
  );
  console.log('4. Query map/memories (primi 5 risultati):', mapMemoriesQuery.length);
  if (mapMemoriesQuery.length) {
    console.log('   Esempio:', mapMemoriesQuery[0]);
  }

  await pool.promise().end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
