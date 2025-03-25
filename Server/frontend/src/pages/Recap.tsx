
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Paper,
  Grid,
  Card,
  CardContent,
  Chip,
  Button,
  Divider,
  Avatar,
  useTheme,
  IconButton,
} from '@mui/material';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import FavoriteIcon from '@mui/icons-material/Favorite';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import HolidayVillageIcon from '@mui/icons-material/HolidayVillage';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { alpha } from '@mui/system';
import { useNavigate } from 'react-router-dom';

// Animation variants for staggered animations
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
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

const cardVariants = {
  hidden: { y: 30, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 80,
      damping: 15
    }
  }
};

const Recap: React.FC = () => {
  const { user } = useAuth();
  const theme = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // This is where you'd fetch data for the recap
    // For now, we'll just simulate a loading state
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

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
            Caricamento del tuo recap...
          </Typography>
        </motion.div>
      </Box>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
        <motion.div variants={itemVariants}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, md: 5 },
              mb: 5,
              borderRadius: 6,
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              color: 'white',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: `0 15px 35px ${alpha(theme.palette.primary.main, 0.3)}`,
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
                backgroundImage: 'url("https://source.unsplash.com/random/1200x800/?love,heart")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                zIndex: 0,
              }}
            />
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Typography 
                variant="h3" 
                fontWeight="bold" 
                gutterBottom
                sx={{
                  fontSize: { xs: '2rem', md: '2.5rem' },
                  textShadow: '0 2px 10px rgba(0,0,0,0.2)',
                  letterSpacing: '-0.02em',
                }}
              >
                Il Tuo Recap
              </Typography>
              <Typography 
                variant="h6" 
                sx={{ 
                  mb: 3, 
                  maxWidth: 600, 
                  fontWeight: 300,
                  opacity: 0.9,
                  textShadow: '0 2px 8px rgba(0,0,0,0.2)',
                }}
              >
                Rivivi i momenti più significativi della vostra storia insieme
              </Typography>
              
              <Grid container spacing={3} sx={{ mt: 3 }}>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ 
                    textAlign: 'center',
                    p: 2,
                    bgcolor: 'rgba(255, 255, 255, 0.15)',
                    borderRadius: 4,
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: '0 10px 20px rgba(0,0,0,0.2)',
                      bgcolor: 'rgba(255, 255, 255, 0.2)',
                    }
                  }}>
                    <AutoStoriesIcon sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="h4" fontWeight="bold">
                      0
                    </Typography>
                    <Typography variant="body2">
                      Ricordi condivisi
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ 
                    textAlign: 'center',
                    p: 2,
                    bgcolor: 'rgba(255, 255, 255, 0.15)',
                    borderRadius: 4,
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: '0 10px 20px rgba(0,0,0,0.2)',
                      bgcolor: 'rgba(255, 255, 255, 0.2)',
                    }
                  }}>
                    <LightbulbIcon sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="h4" fontWeight="bold">
                      0
                    </Typography>
                    <Typography variant="body2">
                      Idee proposte
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ 
                    textAlign: 'center',
                    p: 2,
                    bgcolor: 'rgba(255, 255, 255, 0.15)',
                    borderRadius: 4,
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: '0 10px 20px rgba(0,0,0,0.2)',
                      bgcolor: 'rgba(255, 255, 255, 0.2)',
                    }
                  }}>
                    <PhotoLibraryIcon sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="h4" fontWeight="bold">
                      0
                    </Typography>
                    <Typography variant="body2">
                      Foto nella galleria
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ 
                    textAlign: 'center',
                    p: 2,
                    bgcolor: 'rgba(255, 255, 255, 0.15)',
                    borderRadius: 4,
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: '0 10px 20px rgba(0,0,0,0.2)',
                      bgcolor: 'rgba(255, 255, 255, 0.2)',
                    }
                  }}>
                    <HolidayVillageIcon sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="h4" fontWeight="bold">
                      0
                    </Typography>
                    <Typography variant="body2">
                      Viaggi insieme
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Typography 
            variant="h5" 
            fontWeight="bold" 
            sx={{ 
              mb: 3,
              display: 'flex',
              alignItems: 'center',
              '&::before': {
                content: '""',
                display: 'block',
                width: '3px',
                height: '24px',
                background: `linear-gradient(to bottom, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                marginRight: '12px',
                borderRadius: '3px',
              }
            }}
          >
            Prossimi eventi
          </Typography>
        </motion.div>
        
        <motion.div variants={cardVariants}>
          <Paper
            elevation={0}
            sx={{
              p: 4,
              borderRadius: 4,
              textAlign: 'center',
              border: '1px dashed',
              borderColor: alpha(theme.palette.primary.main, 0.3),
              bgcolor: alpha(theme.palette.primary.main, 0.05),
              mb: 5,
              position: 'relative',
              overflow: 'hidden',
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: `0 10px 30px ${alpha(theme.palette.primary.main, 0.1)}`,
                borderColor: alpha(theme.palette.primary.main, 0.5),
              }
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                top: -60,
                right: -60,
                width: 120,
                height: 120,
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.primary.light, 0.1)} 100%)`,
                zIndex: 0,
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                bottom: -40,
                left: -40,
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.1)} 0%, ${alpha(theme.palette.primary.main, 0.1)} 100%)`,
                zIndex: 0,
              }}
            />
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 80, damping: 15 }}
              >
                <CalendarMonthIcon sx={{ 
                  fontSize: 60, 
                  color: alpha(theme.palette.primary.main, 0.6), 
                  mb: 2,
                  filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))',
                }} />
              </motion.div>
              <Typography variant="h6" gutterBottom>
                Nessun evento in arrivo
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Aggiungi idee e attività da fare insieme per vederle qui
              </Typography>
              <Button
                variant="contained"
                onClick={() => navigate('/idee')}
                sx={{ 
                  borderRadius: 3,
                  textTransform: 'none',
                  fontWeight: 500,
                  px: 3,
                  py: 1.2,
                  boxShadow: `0 10px 20px ${alpha(theme.palette.primary.main, 0.3)}`,
                  position: 'relative',
                  overflow: 'hidden',
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                  '&:hover': {
                    transform: 'translateY(-3px)',
                    boxShadow: `0 15px 30px ${alpha(theme.palette.primary.main, 0.4)}`,
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
                endIcon={<ArrowForwardIcon />}
              >
                Proponi un'Idea
              </Button>
            </Box>
          </Paper>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Typography 
            variant="h5" 
            fontWeight="bold" 
            sx={{ 
              mb: 3,
              display: 'flex',
              alignItems: 'center',
              '&::before': {
                content: '""',
                display: 'block',
                width: '3px',
                height: '24px',
                background: `linear-gradient(to bottom, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                marginRight: '12px',
                borderRadius: '3px',
              }
            }}
          >
            La vostra storia
          </Typography>
        </motion.div>
        
        <motion.div variants={cardVariants}>
          <Paper
            elevation={0}
            sx={{
              p: 4,
              borderRadius: 4,
              textAlign: 'center',
              border: '1px dashed',
              borderColor: alpha(theme.palette.primary.main, 0.3),
              bgcolor: alpha(theme.palette.primary.main, 0.05),
              mb: 5,
              position: 'relative',
              overflow: 'hidden',
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: `0 10px 30px ${alpha(theme.palette.primary.main, 0.1)}`,
                borderColor: alpha(theme.palette.primary.main, 0.5),
              }
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                top: -30,
                left: -30,
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.primary.light, 0.1)} 100%)`,
                zIndex: 0,
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                bottom: -50,
                right: -50,
                width: 100,
                height: 100,
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.1)} 0%, ${alpha(theme.palette.primary.main, 0.1)} 100%)`,
                zIndex: 0,
              }}
            />
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 80, damping: 15 }}
              >
                <FavoriteIcon sx={{ 
                  fontSize: 60, 
                  color: alpha(theme.palette.primary.main, 0.6), 
                  mb: 2,
                  filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))',
                }} />
              </motion.div>
              <Typography variant="h6" gutterBottom>
                Recap in arrivo...
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Man mano che aggiungerete ricordi, foto e attività, qui troverete una timeline della vostra storia insieme
              </Typography>
              <Button
                variant="contained"
                onClick={() => navigate('/ricordi')}
                sx={{ 
                  borderRadius: 3,
                  textTransform: 'none',
                  fontWeight: 500,
                  px: 3,
                  py: 1.2,
                  boxShadow: `0 10px 20px ${alpha(theme.palette.primary.main, 0.3)}`,
                  position: 'relative',
                  overflow: 'hidden',
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                  '&:hover': {
                    transform: 'translateY(-3px)',
                    boxShadow: `0 15px 30px ${alpha(theme.palette.primary.main, 0.4)}`,
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
                endIcon={<ArrowForwardIcon />}
              >
                Crea un Ricordo
              </Button>
            </Box>
          </Paper>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Typography 
            variant="h5" 
            fontWeight="bold" 
            sx={{ 
              mb: 3,
              display: 'flex',
              alignItems: 'center',
              '&::before': {
                content: '""',
                display: 'block',
                width: '3px',
                height: '24px',
                background: `linear-gradient(to bottom, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                marginRight: '12px',
                borderRadius: '3px',
              }
            }}
          >
            Luoghi visitati
          </Typography>
        </motion.div>
        
        <motion.div variants={cardVariants}>
          <Paper
            elevation={0}
            sx={{
              p: 4,
              borderRadius: 4,
              textAlign: 'center',
              border: '1px dashed',
              borderColor: alpha(theme.palette.primary.main, 0.3),
              bgcolor: alpha(theme.palette.primary.main, 0.05),
              position: 'relative',
              overflow: 'hidden',
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: `0 10px 30px ${alpha(theme.palette.primary.main, 0.1)}`,
                borderColor: alpha(theme.palette.primary.main, 0.5),
              }
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                top: -40,
                left: -40,
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.primary.light, 0.1)} 100%)`,
                zIndex: 0,
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                bottom: -40,
                right: -40,
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.1)} 0%, ${alpha(theme.palette.primary.main, 0.1)} 100%)`,
                zIndex: 0,
              }}
            />
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 80, damping: 15 }}
              >
                <LocationOnIcon sx={{ 
                  fontSize: 60, 
                  color: alpha(theme.palette.primary.main, 0.6), 
                  mb: 2,
                  filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))',
                }} />
              </motion.div>
              <Typography variant="h6" gutterBottom>
                Nessun luogo visitato insieme
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Quando aggiungerete ricordi con posizioni, qui vedrete una mappa dei vostri luoghi
              </Typography>
              <Button
                variant="contained"
                onClick={() => navigate('/ricordi')}
                sx={{ 
                  borderRadius: 3,
                  textTransform: 'none',
                  fontWeight: 500,
                  px: 3,
                  py: 1.2,
                  boxShadow: `0 10px 20px ${alpha(theme.palette.primary.main, 0.3)}`,
                  position: 'relative',
                  overflow: 'hidden',
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                  '&:hover': {
                    transform: 'translateY(-3px)',
                    boxShadow: `0 15px 30px ${alpha(theme.palette.primary.main, 0.4)}`,
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
                endIcon={<ArrowForwardIcon />}
              >
                Aggiungi Ricordi
              </Button>
            </Box>
          </Paper>
        </motion.div>
      </Box>
    </motion.div>
  );
};

export default Recap;
