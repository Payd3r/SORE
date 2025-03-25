
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
  IconButton,
  useTheme,
  Tooltip,
} from '@mui/material';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CategoryIcon from '@mui/icons-material/Category';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EditIcon from '@mui/icons-material/Edit';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonIcon from '@mui/icons-material/Person';
import { alpha } from '@mui/system';
import * as api from '../services/api';
import { Idea } from '../types/api';
import { toast } from 'react-hot-toast';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.1,
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 12
    }
  }
};

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

  const handleCheckIdea = async () => {
    if (!id || !idea) return;
    
    try {
      const updatedIdea = {
        ...idea,
        checked: !idea.checked,
        date_checked: !idea.checked ? new Date().toISOString() : null
      };
      
      await api.updateIdea(parseInt(id), updatedIdea);
      setIdea(updatedIdea);
      toast.success(idea.checked ? 'Idea segnata come da completare' : 'Idea segnata come completata');
    } catch (err) {
      console.error('Error updating idea:', err);
      toast.error('Impossibile aggiornare lo stato dell\'idea');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh', flexDirection: 'column', gap: 3 }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <CircularProgress size={60} thickness={4} sx={{ color: theme.palette.primary.main }} />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <Typography variant="h6" color="textSecondary">
            Caricamento dettagli idea...
          </Typography>
        </motion.div>
      </Box>
    );
  }

  if (error || !idea) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Paper 
          elevation={0} 
          sx={{ 
            p: 4, 
            textAlign: 'center',
            borderRadius: 4,
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
              borderRadius: 3,
              textTransform: 'none',
              fontWeight: 500,
              px: 3,
              py: 1.2,
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            }}
          >
            Torna alle Idee
          </Button>
        </Paper>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
        {/* Header con titolo e azioni */}
        <motion.div variants={itemVariants}>
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
              <Tooltip title="Torna alle idee">
                <IconButton 
                  onClick={() => navigate('/idee')}
                  sx={{ 
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      bgcolor: alpha(theme.palette.primary.main, 0.2),
                      transform: 'translateY(-3px)',
                      boxShadow: `0 6px 15px ${alpha(theme.palette.primary.main, 0.2)}`,
                    }
                  }}
                >
                  <ArrowBackIcon />
                </IconButton>
              </Tooltip>
              <Box>
                <Typography 
                  variant="h4" 
                  component="h1" 
                  fontWeight="bold"
                  sx={{
                    background: `linear-gradient(135deg, ${theme.palette.text.primary} 0%, ${alpha(theme.palette.text.primary, 0.8)} 100%)`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    textFillColor: 'transparent',
                  }}
                >
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
                onClick={() => navigate(`/idee/edit/${idea.id}`)}
                sx={{ 
                  borderRadius: 3,
                  textTransform: 'none',
                  fontWeight: 500,
                  borderWidth: 1.5,
                  px: 3,
                  py: 1,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-3px)',
                    boxShadow: `0 6px 15px ${alpha(theme.palette.primary.main, 0.15)}`,
                    borderWidth: 1.5,
                  }
                }}
              >
                Modifica
              </Button>
              <Button
                variant="outlined"
                color={idea.checked ? "success" : "primary"}
                startIcon={<CheckCircleIcon />}
                onClick={handleCheckIdea}
                sx={{ 
                  borderRadius: 3,
                  textTransform: 'none',
                  fontWeight: 500,
                  borderWidth: 1.5,
                  px: 3,
                  py: 1,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-3px)',
                    boxShadow: idea.checked 
                      ? `0 6px 15px ${alpha(theme.palette.success.main, 0.15)}`
                      : `0 6px 15px ${alpha(theme.palette.primary.main, 0.15)}`,
                    borderWidth: 1.5,
                  }
                }}
              >
                {idea.checked ? 'Completata' : 'Segna come completata'}
              </Button>
            </Box>
          </Box>
        </motion.div>

        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <motion.div variants={itemVariants}>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 4, 
                  borderRadius: 4,
                  height: '100%',
                  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)',
                  border: '1px solid',
                  borderColor: theme.palette.mode === 'dark' 
                    ? 'rgba(255, 255, 255, 0.05)' 
                    : 'rgba(0, 0, 0, 0.03)',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: '0 15px 35px rgba(0, 0, 0, 0.1)',
                  }
                }}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: '30%',
                    height: '30%',
                    background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.05)} 0%, transparent 70%)`,
                    zIndex: 0,
                  }}
                />
                
                <Box sx={{ position: 'relative', zIndex: 1 }}>
                  <Typography 
                    variant="h5" 
                    fontWeight="bold" 
                    gutterBottom
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      '&::before': {
                        content: '""',
                        display: 'block',
                        width: '3px',
                        height: '20px',
                        background: `linear-gradient(to bottom, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                        marginRight: '10px',
                        borderRadius: '3px',
                      }
                    }}
                  >
                    Descrizione
                  </Typography>
                  <Typography 
                    paragraph
                    sx={{
                      lineHeight: 1.7,
                      mb: 4,
                      fontSize: '1.05rem',
                    }}
                  >
                    {idea.description || 'Nessuna descrizione disponibile'}
                  </Typography>

                  <Divider sx={{ my: 3 }} />

                  <Typography 
                    variant="h6" 
                    fontWeight="bold" 
                    gutterBottom
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      '&::before': {
                        content: '""',
                        display: 'block',
                        width: '3px',
                        height: '18px',
                        background: `linear-gradient(to bottom, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                        marginRight: '10px',
                        borderRadius: '3px',
                      }
                    }}
                  >
                    Dettagli
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <Paper 
                        elevation={0} 
                        sx={{ 
                          p: 3, 
                          borderRadius: 3,
                          bgcolor: alpha(getCategoryColor(idea.category), 0.05),
                          border: '1px solid',
                          borderColor: alpha(getCategoryColor(idea.category), 0.1),
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-5px)',
                            boxShadow: `0 10px 25px ${alpha(getCategoryColor(idea.category), 0.15)}`,
                          }
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar 
                            sx={{ 
                              bgcolor: alpha(getCategoryColor(idea.category), 0.1),
                              color: getCategoryColor(idea.category),
                              fontWeight: 'bold',
                              boxShadow: `0 5px 15px ${alpha(getCategoryColor(idea.category), 0.15)}`,
                            }}
                          >
                            {getCategoryIcon(idea.category)}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" color="text.secondary">
                              Categoria
                            </Typography>
                            <Typography variant="body1" fontWeight={600}>
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
                          p: 3, 
                          borderRadius: 3,
                          bgcolor: alpha(theme.palette.primary.main, 0.05),
                          border: '1px solid',
                          borderColor: alpha(theme.palette.primary.main, 0.1),
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-5px)',
                            boxShadow: `0 10px 25px ${alpha(theme.palette.primary.main, 0.15)}`,
                          }
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar 
                            sx={{ 
                              bgcolor: alpha(theme.palette.primary.main, 0.1),
                              color: theme.palette.primary.main,
                              fontWeight: 'bold',
                              boxShadow: `0 5px 15px ${alpha(theme.palette.primary.main, 0.15)}`,
                            }}
                          >
                            <CalendarMonthIcon />
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" color="text.secondary">
                              Data Prevista
                            </Typography>
                            <Typography variant="body1" fontWeight={600}>
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
                            p: 3, 
                            borderRadius: 3,
                            bgcolor: alpha(theme.palette.success.main, 0.05),
                            border: '1px solid',
                            borderColor: alpha(theme.palette.success.main, 0.1),
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              transform: 'translateY(-5px)',
                              boxShadow: `0 10px 25px ${alpha(theme.palette.success.main, 0.15)}`,
                            }
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar 
                              sx={{ 
                                bgcolor: alpha(theme.palette.success.main, 0.1),
                                color: theme.palette.success.main,
                                fontWeight: 'bold',
                                boxShadow: `0 5px 15px ${alpha(theme.palette.success.main, 0.15)}`,
                              }}
                            >
                              <CheckCircleIcon />
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle2" color="text.secondary">
                                Completata il
                              </Typography>
                              <Typography variant="body1" fontWeight={600}>
                                {idea.date_checked ? new Date(idea.date_checked).toLocaleDateString('it-IT') : 'N/A'}
                              </Typography>
                            </Box>
                          </Box>
                        </Paper>
                      </Grid>
                    )}
                  </Grid>
                </Box>
              </Paper>
            </motion.div>
          </Grid>

          <Grid item xs={12} md={4}>
            <motion.div variants={itemVariants}>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 3, 
                  borderRadius: 4,
                  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)',
                  border: '1px solid',
                  borderColor: theme.palette.mode === 'dark' 
                    ? 'rgba(255, 255, 255, 0.05)' 
                    : 'rgba(0, 0, 0, 0.03)',
                  position: 'relative',
                  overflow: 'hidden',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '50%',
                    height: '50%',
                    background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.05)} 0%, transparent 70%)`,
                    zIndex: 0,
                  }}
                />
                
                <Box sx={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <Typography 
                    variant="h6" 
                    fontWeight="bold" 
                    sx={{ 
                      mb: 3,
                      display: 'flex',
                      alignItems: 'center',
                      '&::before': {
                        content: '""',
                        display: 'block',
                        width: '3px',
                        height: '18px',
                        background: `linear-gradient(to bottom, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                        marginRight: '10px',
                        borderRadius: '3px',
                      }
                    }}
                  >
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
                        boxShadow: `0 5px 15px ${alpha(theme.palette.primary.main, 0.2)}`,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'scale(1.05)',
                          boxShadow: `0 8px 20px ${alpha(theme.palette.primary.main, 0.3)}`,
                        }
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

                  <Typography 
                    variant="h6" 
                    fontWeight="bold" 
                    sx={{ 
                      mb: 2,
                      display: 'flex',
                      alignItems: 'center',
                      '&::before': {
                        content: '""',
                        display: 'block',
                        width: '3px',
                        height: '18px',
                        background: `linear-gradient(to bottom, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                        marginRight: '10px',
                        borderRadius: '3px',
                      }
                    }}
                  >
                    Stato
                  </Typography>
                  {idea.checked ? (
                    <Chip
                      icon={<CheckCircleIcon />}
                      label="Completata"
                      color="success"
                      sx={{ 
                        borderRadius: 3,
                        py: 2.5,
                        px: 1,
                        fontWeight: 600,
                        boxShadow: `0 5px 15px ${alpha(theme.palette.success.main, 0.15)}`,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-3px)',
                          boxShadow: `0 8px 20px ${alpha(theme.palette.success.main, 0.2)}`,
                        }
                      }}
                    />
                  ) : (
                    <Chip
                      icon={<AccessTimeIcon />}
                      label="Da completare"
                      color="primary"
                      variant="outlined"
                      sx={{ 
                        borderRadius: 3,
                        py: 2.5,
                        px: 1,
                        fontWeight: 600,
                        borderWidth: 1.5,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-3px)',
                          boxShadow: `0 8px 20px ${alpha(theme.palette.primary.main, 0.15)}`,
                        }
                      }}
                    />
                  )}

                  <Box sx={{ flexGrow: 1 }} />
                  <Divider sx={{ my: 3 }} />

                  <Button
                    variant="contained"
                    fullWidth
                    onClick={() => navigate('/idee')}
                    sx={{ 
                      borderRadius: 3,
                      textTransform: 'none',
                      fontWeight: 500,
                      p: 1.5,
                      boxShadow: `0 8px 20px ${alpha(theme.palette.primary.main, 0.3)}`,
                      background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                      position: 'relative',
                      overflow: 'hidden',
                      '&:hover': {
                        transform: 'translateY(-3px)',
                        boxShadow: `0 12px 25px ${alpha(theme.palette.primary.main, 0.4)}`,
                      },
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: '-100%',
                        width: '100%',
                        height: '100%',
                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                        transition: 'all 0.5s ease',
                      },
                      '&:hover::after': {
                        left: '100%',
                      }
                    }}
                  >
                    Torna alle Idee
                  </Button>
                </Box>
              </Paper>
            </motion.div>
          </Grid>
        </Grid>
      </Box>
    </motion.div>
  );
};

export default IdeaDetail;
