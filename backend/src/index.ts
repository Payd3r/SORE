import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';

// Import routes
import authRoutes from './routes/auth';
import homeRoutes from './routes/home';
import memoriesRoutes from './routes/memories';
import imagesRoutes from './routes/images';
import ideasRoutes from './routes/ideas';
import usersRoutes from './routes/users';
import couplesRoutes from './routes/couples';
import spotifyRoutes from './routes/spotify';
import recapRoutes from './routes/recap';
import mapRoutes from './routes/map';
import notificationRoutes from './routes/notifications';

// Import servizi
import { setupNotificationCron } from './cron/notifications';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3002;

// Configurazione CORS
app.use(cors({
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'Content-Length',
    'X-Requested-With',
    'Accept',
    'Origin',
    'Access-Control-Allow-Origin',
    'Access-Control-Allow-Headers',
    'Access-Control-Allow-Methods'
  ],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  credentials: true,
  maxAge: 86400
}));

// Middleware per il logging delle richieste
app.use((req, res, next) => {
  console.log('\n=== INCOMING REQUEST ===');
  console.log('Time:', new Date().toISOString());
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  console.log('Headers:', req.headers);
  console.log('Content-Type:', req.get('content-type'));
  console.log('=======================\n');
  next();
});

// Gestione delle richieste OPTIONS
app.options('*', cors());

// Serve static files from media directory with caching and security options
app.use('/media', express.static(path.join(__dirname, '../media'), {
  maxAge: '1d', // Cache per 1 giorno
  etag: true, // Abilita ETag per il caching
  lastModified: true, // Abilita Last-Modified per il caching
  setHeaders: (res, path) => {
    // Imposta gli header di sicurezza
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    
    // Imposta il Content-Type corretto per i file WebP
    if (path.endsWith('.webp')) {
      res.setHeader('Content-Type', 'image/webp');
    }
  }
}));

// Middleware per il parsing del body (solo per le richieste non multipart)
app.use((req, res, next) => {
  if (!req.is('multipart/form-data')) {
    express.json({ limit: '100mb' })(req, res, next);
  } else {
    next();
  }
});

app.use((req, res, next) => {
  if (!req.is('multipart/form-data')) {
    express.urlencoded({ extended: true, limit: '100mb' })(req, res, next);
  } else {
    next();
  }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/home', homeRoutes);
app.use('/api/memories', memoriesRoutes);
app.use('/api/images', imagesRoutes);
app.use('/api/ideas', ideasRoutes);
app.use('/api/couples', couplesRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/spotify', spotifyRoutes);
app.use('/api/recap', recapRoutes);
app.use('/api/map', mapRoutes);
app.use('/api/notifications', notificationRoutes);

console.log('=== ROUTES MOUNTED ===');

// Inizializza i cron job
setupNotificationCron();

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('=== ERROR ===');
  console.error(err.stack);
  console.error('=============');
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req: express.Request, res: express.Response) => {
  console.log('=== 404 NOT FOUND ===');
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  console.log('===================');
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Access the API at http://localhost:${PORT}`);
  console.log('Available routes:');
  console.log('- /media/*');
  console.log('- /api/auth/*');
  console.log('- /api/home/*');
  console.log('- /api/users/*');
  console.log('- /api/couples/*');
  console.log('- /api/memories/*');
  console.log('- /api/images/*');
  console.log('- /api/ideas/*');
  console.log('- /api/spotify/*');
  console.log('- /api/recap/*');
  console.log('- /api/map/*');
  console.log('- /api/notifications/*');
  console.log('=================================');
});