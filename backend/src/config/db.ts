import mysql from 'mysql2';
import dotenv from 'dotenv';
import path from 'path';

// Carica .env dalla root del progetto (utile in dev locale)
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });
dotenv.config(); // Fallback su .env nella cartella corrente

// Supporto sia DB_* (Docker) che MYSQL_* (con fallback per dev locale)
const host = process.env.DB_HOST || process.env.MYSQL_HOST || 'localhost';
// In dev locale MySQL usa porta 3307 per evitare conflitto con altri DB
const port = process.env.DB_PORT || process.env.MYSQL_PORT
  || (host === 'localhost' ? '3307' : '3306');
const pool = mysql.createPool({
  host,
  user: process.env.DB_USER || process.env.MYSQL_USER || 'sore_user',
  password: process.env.DB_PASSWORD || process.env.MYSQL_PASSWORD || 'sore_password',
  database: process.env.DB_NAME || process.env.MYSQL_DATABASE || 'sore',
  port: parseInt(port),
});

// Esportiamo il pool di connessione
export default pool;
