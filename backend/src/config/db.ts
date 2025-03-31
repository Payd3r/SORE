import mysql from 'mysql2';
import dotenv from 'dotenv';

dotenv.config();

// Configurazione della connessione con MySQL/MariaDB
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT || '3306'),
});

// Esportiamo il pool di connessione
export default pool;
