/**
 * Script per popolare il DB locale con dati di test.
 * Usa la coppia e gli utenti già presenti, le immagini dalla cartella fotine.
 *
 * Esecuzione: npm run seed (dalla cartella backend)
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import pool from '../src/config/db';
import { ImageType } from '../src/types/db';

const FOTINE_DIR = path.resolve(__dirname, '../../fotine');
const MEDIA_BASE = path.join(process.cwd(), 'media');

// Solo JPG/PNG per evitare dipendenze da heic-convert
const IMAGE_EXT = ['.jpg', '.jpeg', '.png', '.JPG', '.JPEG', '.PNG'];

interface CoupleInfo {
  id: number;
  name: string;
}
interface UserInfo {
  id: number;
  name: string;
  couple_id: number;
}

const MEMORIES_DATA = [
  {
    title: 'Weekend a Roma',
    description: 'Un weekend romantico nella Città Eterna. Colosseo, Fontana di Trevi e gelato fino a tardi.',
    type: 'viaggio' as const,
    location: 'Roma, Italia',
    start_date: '2024-06-15',
    end_date: '2024-06-17',
  },
  {
    title: 'Compleanno speciale',
    description: 'Festa a sorpresa e torta fatta in casa. Il migliore compleanno di sempre!',
    type: 'evento' as const,
    location: 'Casa',
    start_date: '2024-08-20',
    end_date: '2024-08-20',
  },
  {
    title: 'Pranzo al tramonto',
    description: 'Una cena vista mare che non dimenticheremo mai.',
    type: 'semplice' as const,
    location: 'Liguria',
    start_date: '2024-07-12',
    end_date: null,
  },
  {
    title: 'Viaggio in Giappone',
    description: 'Tokyo, Kyoto e i ciliegi in fiore. Un sogno che si avvera.',
    type: 'viaggio' as const,
    location: 'Giappone',
    start_date: '2024-04-01',
    end_date: '2024-04-15',
  },
  {
    title: 'Primo anniversario insieme',
    description: 'Un anno pieno di sorrisi, avventure e amore.',
    type: 'evento' as const,
    location: 'Milano',
    start_date: '2024-09-01',
    end_date: '2024-09-01',
  },
  {
    title: 'Gita in montagna',
    description: 'Escursione tra i sentieri e pranzo al sacco con vista sulle vette.',
    type: 'semplice' as const,
    location: 'Dolomiti',
    start_date: '2024-07-28',
    end_date: null,
  },
  {
    title: 'Matrimonio dei nostri amici',
    description: 'Una giornata magica a celebrare l\'amore dei nostri cari.',
    type: 'evento' as const,
    location: 'Toscana',
    start_date: '2024-10-05',
    end_date: '2024-10-05',
  },
];

const IDEAS_DATA = [
  { title: 'Ristorante Da Mario', description: 'Pizza napoletana autentica, prenotare con anticipo', type: 'RISTORANTI' },
  { title: 'Gita a Venezia', description: 'Un weekend nella città sull\'acqua', type: 'VIAGGI' },
  { title: 'Cena a lume di candela', description: 'Cucinare insieme qualcosa di speciale', type: 'SEMPLICI' },
  { title: 'Sfida cucina fusion', description: 'Chi prepara il piatto più buono?', type: 'SFIDE' },
  { title: 'Trattoria del borgo', description: 'Locale tipico con vista sulle colline', type: 'RISTORANTI' },
  { title: 'Road trip in Sicilia', description: 'Una settimana tra mare e cultura', type: 'VIAGGI' },
  { title: 'Film sotto le stelle', description: 'Proiettore in giardino e popcorn', type: 'SEMPLICI' },
  { title: 'Sfida board game', description: 'Chi vince 3 partite di Catan?', type: 'SFIDE' },
  { title: 'Sushi bar fusion', description: 'Per il prossimo compleanno', type: 'RISTORANTI' },
  { title: 'Weekend a Barcellona', description: 'Sagrada Familia e tapas', type: 'VIAGGI' },
];

async function getCoupleAndUsers(): Promise<{ couple: CoupleInfo; users: UserInfo[] }> {
  const [couples] = await pool.promise().query('SELECT id, name FROM couples LIMIT 1') as [CoupleInfo[], unknown];
  if (!couples.length) {
    throw new Error('Nessuna coppia trovata nel DB. Registra prima una coppia tramite l\'app.');
  }
  const couple = couples[0];

  const [users] = await pool.promise().query(
    'SELECT id, name, couple_id FROM users WHERE couple_id = ?',
    [couple.id]
  ) as [UserInfo[], unknown];
  if (!users.length) {
    throw new Error('Nessun utente trovato per la coppia. Completa la registrazione.');
  }

  return { couple, users };
}

function getImageFiles(): string[] {
  if (!fs.existsSync(FOTINE_DIR)) {
    throw new Error(`Cartella fotine non trovata: ${FOTINE_DIR}`);
  }
  const files = fs.readdirSync(FOTINE_DIR);
  return files
    .filter((f) => IMAGE_EXT.some((ext) => f.toLowerCase().endsWith(ext.toLowerCase())))
    .map((f) => path.join(FOTINE_DIR, f));
}

async function processAndInsertImage(
  sourcePath: string,
  coupleId: number,
  userId: number,
  memoryId: number | null,
  displayOrder: number,
  conn: any
): Promise<number | null> {
  const imageId = uuidv4();
  const imageDir = path.join(MEDIA_BASE, imageId);
  const ext = path.extname(sourcePath).toLowerCase().slice(1) || 'jpg';

  try {
    const buffer = await fs.promises.readFile(sourcePath);
    const hashOriginal = crypto.createHash('sha256').update(buffer).digest('hex');

    const webpBuffer = await sharp(buffer)
      .rotate()
      .webp({ quality: 90, effort: 6 })
      .toBuffer();
    const hashWebp = crypto.createHash('sha256').update(webpBuffer).digest('hex');

    fs.mkdirSync(imageDir, { recursive: true });

    const originalPath = path.join(imageDir, `original.${ext}`);
    const webpPath = path.join(imageDir, 'image.webp');
    const thumbBigPath = path.join(imageDir, 'thumb_big.webp');
    const thumbSmallPath = path.join(imageDir, 'thumb_small.webp');

    await fs.promises.writeFile(originalPath, buffer);
    await fs.promises.writeFile(webpPath, webpBuffer);
    await sharp(buffer).rotate().resize(400, 400, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 80 }).toFile(thumbBigPath);
    await sharp(buffer).rotate().resize(200, 200, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 80 }).toFile(thumbSmallPath);

    const relBase = `media/${imageId}`;

    const [result] = await conn.query(
      `INSERT INTO images (
        original_path, webp_path, thumb_big_path, thumb_small_path,
        couple_id, created_by_user_id, memory_id, type, display_order,
        hash_original, hash_webp
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        `${relBase}/original.${ext}`,
        `${relBase}/image.webp`,
        `${relBase}/thumb_big.webp`,
        `${relBase}/thumb_small.webp`,
        coupleId,
        userId,
        memoryId,
        ImageType.LANDSCAPE,
        displayOrder,
        hashOriginal,
        hashWebp,
      ]
    );
    return (result as any).insertId;
  } catch (err) {
    console.error(`  ⚠️ Errore su ${path.basename(sourcePath)}:`, (err as Error).message);
    if (fs.existsSync(imageDir)) fs.rmSync(imageDir, { recursive: true });
    return null;
  }
}

async function seed() {
  console.log('🌱 Avvio seed del database...\n');

  const { couple, users } = await getCoupleAndUsers();
  const userId = users[0].id;
  console.log(`👫 Coppia: ${couple.name} | User: ${users[0].name} (id: ${userId})\n`);

  const imageFiles = getImageFiles();
  console.log(`📷 Trovate ${imageFiles.length} immagini in fotine/\n`);

  const conn = await pool.promise().getConnection();

  try {
    // 1. Memories
    console.log('📝 Inserimento memories...');
    const memoryIds: number[] = [];
    for (const m of MEMORIES_DATA) {
      const [r] = await conn.query(
        `INSERT INTO memories (title, description, couple_id, created_by_user_id, type, start_date, end_date, location)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [m.title, m.description, couple.id, userId, m.type, m.start_date, m.end_date, m.location]
      );
      memoryIds.push((r as any).insertId);
    }
    console.log(`   ✓ ${memoryIds.length} memories inseriti\n`);

    // 2. Ideas
    console.log('💡 Inserimento ideas...');
    for (const idea of IDEAS_DATA) {
      const checked = Math.random() > 0.7 ? 1 : 0;
      const dateChecked = checked ? new Date().toISOString().slice(0, 19).replace('T', ' ') : null;
      await conn.query(
        `INSERT INTO ideas (title, description, type, couple_id, created_by_user_id, checked, date_checked)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [idea.title, idea.description, idea.type, couple.id, userId, checked, dateChecked]
      );
    }
    console.log(`   ✓ ${IDEAS_DATA.length} ideas inserite\n`);

    // 3. Images - distribuite tra i memories (max ~40 per non impiegare troppo)
    const maxImages = Math.min(40, imageFiles.length);
    const imagesToUse = imageFiles.slice(0, maxImages);
    const imagesPerMemory = Math.ceil(imagesToUse.length / memoryIds.length);

    console.log(`🖼️  Processamento ${maxImages} immagini (questo può richiedere qualche minuto)...`);
    let ok = 0;
    let fail = 0;

    for (let i = 0; i < imagesToUse.length; i++) {
      const memoryIdx = Math.floor(i / imagesPerMemory);
      const memoryId = memoryIds[Math.min(memoryIdx, memoryIds.length - 1)];
      const id = await processAndInsertImage(
        imagesToUse[i],
        couple.id,
        userId,
        memoryId,
        i + 1,
        conn
      );
      if (id) ok++;
      else fail++;
      if ((i + 1) % 5 === 0) {
        process.stdout.write(`   ${i + 1}/${maxImages}...\r`);
      }
    }

    console.log(`   ✓ ${ok} immagini inserite, ${fail} errori\n`);

    // 4. Notifications (qualche notifica di esempio)
    console.log('🔔 Inserimento notifiche...');
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
    await conn.query(
      `INSERT INTO notifications (user_id, title, body, icon, url, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [userId, 'Nuovo ricordo condiviso', 'Sono state aggiunte nuove foto dal weekend!', null, '/gallery', 1, now]
    );
    await conn.query(
      `INSERT INTO notifications (user_id, title, body, icon, url, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [userId, 'Idea completata', 'Hai segnato come fatto "Ristorante Da Mario"', null, '/ideas', 1, now]
    );
    console.log('   ✓ 2 notifiche inserite\n');

    console.log('✅ Seed completato con successo!');
  } finally {
    conn.release();
    process.exit(0);
  }
}

seed().catch((err) => {
  console.error('❌ Errore:', err.message);
  process.exit(1);
});
