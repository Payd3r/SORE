import mysql from 'mysql2';
import dotenv from 'dotenv';

dotenv.config();

// Configurazione della connessione con MySQL/MariaDB
const pool = mysql.createPool({
  host: process.env.DB_HOST, // 127.0.0.1 per MySQL in locale
  user: process.env.DB_USER, // 'payd3r'
  password: process.env.DB_PASSWORD, // 'soniaculo2003'
  database: process.env.DB_NAME, // 'sore'
  port: parseInt(process.env.DB_PORT || '5000'), // Porta MySQL predefinita è 3306, se non è specificata, si usa 3306
});

// Esportiamo il pool di connessione
export default pool;
