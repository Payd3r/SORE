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
} from '@mui/material';
import { Idea } from '../types/api';
import * as api from '../services/api';

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

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Crea nuova idea</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
          <TextField
            label="Titolo"
            value={newIdea.title}
            onChange={(e) => setNewIdea({ ...newIdea, title: e.target.value })}
            fullWidth
            required
          />
          <TextField
            label="Descrizione"
            value={newIdea.description}
            onChange={(e) => setNewIdea({ ...newIdea, description: e.target.value })}
            multiline
            rows={3}
            fullWidth
          />
          <FormControl fullWidth required>
            <InputLabel>Categoria</InputLabel>
            <Select
              value={newIdea.category}
              onChange={(e) => setNewIdea({ ...newIdea, category: e.target.value })}
              label="Categoria"
            >
              <MenuItem value="viaggio">Viaggio</MenuItem>
              <MenuItem value="ristorante">Ristorante</MenuItem>
              <MenuItem value="attività">Attività</MenuItem>
              <MenuItem value="challenge">Challenge</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="Data"
            type="date"
            value={newIdea.due_date}
            onChange={(e) => setNewIdea({ ...newIdea, due_date: e.target.value })}
            InputLabelProps={{ shrink: true }}
            fullWidth
            required
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Annulla</Button>
        <Button 
          onClick={handleCreate} 
          variant="contained" 
          color="primary"
          disabled={!newIdea.title || !newIdea.category || !newIdea.due_date}
        >
          Crea
        </Button>
      </DialogActions>
    </Dialog>
  );
} 