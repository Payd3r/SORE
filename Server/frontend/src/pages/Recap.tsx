
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
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import FavoriteIcon from '@mui/icons-material/Favorite';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import HolidayVillageIcon from '@mui/icons-material/HolidayVillage';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import { alpha } from '@mui/system';
import { useNavigate } from 'react-router-dom';

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
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress size={60} thickness={4} />
      </Box>
    );
  }

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
            backgroundImage: 'url("https://source.unsplash.com/random/1200x800/?love,heart")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            zIndex: 0,
          }}
        />
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Typography variant="h3" fontWeight="bold" gutterBottom>
            Il Tuo Recap
          </Typography>
          <Typography variant="h6" sx={{ mb: 3, maxWidth: 600, fontWeight: 300 }}>
            Rivivi i momenti più significativi della vostra storia insieme
          </Typography>
          
          <Grid container spacing={3} sx={{ mt: 3 }}>
            <Grid item xs={6} sm={3}>
              <Box sx={{ 
                textAlign: 'center',
                p: 2,
                bgcolor: 'rgba(255, 255, 255, 0.15)',
                borderRadius: 3,
                backdropFilter: 'blur(10px)',
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
                borderRadius: 3,
                backdropFilter: 'blur(10px)',
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
                borderRadius: 3,
                backdropFilter: 'blur(10px)',
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
                borderRadius: 3,
                backdropFilter: 'blur(10px)',
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

      <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
        Prossimi eventi
      </Typography>
      
      <Paper
        elevation={0}
        sx={{
          p: 4,
          borderRadius: 3,
          textAlign: 'center',
          border: '1px dashed',
          borderColor: alpha(theme.palette.primary.main, 0.3),
          bgcolor: alpha(theme.palette.primary.main, 0.05),
          mb: 5,
        }}
      >
        <CalendarMonthIcon sx={{ fontSize: 48, color: alpha(theme.palette.primary.main, 0.6), mb: 2 }} />
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

      <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
        La vostra storia
      </Typography>
      
      <Paper
        elevation={0}
        sx={{
          p: 4,
          borderRadius: 3,
          textAlign: 'center',
          border: '1px dashed',
          borderColor: alpha(theme.palette.primary.main, 0.3),
          bgcolor: alpha(theme.palette.primary.main, 0.05),
          mb: 5,
        }}
      >
        <FavoriteIcon sx={{ fontSize: 48, color: alpha(theme.palette.primary.main, 0.6), mb: 2 }} />
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

      <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
        Luoghi visitati
      </Typography>
      
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
        <LocationOnIcon sx={{ fontSize: 48, color: alpha(theme.palette.primary.main, 0.6), mb: 2 }} />
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
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 500,
            px: 3,
            py: 1,
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          }}
        >
          Aggiungi Ricordi
        </Button>
      </Paper>
    </Box>
  );
};

export default Recap;
