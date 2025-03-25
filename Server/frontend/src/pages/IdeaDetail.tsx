import React from 'react';
import {
  Box,
  Typography,
  CircularProgress,
} from '@mui/material';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const IdeaDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
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
          Dettaglio Idea
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          ID: {id}
        </Typography>
      </Box>

      {/* Contenuto del dettaglio idea da implementare */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="body1">
          Contenuto in arrivo...
        </Typography>
      </Box>
    </Box>
  );
};

export default IdeaDetail; 