/**
 * Aggiunge coordinate GPS di esempio alle immagini collegate ai ricordi,
 * così la mappa PWA mostra i marker. Usa luoghi coerenti con i ricordi.
 *
 * Esecuzione: npm run add-map-coordinates (oppure: npx ts-node scripts/add-map-coordinates.ts)
 */
import pool from '../src/config/db';

// Coordinate per luogo (lat, lon) - usate per distribuire le immagini sui ricordi
const PLACES: { lat: number; lon: number }[] = [
  { lat: 41.9028, lon: 12.4964 },   // Roma
  { lat: 45.4642, lon: 9.19 },      // Milano
  { lat: 44.4056, lon: 8.9463 },    // Genova / Liguria
  { lat: 35.6762, lon: 139.6503 },  // Tokyo
  { lat: 46.4983, lon: 11.3548 },   // Dolomiti
  { lat: 43.7696, lon: 11.2558 },   // Firenze / Toscana
];

async function main() {
  console.log('🗺️  Aggiunta coordinate GPS di esempio alle immagini...\n');

  const [images] = await pool.promise().query<any[]>(
    `SELECT i.id, i.memory_id, i.couple_id
     FROM images i
     WHERE i.memory_id IS NOT NULL
     ORDER BY i.memory_id, i.display_order ASC`
  );

  if (!images.length) {
    console.log('Nessuna immagine con memory_id trovata.');
    await pool.promise().end();
    return;
  }

  // Una sola immagine per memory (la prima) - così la mappa mostra un marker per ricordo
  const firstImageByMemory = new Map<number, { id: number }>();
  for (const img of images) {
    if (!firstImageByMemory.has(img.memory_id)) {
      firstImageByMemory.set(img.memory_id, { id: img.id });
    }
  }

  let placeIdx = 0;
  let count = 0;
  for (const [, { id }] of firstImageByMemory) {
    const { lat, lon } = PLACES[placeIdx % PLACES.length];
    await pool.promise().query(
      'UPDATE images SET latitude = ?, longitude = ?, country = ? WHERE id = ?',
      [lat, lon, 'Italia', id]
    );
    placeIdx++;
    count++;
  }

  console.log(`✓ Aggiornate ${count} immagini con coordinate.\n`);
  console.log('Ricarica la mappa PWA per vedere i marker.');

  await pool.promise().end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
