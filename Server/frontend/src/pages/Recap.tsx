import React from 'react';
import {
  Box,
  Typography,
  CircularProgress,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

const Recap: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
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
          Il Tuo Recap
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Rivivi i momenti più significativi della vostra storia
        </Typography>
      </Box>

      {/* Contenuto del recap da implementare */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="body1">
          Contenuto in arrivo...
        </Typography>
      </Box>
    </Box>
  );
};

export default Recap; 