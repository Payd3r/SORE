
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  CircularProgress,
  Paper,
  Avatar,
  Chip,
  IconButton,
  Divider,
  useTheme,
} from '@mui/material';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import { useAuth } from '../contexts/AuthContext';
import * as api from '../services/api';
import { Memory, Image, Idea } from '../types/api';
import { alpha } from '@mui/system';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const theme = useTheme();
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
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress size={60} thickness={4} />
      </Box>
    );
  }

  const getCategoryColor = (category: string) => {
    switch(category) {
      case 'viaggio':
        return theme.palette.primary.main;
      case 'ristorante':
        return theme.palette.error.main;
      case 'attività':
        return theme.palette.success.main;
      case 'challenge':
        return theme.palette.secondary.main;
      default:
        return theme.palette.info.main;
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 5 },
          mb: 5,
          borderRadius: 3,
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.3)}`,
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.1,
            backgroundImage: 'url("https://source.unsplash.com/random/1200x800/?love,couple")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            zIndex: 0,
          }}
        />
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Typography variant="h3" fontWeight="bold" gutterBottom>
            Benvenuti a Casa
          </Typography>
          <Typography variant="h6" sx={{ mb: 3, maxWidth: 600, fontWeight: 300 }}>
            Il vostro spazio per condividere ricordi e creare nuove avventure insieme.
          </Typography>
          {error && (
            <Paper 
              elevation={0} 
              sx={{ 
                p: 2, 
                mt: 2, 
                bgcolor: alpha('#fff', 0.2),
                color: 'error.main',
                borderRadius: 2,
                backdropFilter: 'blur(10px)',
              }}
            >
              <Typography fontWeight="medium">
                {error}
              </Typography>
            </Paper>
          )}
        </Box>
      </Paper>

      <Box sx={{ mb: 6 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 3,
          }}
        >
          <Typography variant="h5" fontWeight="bold">
            Azioni Rapide
          </Typography>
        </Box>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={4}>
            <Card
              onClick={() => navigate('/galleria')}
              sx={{
                cursor: 'pointer',
                borderRadius: 3,
                border: 'none',
                overflow: 'hidden',
                position: 'relative',
                height: 140,
                boxShadow: '0 6px 16px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 12px 24px rgba(0, 0, 0, 0.15)',
                },
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                  zIndex: 0,
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  background: 'url(https://source.unsplash.com/random/600x400/?gallery,photos)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  opacity: 0.2,
                  zIndex: 1,
                }}
              />
              <CardContent
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  height: '100%',
                  position: 'relative',
                  zIndex: 2,
                  p: 3,
                }}
              >
                <PhotoLibraryIcon sx={{ fontSize: 40, color: 'white', mb: 1 }} />
                <Typography variant="h6" component="div" sx={{ color: 'white', fontWeight: 'bold' }}>
                  Galleria
                </Typography>
                <Typography variant="body2" sx={{ color: 'white', opacity: 0.9 }}>
                  Aggiungi nuove foto
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Card
              onClick={() => navigate('/idee')}
              sx={{
                cursor: 'pointer',
                borderRadius: 3,
                border: 'none',
                overflow: 'hidden',
                position: 'relative',
                height: 140,
                boxShadow: '0 6px 16px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 12px 24px rgba(0, 0, 0, 0.15)',
                },
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.dark} 100%)`,
                  zIndex: 0,
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  background: 'url(https://source.unsplash.com/random/600x400/?idea,planning)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  opacity: 0.2,
                  zIndex: 1,
                }}
              />
              <CardContent
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  height: '100%',
                  position: 'relative',
                  zIndex: 2,
                  p: 3,
                }}
              >
                <LightbulbIcon sx={{ fontSize: 40, color: 'white', mb: 1 }} />
                <Typography variant="h6" component="div" sx={{ color: 'white', fontWeight: 'bold' }}>
                  Idee
                </Typography>
                <Typography variant="body2" sx={{ color: 'white', opacity: 0.9 }}>
                  Proponi nuove attività
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Card
              onClick={() => navigate('/ricordi')}
              sx={{
                cursor: 'pointer',
                borderRadius: 3,
                border: 'none',
                overflow: 'hidden',
                position: 'relative',
                height: 140,
                boxShadow: '0 6px 16px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 12px 24px rgba(0, 0, 0, 0.15)',
                },
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`,
                  zIndex: 0,
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  background: 'url(https://source.unsplash.com/random/600x400/?memory,love)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  opacity: 0.2,
                  zIndex: 1,
                }}
              />
              <CardContent
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  height: '100%',
                  position: 'relative',
                  zIndex: 2,
                  p: 3,
                }}
              >
                <AutoStoriesIcon sx={{ fontSize: 40, color: 'white', mb: 1 }} />
                <Typography variant="h6" component="div" sx={{ color: 'white', fontWeight: 'bold' }}>
                  Ricordi
                </Typography>
                <Typography variant="body2" sx={{ color: 'white', opacity: 0.9 }}>
                  Crea nuovi ricordi
                </Typography>
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
            mb: 3,
          }}
        >
          <Typography variant="h5" fontWeight="bold">
            Foto Recenti
          </Typography>
          <Button
            variant="text"
            endIcon={<ArrowForwardIcon />}
            onClick={() => navigate('/galleria')}
            sx={{ 
              textTransform: 'none',
              fontWeight: 600,
              color: theme.palette.primary.main,
            }}
          >
            Vedi tutte
          </Button>
        </Box>
        
        {recentImages.length > 0 ? (
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
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    '&:hover': {
                      transform: 'scale(1.05)',
                      boxShadow: '0 8px 20px rgba(0, 0, 0, 0.15)',
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
                    }}
                  />
                </Box>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Paper
            elevation={0}
            sx={{
              p: 4,
              borderRadius: 3,
              textAlign: 'center',
              border: '1px dashed',
              borderColor: alpha(theme.palette.primary.main, 0.3),
              bgcolor: alpha(theme.palette.primary.main, 0.05),
            }}
          >
            <PhotoLibraryIcon sx={{ fontSize: 48, color: alpha(theme.palette.primary.main, 0.6), mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Nessuna foto ancora
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Aggiungi le tue prime foto per iniziare a costruire la vostra galleria
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate('/galleria')}
              sx={{ 
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 500,
                px: 3,
                py: 1,
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              }}
            >
              Vai alla Galleria
            </Button>
          </Paper>
        )}
      </Box>

      <Box sx={{ mb: 6 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 3,
          }}
        >
          <Typography variant="h5" fontWeight="bold">
            Ricordi Recenti
          </Typography>
          <Button
            variant="text"
            endIcon={<ArrowForwardIcon />}
            onClick={() => navigate('/ricordi')}
            sx={{ 
              textTransform: 'none',
              fontWeight: 600,
              color: theme.palette.primary.main,
            }}
          >
            Vedi tutti
          </Button>
        </Box>
        
        {recentMemories.length > 0 ? (
          <Grid container spacing={3}>
            {recentMemories.map((memory) => (
              <Grid item xs={12} sm={4} key={memory.id}>
                <Card
                  onClick={() => navigate(`/ricordi/${memory.id}`)}
                  sx={{
                    cursor: 'pointer',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 3,
                    overflow: 'hidden',
                    border: '1px solid',
                    borderColor: alpha(theme.palette.divider, 0.8),
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                      borderColor: alpha(theme.palette.primary.main, 0.3),
                    },
                  }}
                  elevation={0}
                >
                  {memory.images && memory.images.length > 0 && (
                    <Box sx={{ position: 'relative', paddingTop: '50%' }}>
                      <img
                        src={memory.images[0].thumb_big_path}
                        alt={memory.title}
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />
                    </Box>
                  )}
                  <CardContent sx={{ flex: 1, p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
                        {memory.title}
                      </Typography>
                      <Chip
                        label={memory.type === 'viaggio' ? 'Viaggio' : memory.type === 'evento' ? 'Evento' : 'Ricordo'}
                        size="small"
                        sx={{
                          borderRadius: 8,
                          bgcolor: memory.type === 'viaggio' 
                            ? alpha(theme.palette.secondary.main, 0.1)
                            : memory.type === 'evento'
                              ? alpha(theme.palette.success.main, 0.1)
                              : alpha(theme.palette.info.main, 0.1),
                          color: memory.type === 'viaggio' 
                            ? theme.palette.secondary.main
                            : memory.type === 'evento'
                              ? theme.palette.success.main
                              : theme.palette.info.main,
                          border: '1px solid',
                          borderColor: memory.type === 'viaggio' 
                            ? alpha(theme.palette.secondary.main, 0.3)
                            : memory.type === 'evento'
                              ? alpha(theme.palette.success.main, 0.3)
                              : alpha(theme.palette.info.main, 0.3),
                          fontWeight: 500,
                        }}
                      />
                    </Box>
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      sx={{ 
                        mb: 2,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {memory.description}
                    </Typography>
                    
                    <Box sx={{ mt: 'auto' }}>
                      {(memory.location || memory.song) && (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                          {memory.location && (
                            <Chip
                              icon={<LocationOnIcon sx={{ fontSize: '1rem' }} />}
                              label={memory.location}
                              size="small"
                              sx={{ 
                                borderRadius: 8,
                                bgcolor: alpha(theme.palette.primary.main, 0.05),
                                border: '1px solid',
                                borderColor: alpha(theme.palette.primary.main, 0.1),
                                fontSize: '0.75rem',
                              }}
                            />
                          )}
                        </Box>
                      )}
                      
                      <Divider sx={{ my: 1.5 }} />
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Chip
                          icon={<CalendarMonthIcon sx={{ fontSize: '0.875rem' }} />}
                          label={new Date(memory.date).toLocaleDateString('it-IT')}
                          size="small"
                          variant="outlined"
                          sx={{ 
                            borderRadius: 8,
                            fontSize: '0.7rem',
                          }}
                        />
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Paper
            elevation={0}
            sx={{
              p: 4,
              borderRadius: 3,
              textAlign: 'center',
              border: '1px dashed',
              borderColor: alpha(theme.palette.primary.main, 0.3),
              bgcolor: alpha(theme.palette.primary.main, 0.05),
            }}
          >
            <AutoStoriesIcon sx={{ fontSize: 48, color: alpha(theme.palette.primary.main, 0.6), mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Nessun ricordo ancora
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Inizia a creare ricordi per conservare i vostri momenti speciali
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate('/ricordi')}
              sx={{ 
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 500,
                px: 3,
                py: 1,
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              }}
            >
              Crea un Ricordo
            </Button>
          </Paper>
        )}
      </Box>

      <Box sx={{ mb: 6 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 3,
          }}
        >
          <Typography variant="h5" fontWeight="bold">
            Idee Recenti
          </Typography>
          <Button
            variant="text"
            endIcon={<ArrowForwardIcon />}
            onClick={() => navigate('/idee')}
            sx={{ 
              textTransform: 'none',
              fontWeight: 600,
              color: theme.palette.primary.main,
            }}
          >
            Vedi tutte
          </Button>
        </Box>
        
        {recentIdeas.length > 0 ? (
          <Grid container spacing={3}>
            {recentIdeas.map((idea) => (
              <Grid item xs={12} sm={4} key={idea.id}>
                <Card
                  elevation={0}
                  sx={{
                    height: '100%',
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: alpha(theme.palette.divider, 0.8),
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                      borderColor: alpha(getCategoryColor(idea.category), 0.3),
                    },
                  }}
                  onClick={() => navigate('/idee')}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
                        {idea.title}
                      </Typography>
                      <Chip
                        label={idea.category}
                        size="small"
                        sx={{
                          borderRadius: 8,
                          bgcolor: alpha(getCategoryColor(idea.category), 0.1),
                          color: getCategoryColor(idea.category),
                          border: '1px solid',
                          borderColor: alpha(getCategoryColor(idea.category), 0.3),
                          fontWeight: 500,
                        }}
                      />
                    </Box>
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      sx={{ 
                        mb: 2,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {idea.description}
                    </Typography>
                    
                    <Divider sx={{ my: 1.5 }} />
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar
                          sx={{ width: 24, height: 24, bgcolor: theme.palette.primary.main, fontSize: '0.75rem' }}
                        >
                          {idea.created_by_name?.[0]}
                        </Avatar>
                        <Typography variant="caption" color="text.secondary">
                          {idea.created_by_name}
                        </Typography>
                      </Box>
                      <Chip
                        icon={<CalendarMonthIcon sx={{ fontSize: '0.875rem' }} />}
                        label={new Date(idea.due_date).toLocaleDateString('it-IT')}
                        size="small"
                        variant="outlined"
                        sx={{ 
                          borderRadius: 8,
                          fontSize: '0.7rem',
                        }}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Paper
            elevation={0}
            sx={{
              p: 4,
              borderRadius: 3,
              textAlign: 'center',
              border: '1px dashed',
              borderColor: alpha(theme.palette.primary.main, 0.3),
              bgcolor: alpha(theme.palette.primary.main, 0.05),
            }}
          >
            <LightbulbIcon sx={{ fontSize: 48, color: alpha(theme.palette.primary.main, 0.6), mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Nessuna idea ancora
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Proponi nuove idee per le attività da fare insieme
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate('/idee')}
              sx={{ 
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 500,
                px: 3,
                py: 1,
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              }}
            >
              Proponi un'Idea
            </Button>
          </Paper>
        )}
      </Box>
    </Box>
  );
};

export default Home;
