import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  IconButton,
  CircularProgress,
} from '@mui/material';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { useAuth } from '../contexts/AuthContext';
import * as api from '../services/api';
import { Memory, Image, Idea } from '../types/api';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [recentMemories, setRecentMemories] = useState<Memory[]>([]);
  const [recentImages, setRecentImages] = useState<Image[]>([]);
  const [recentIdeas, setRecentIdeas] = useState<Idea[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user?.coupleId) return;

      try {
        setIsLoading(true);
        const memoriesRes = await api.getMemories(user.coupleId);
        const imagesRes = await api.getImages(user.coupleId);
        const ideasRes = await api.getIdeas(user.coupleId);

        setRecentMemories(memoriesRes.slice(0, 3));
        setRecentImages(imagesRes.slice(0, 6));
        setRecentIdeas(ideasRes.slice(0, 3));
        setError(null);
      } catch (err) {
        setError('Failed to load dashboard data. Please try again.');
        console.error('Error loading dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, [user?.coupleId]);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ mb: 1 }}>
          Benvenuti a Casa
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Il vostro spazio per condividere ricordi e creare nuove avventure
        </Typography>
        {error && (
          <Typography color="error" sx={{ mt: 2 }}>
            {error}
          </Typography>
        )}
      </Box>

      <Box sx={{ mb: 6 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2,
          }}
        >
          <Typography variant="h6">Azioni Rapide</Typography>
        </Box>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <Card
              onClick={() => navigate('/galleria')}
              sx={{
                cursor: 'pointer',
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                borderRadius: 3,
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'scale(1.02)',
                },
              }}
            >
              <CardContent
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                }}
              >
                <PhotoLibraryIcon fontSize="large" />
                <Box>
                  <Typography variant="h6">Galleria</Typography>
                  <Typography variant="body2">
                    Aggiungi nuove foto
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Card
              onClick={() => navigate('/idee')}
              sx={{
                cursor: 'pointer',
                bgcolor: '#7c4dff',
                color: '#fff',
                borderRadius: 3,
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'scale(1.02)',
                },
              }}
            >
              <CardContent
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                }}
              >
                <LightbulbIcon fontSize="large" />
                <Box>
                  <Typography variant="h6">Idee</Typography>
                  <Typography variant="body2">
                    Proponi nuove attività
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Card
              onClick={() => navigate('/ricordi')}
              sx={{
                cursor: 'pointer',
                bgcolor: '#e040fb',
                color: '#fff',
                borderRadius: 3,
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'scale(1.02)',
                },
              }}
            >
              <CardContent
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                }}
              >
                <FavoriteIcon fontSize="large" />
                <Box>
                  <Typography variant="h6">Ricordi</Typography>
                  <Typography variant="body2">
                    Crea nuovi ricordi
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      <Box sx={{ mb: 6 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2,
          }}
        >
          <Typography variant="h6">Foto Recenti</Typography>
          <Typography
            variant="body2"
            color="primary"
            sx={{ cursor: 'pointer' }}
            onClick={() => navigate('/galleria')}
          >
            Vedi tutte
          </Typography>
        </Box>
        <Grid container spacing={2}>
          {recentImages.map((image) => (
            <Grid item xs={6} sm={4} md={2} key={image.id}>
              <Box
                onClick={() => navigate(`/galleria/${image.id}`)}
                sx={{
                  position: 'relative',
                  paddingTop: '100%',
                  borderRadius: 3,
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'scale(1.05)',
                  },
                }}
              >
                <img
                  src={image.thumb_big_path}
                  alt={image.description || 'Immagine'}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    borderRadius: 8,
                  }}
                />
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>

      <Box sx={{ mb: 6 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2,
          }}
        >
          <Typography variant="h6">Ricordi Recenti</Typography>
          <Typography
            variant="body2"
            color="primary"
            sx={{ cursor: 'pointer' }}
            onClick={() => navigate('/ricordi')}
          >
            Vedi tutti
          </Typography>
        </Box>
        <Grid container spacing={2}>
          {recentMemories.map((memory) => (
            <Grid item xs={12} sm={4} key={memory.id}>
              <Card
                onClick={() => navigate(`/ricordi/${memory.id}`)}
                sx={{
                  cursor: 'pointer',
                  borderRadius: 3,
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'scale(1.02)',
                  },
                }}
              >
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    {memory.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {memory.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      <Box>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2,
          }}
        >
          <Typography variant="h6">Idee Recenti</Typography>
          <Typography
            variant="body2"
            color="primary"
            sx={{ cursor: 'pointer' }}
            onClick={() => navigate('/idee')}
          >
            Vedi tutte
          </Typography>
        </Box>
        <Grid container spacing={2}>
          {recentIdeas.map((idea) => (
            <Grid item xs={12} sm={4} key={idea.id}>
              <Card
                sx={{
                  borderRadius: 3,
                  height: '100%',
                }}
              >
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    {idea.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {idea.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
};

export default Home;
