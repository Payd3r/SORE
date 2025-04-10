import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import compression from 'compression';

// Otteniamo il percorso del file e della directory corrente
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configurazione server
const app = express();
const PORT = process.env.PORT || 4000;

// Abilita la compressione gzip/deflate per tutte le risposte
app.use(compression());

// Imposta gli header per Service Worker
app.use((req, res, next) => {
  res.setHeader('Service-Worker-Allowed', '/');
  next();
});

// Servi i file statici dalla directory dist (output di vite build)
app.use(express.static(join(__dirname, 'dist')));

// Configura il Content-Type corretto per i file .js come moduli ES
app.use((req, res, next) => {
  if (req.url.endsWith('.js')) {
    res.setHeader('Content-Type', 'application/javascript; charset=UTF-8');
  }
  next();
});

// Supporto per SPA - tutti i percorsi non trovati vengono reindirizzati a index.html
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

// Avvio del server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server in esecuzione sulla porta ${PORT}`);
}); 