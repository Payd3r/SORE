import pool from '../src/config/db';
import fs from 'fs';
import path from 'path';

async function run() {
  const sqlPath = path.join(__dirname, '../migrations/add_memory_views_tracking.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');

  try {
    await pool.promise().query(sql);
    console.log('Migrazione add_memory_views_tracking eseguita con successo.');
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error('Errore:', msg);
    process.exit(1);
  } finally {
    await pool.promise().end();
  }
}

run();
