
import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  IconButton,
  Typography,
  useTheme,
  Chip,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { Idea } from '../types/api';
import * as api from '../services/api';
import { alpha } from '@mui/system';

interface CreateIdeaDialogProps {
  open: boolean;
  onClose: () => void;
  coupleId: number;
  onIdeaCreated: (idea: Idea) => void;
}

interface NewIdea {
  title: string;
  description: string;
  category: string;
  due_date: string;
}

export default function CreateIdeaDialog({ open, onClose, coupleId, onIdeaCreated }: CreateIdeaDialogProps) {
  const theme = useTheme();
  const [newIdea, setNewIdea] = useState<NewIdea>({
    title: '',
    description: '',
    category: 'viaggio',
    due_date: new Date().toISOString().split('T')[0],
  });

  const handleCreate = async () => {
    try {
      const createdIdea = await api.createIdea(coupleId, {
        title: newIdea.title,
        description: newIdea.description,
        category: newIdea.category,
        due_date: newIdea.due_date,
      });
      onIdeaCreated(createdIdea);
      onClose();
      // Reset form
      setNewIdea({
        title: '',
        description: '',
        category: 'viaggio',
        due_date: new Date().toISOString().split('T')[0],
      });
    } catch (error) {
      console.error('Error creating idea:', error);
    }
  };

  const categoryOptions = [
    { value: 'viaggio', label: 'Viaggio', color: theme.palette.primary.main },
    { value: 'ristorante', label: 'Ristorante', color: theme.palette.error.main },
    { value: 'attività', label: 'Attività', color: theme.palette.success.main },
    { value: 'challenge', label: 'Challenge', color: theme.palette.secondary.main },
  ];

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
          overflow: 'visible',
        }
      }}
    >
      <DialogTitle sx={{ 
        pr: 6, 
        pb: 1, 
        borderBottom: '1px solid',
        borderColor: alpha(theme.palette.divider, 0.5),
      }}>
        <Typography variant="h5" component="div" fontWeight={600}>
          Crea nuova idea
        </Typography>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 16,
            top: 12,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ pt: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <TextField
            label="Titolo"
            value={newIdea.title}
            onChange={(e) => setNewIdea({ ...newIdea, title: e.target.value })}
            fullWidth
            required
            variant="outlined"
            InputProps={{
              sx: {
                borderRadius: 2,
              }
            }}
          />
          <TextField
            label="Descrizione"
            value={newIdea.description}
            onChange={(e) => setNewIdea({ ...newIdea, description: e.target.value })}
            multiline
            rows={4}
            fullWidth
            variant="outlined"
            InputProps={{
              sx: {
                borderRadius: 2,
              }
            }}
          />
          
          <Typography variant="subtitle2" sx={{ mt: 1 }}>
            Categoria
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {categoryOptions.map((option) => (
              <Chip
                key={option.value}
                label={option.label}
                onClick={() => setNewIdea({ ...newIdea, category: option.value })}
                sx={{
                  borderRadius: 3,
                  py: 2,
                  backgroundColor: newIdea.category === option.value
                    ? option.color
                    : theme.palette.background.paper,
                  color: newIdea.category === option.value
                    ? '#fff'
                    : 'text.primary',
                  border: '1px solid',
                  borderColor: option.color ? alpha(option.color, 0.3) : 'transparent',
                  boxShadow: newIdea.category === option.value 
                    ? `0 4px 12px ${alpha(option.color, 0.3)}`
                    : '0 2px 8px rgba(0, 0, 0, 0.05)',
                  '&:hover': {
                    backgroundColor: newIdea.category === option.value
                      ? option.color
                      : alpha(option.color, 0.1),
                  },
                  transition: 'all 0.3s ease',
                }}
              />
            ))}
          </Box>
          
          <TextField
            label="Data"
            type="date"
            value={newIdea.due_date}
            onChange={(e) => setNewIdea({ ...newIdea, due_date: e.target.value })}
            InputLabelProps={{ shrink: true }}
            fullWidth
            required
            variant="outlined"
            InputProps={{
              sx: {
                borderRadius: 2,
              }
            }}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <Button 
          onClick={onClose}
          variant="outlined"
          sx={{ 
            borderRadius: 2,
            px: 3,
            textTransform: 'none', 
            fontWeight: 500,
          }}
        >
          Annulla
        </Button>
        <Button 
          onClick={handleCreate} 
          variant="contained" 
          color="primary"
          disabled={!newIdea.title || !newIdea.category || !newIdea.due_date}
          sx={{ 
            borderRadius: 2, 
            px: 3,
            textTransform: 'none', 
            fontWeight: 500,
            boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            '&:hover': {
              boxShadow: `0 6px 16px ${alpha(theme.palette.primary.main, 0.4)}`,
              background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
            },
          }}
        >
          Crea
        </Button>
      </DialogActions>
    </Dialog>
  );
}
