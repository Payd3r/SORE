import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  IconButton,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';
import { Idea } from '../types/api';
import * as api from '../services/api';

interface IdeaDetailProps {
  open: boolean;
  onClose: () => void;
  idea: Idea;
  onIdeaUpdate: (idea: Idea) => void;
  onIdeaDelete: (ideaId: number) => Promise<void>;
}

export default function IdeaDetail({ open, onClose, idea, onIdeaUpdate, onIdeaDelete }: IdeaDetailProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedIdea, setEditedIdea] = useState<Idea>(idea);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      const updatedIdea = await api.updateIdea(editedIdea.id, {
        title: editedIdea.title,
        description: editedIdea.description,
        category: editedIdea.category,
        due_date: editedIdea.due_date,
      });
      onIdeaUpdate(updatedIdea);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating idea:', error);
    }
  };

  const handleCheck = async () => {
    try {
      const updatedIdea = await api.checkIdea(idea.id, !idea.checked);
      onIdeaUpdate(updatedIdea);
    } catch (error) {
      console.error('Error checking idea:', error);
    }
  };

  const handleCancel = () => {
    setEditedIdea(idea);
    setIsEditing(false);
  };

  const handleDelete = async () => {
    try {
      await onIdeaDelete(idea.id);
      onClose();
    } catch (error) {
      console.error('Error deleting idea:', error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            {isEditing ? 'Modifica idea' : 'Dettagli idea'}
          </Typography>
          <Box>
            {!isEditing && (
              <>
                <IconButton 
                  onClick={handleCheck} 
                  color={idea.checked ? "success" : "default"}
                  title={idea.checked ? "Segna come non completata" : "Segna come completata"}
                >
                  <CheckCircleIcon />
                </IconButton>
                <IconButton onClick={handleEdit} color="primary">
                  <EditIcon />
                </IconButton>
                <IconButton onClick={() => setShowDeleteDialog(true)} color="error">
                  <DeleteIcon />
                </IconButton>
              </>
            )}
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
          {isEditing ? (
            <>
              <TextField
                label="Titolo"
                value={editedIdea.title}
                onChange={(e) => setEditedIdea({ ...editedIdea, title: e.target.value })}
                fullWidth
              />
              <TextField
                label="Descrizione"
                value={editedIdea.description}
                onChange={(e) => setEditedIdea({ ...editedIdea, description: e.target.value })}
                multiline
                rows={3}
                fullWidth
              />
              <FormControl fullWidth>
                <InputLabel>Categoria</InputLabel>
                <Select
                  value={editedIdea.category}
                  onChange={(e) => setEditedIdea({ ...editedIdea, category: e.target.value })}
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
                value={editedIdea.due_date?.split('T')[0] || ''}
                onChange={(e) => setEditedIdea({ ...editedIdea, due_date: e.target.value })}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
            </>
          ) : (
            <>
              <Typography variant="h5" gutterBottom>
                {idea.title}
                {idea.checked && (
                  <Chip 
                    label="Completata"
                    color="success"
                    size="small"
                    sx={{ ml: 1 }}
                  />
                )}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Descrizione:</strong> {idea.description}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Categoria:</strong> {idea.category}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Data:</strong> {new Date(idea.due_date).toLocaleDateString('it-IT')}
              </Typography>
              {idea.checked && (
                <Typography variant="body1" gutterBottom>
                  <strong>Completata il:</strong> {new Date(idea.date_checked!).toLocaleDateString('it-IT')}
                </Typography>
              )}
              <Typography variant="body2" color="text.secondary">
                Creata da {idea.created_by_name} il {new Date(idea.created_at).toLocaleDateString('it-IT')}
              </Typography>
            </>
          )}
        </Box>
      </DialogContent>
      {isEditing && (
        <DialogActions>
          <Button onClick={handleCancel}>Annulla</Button>
          <Button onClick={handleSave} variant="contained" color="primary">
            Salva
          </Button>
        </DialogActions>
      )}

      <Dialog open={showDeleteDialog} onClose={() => setShowDeleteDialog(false)}>
        <DialogTitle>Conferma eliminazione</DialogTitle>
        <DialogContent>
          <Typography>Sei sicuro di voler eliminare questa idea?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDeleteDialog(false)}>Annulla</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Elimina
          </Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
} 