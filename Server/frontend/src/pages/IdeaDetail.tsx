
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Paper,
  Button,
  Avatar,
  Chip,
  Grid,
  Divider,
  Card,
  CardContent,
  IconButton,
  useTheme,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CategoryIcon from '@mui/icons-material/Category';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EditIcon from '@mui/icons-material/Edit';
import { alpha } from '@mui/system';
import * as api from '../services/api';
import { Idea } from '../types/api';
import { toast } from 'react-hot-toast';

const IdeaDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const theme = useTheme();
  const navigate = useNavigate();
  const [idea, setIdea] = useState<Idea | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadIdea = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const response = await api.getIdea(parseInt(id));
        setIdea(response);
        setError(null);
      } catch (err) {
        console.error('Error loading idea:', err);
        setError('Impossibile caricare i dettagli dell\'idea');
        toast.error('Impossibile caricare i dettagli dell\'idea');
      } finally {
        setLoading(false);
      }
    };

    loadIdea();
  }, [id]);

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

  const getCategoryIcon = (category: string) => {
    switch(category) {
      case 'viaggio':
        return <CategoryIcon />;
      case 'ristorante':
        return <CategoryIcon />;
      case 'attività':
        return <CategoryIcon />;
      case 'challenge':
        return <CategoryIcon />;
      default:
        return <CategoryIcon />;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress size={60} thickness={4} />
      </Box>
    );
  }

  if (error || !idea) {
    return (
      <Paper 
        elevation={0} 
        sx={{ 
          p: 4, 
          textAlign: 'center',
          borderRadius: 3,
          maxWidth: 500,
          mx: 'auto',
          mt: 4,
          bgcolor: alpha(theme.palette.error.main, 0.05),
          border: '1px solid',
          borderColor: alpha(theme.palette.error.main, 0.2),
        }}
      >
        <Typography color="error" variant="h6" sx={{ mb: 3 }}>
          {error || 'Idea non trovata'}
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/idee')}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 500,
            px: 3,
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          }}
        >
          Torna alle Idee
        </Button>
      </Paper>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      {/* Header con titolo e azioni */}
      <Box 
        sx={{ 
          mb: 4, 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'flex-start', sm: 'center' }, 
          gap: 2,
          justifyContent: 'space-between', 
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton 
            onClick={() => navigate('/idee')}
            sx={{ 
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              '&:hover': {
                bgcolor: alpha(theme.palette.primary.main, 0.2),
              }
            }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Box>
            <Typography variant="h4" component="h1" fontWeight="bold">
              {idea.title}
            </Typography>
            <Typography variant="subtitle2" color="text.secondary">
              Creato da {idea.created_by_name} il {new Date(idea.created_at).toLocaleDateString('it-IT')}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={() => navigate('/idee')}
            sx={{ 
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 500,
            }}
          >
            Modifica
          </Button>
          <Button
            variant="outlined"
            color={idea.checked ? "success" : "primary"}
            startIcon={<CheckCircleIcon />}
            onClick={() => navigate('/idee')}
            sx={{ 
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 500,
            }}
          >
            {idea.checked ? 'Completata' : 'Segna come completata'}
          </Button>
        </Box>
      </Box>

      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 4, 
              borderRadius: 3,
              height: '100%',
              boxShadow: '0 6px 18px rgba(0, 0, 0, 0.06)',
              border: '1px solid',
              borderColor: theme.palette.mode === 'dark' 
                ? 'rgba(255, 255, 255, 0.05)' 
                : 'rgba(0, 0, 0, 0.03)',
            }}
          >
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              Descrizione
            </Typography>
            <Typography paragraph>
              {idea.description || 'Nessuna descrizione disponibile'}
            </Typography>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Dettagli
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 2, 
                    borderRadius: 3,
                    bgcolor: alpha(getCategoryColor(idea.category), 0.05),
                    border: '1px solid',
                    borderColor: alpha(getCategoryColor(idea.category), 0.1),
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: alpha(getCategoryColor(idea.category), 0.1) }}>
                      {getCategoryIcon(idea.category)}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Categoria
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {idea.category.charAt(0).toUpperCase() + idea.category.slice(1)}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 2, 
                    borderRadius: 3,
                    bgcolor: alpha(theme.palette.primary.main, 0.05),
                    border: '1px solid',
                    borderColor: alpha(theme.palette.primary.main, 0.1),
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                      <CalendarMonthIcon color="primary" />
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Data Prevista
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {new Date(idea.due_date).toLocaleDateString('it-IT')}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              </Grid>
              {idea.checked && (
                <Grid item xs={12}>
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      p: 2, 
                      borderRadius: 3,
                      bgcolor: alpha(theme.palette.success.main, 0.05),
                      border: '1px solid',
                      borderColor: alpha(theme.palette.success.main, 0.1),
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: alpha(theme.palette.success.main, 0.1) }}>
                        <CheckCircleIcon color="success" />
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">
                          Completata il
                        </Typography>
                        <Typography variant="body1" fontWeight={500}>
                          {idea.date_checked ? new Date(idea.date_checked).toLocaleDateString('it-IT') : 'N/A'}
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>
                </Grid>
              )}
            </Grid>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 3, 
              borderRadius: 3,
              boxShadow: '0 6px 18px rgba(0, 0, 0, 0.06)',
              border: '1px solid',
              borderColor: theme.palette.mode === 'dark' 
                ? 'rgba(255, 255, 255, 0.05)' 
                : 'rgba(0, 0, 0, 0.03)',
            }}
          >
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
              Autore
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Avatar
                sx={{
                  width: 60,
                  height: 60,
                  bgcolor: theme.palette.primary.main,
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                }}
              >
                {idea.created_by_name?.[0]}
              </Avatar>
              <Box>
                <Typography variant="subtitle1" fontWeight={600}>
                  {idea.created_by_name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Creata il {new Date(idea.created_at).toLocaleDateString('it-IT')}
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
              Stato
            </Typography>
            {idea.checked ? (
              <Chip
                icon={<CheckCircleIcon />}
                label="Completata"
                color="success"
                sx={{ 
                  borderRadius: 2,
                  py: 2.5,
                  px: 1,
                  fontWeight: 500,
                }}
              />
            ) : (
              <Chip
                label="Da completare"
                color="primary"
                variant="outlined"
                sx={{ 
                  borderRadius: 2,
                  py: 2.5,
                  px: 1,
                  fontWeight: 500,
                }}
              />
            )}

            <Divider sx={{ my: 3 }} />

            <Button
              variant="contained"
              fullWidth
              onClick={() => navigate('/idee')}
              sx={{ 
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 500,
                p: 1.5,
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
                '&:hover': {
                  background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                  boxShadow: `0 6px 16px ${alpha(theme.palette.primary.main, 0.4)}`,
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              Torna alle Idee
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default IdeaDetail;
