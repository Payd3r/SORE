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
  Typography,
  IconButton,
} from '@mui/material';
import { Memory } from '../types/api';
import * as api from '../services/api';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAuth } from '../contexts/AuthContext';

interface CreateMemoryDialogProps {
  open: boolean;
  onClose: () => void;
  onMemoryCreated: (memory: Memory) => void;
}

interface NewMemory {
  title: string;
  description: string;
  type: 'viaggio' | 'evento' | 'semplice';
  date: string;
  category: string;
  start_date?: string;
  end_date?: string;
  location?: string;
  song?: string;
  images?: string[];
}

export default function CreateMemoryDialog({ open, onClose, onMemoryCreated }: CreateMemoryDialogProps) {
  const { user } = useAuth();
  const [newMemory, setNewMemory] = useState<NewMemory>({
    title: '',
    description: '',
    type: 'semplice',
    date: new Date().toISOString().split('T')[0],
    category: 'altro',
  });

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newFiles = Array.from(files);
      setSelectedFiles(prev => [...prev, ...newFiles]);
      
      // Create preview URLs
      newFiles.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewUrls(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleRemoveImage = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleCreate = async () => {
    if (!user?.coupleId) {
      setError('Non sei associato a nessuna coppia');
      return;
    }

    try {
      setError(null);
      // Prima carica le immagini
      const imageUrls = await Promise.all(
        selectedFiles.map(async (file) => {
          const formData = new FormData();
          formData.append('image', file);
          const response = await api.uploadImage(user.coupleId, file);
          return response.jpg_path;
        })
      );

      // Crea il ricordo con le URL delle immagini
      const createdMemory = await api.createMemory(user.coupleId, {
        title: newMemory.title,
        description: newMemory.description,
        type: newMemory.type,
        date: newMemory.date,
        category: newMemory.category,
        start_date: newMemory.start_date,
        end_date: newMemory.end_date,
        location: newMemory.location,
        song: newMemory.song,
        images: imageUrls,
      });

      onMemoryCreated(createdMemory);
      onClose();
      
      // Reset form
      setNewMemory({
        title: '',
        description: '',
        type: 'semplice',
        date: new Date().toISOString().split('T')[0],
        category: 'altro',
      });
      setSelectedFiles([]);
      setPreviewUrls([]);
      setError(null);
    } catch (error) {
      console.error('Error creating memory:', error);
      setError(error instanceof Error ? error.message : 'Errore nella creazione del ricordo');
    }
  };

  const handleTypeChange = (value: string) => {
    if (value === 'viaggio' || value === 'evento' || value === 'semplice') {
      setNewMemory({ ...newMemory, type: value });
    }
  };

  const renderFields = () => {
    switch (newMemory.type) {
      case 'viaggio':
        return (
          <>
            <TextField
              label="Data inizio"
              type="date"
              value={newMemory.start_date || ''}
              onChange={(e) => setNewMemory({ ...newMemory, start_date: e.target.value })}
              InputLabelProps={{ shrink: true }}
              fullWidth
              required
            />
            <TextField
              label="Data fine"
              type="date"
              value={newMemory.end_date || ''}
              onChange={(e) => setNewMemory({ ...newMemory, end_date: e.target.value })}
              InputLabelProps={{ shrink: true }}
              fullWidth
              required
            />
            <TextField
              label="Posizione"
              value={newMemory.location || ''}
              onChange={(e) => setNewMemory({ ...newMemory, location: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Canzone"
              value={newMemory.song || ''}
              onChange={(e) => setNewMemory({ ...newMemory, song: e.target.value })}
              fullWidth
            />
          </>
        );
      case 'evento':
        return (
          <>
            <TextField
              label="Data"
              type="date"
              value={newMemory.date || ''}
              onChange={(e) => setNewMemory({ ...newMemory, date: e.target.value })}
              InputLabelProps={{ shrink: true }}
              fullWidth
              required
            />
            <TextField
              label="Posizione"
              value={newMemory.location || ''}
              onChange={(e) => setNewMemory({ ...newMemory, location: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Canzone"
              value={newMemory.song || ''}
              onChange={(e) => setNewMemory({ ...newMemory, song: e.target.value })}
              fullWidth
            />
          </>
        );
      case 'semplice':
        return (
          <TextField
            label="Data"
            type="date"
            value={newMemory.date || ''}
            onChange={(e) => setNewMemory({ ...newMemory, date: e.target.value })}
            InputLabelProps={{ shrink: true }}
            fullWidth
            required
          />
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Crea nuovo ricordo</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
          {error && (
            <Typography color="error" variant="body2">
              {error}
            </Typography>
          )}
          
          <TextField
            label="Titolo"
            value={newMemory.title}
            onChange={(e) => setNewMemory({ ...newMemory, title: e.target.value })}
            fullWidth
            required
          />
          
          <FormControl fullWidth required>
            <InputLabel>Tipo di ricordo</InputLabel>
            <Select
              value={newMemory.type}
              onChange={(e) => handleTypeChange(e.target.value)}
              label="Tipo di ricordo"
            >
              <MenuItem value="viaggio">Viaggio</MenuItem>
              <MenuItem value="evento">Evento</MenuItem>
              <MenuItem value="semplice">Semplice</MenuItem>
            </Select>
          </FormControl>

          {renderFields()}

          <TextField
            label="Descrizione"
            value={newMemory.description}
            onChange={(e) => setNewMemory({ ...newMemory, description: e.target.value })}
            multiline
            rows={3}
            fullWidth
          />

          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Immagini
            </Typography>
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="image-upload"
              multiple
              type="file"
              onChange={handleFileSelect}
            />
            <label htmlFor="image-upload">
              <Button
                variant="outlined"
                component="span"
                startIcon={<CloudUploadIcon />}
                sx={{ mb: 2 }}
              >
                Carica immagini
              </Button>
            </label>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {previewUrls.map((url, index) => (
                <Box
                  key={index}
                  sx={{
                    position: 'relative',
                    width: 100,
                    height: 100,
                  }}
                >
                  <img
                    src={url}
                    alt={`Preview ${index + 1}`}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      borderRadius: '4px',
                    }}
                  />
                  <IconButton
                    size="small"
                    onClick={() => handleRemoveImage(index)}
                    sx={{
                      position: 'absolute',
                      top: 4,
                      right: 4,
                      bgcolor: 'rgba(255, 255, 255, 0.8)',
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Annulla</Button>
        <Button 
          onClick={handleCreate} 
          variant="contained" 
          color="primary"
          disabled={!newMemory.title || !newMemory.type || !newMemory.date}
        >
          Crea
        </Button>
      </DialogActions>
    </Dialog>
  );
} 