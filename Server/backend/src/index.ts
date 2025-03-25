import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';

// Import routes
import authRoutes from './routes/auth';
import memoriesRoutes from './routes/memories';
import imagesRoutes from './routes/images';
import ideasRoutes from './routes/ideas';
import locationsRoutes from './routes/locations';
import usersRoutes from './routes/users';
import couplesRoutes from './routes/couples';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from media directory
app.use('/media', express.static(path.join(__dirname, '../media')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', memoriesRoutes);
app.use('/api', imagesRoutes);
app.use('/api', ideasRoutes);
app.use('/api/locations', locationsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/couples', couplesRoutes);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});