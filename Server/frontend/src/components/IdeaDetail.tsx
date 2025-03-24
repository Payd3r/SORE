
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
  Avatar,
  useTheme,
  Divider,
  Paper,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';
import EventNoteIcon from '@mui/icons-material/EventNote';
import { Idea } from '../types/api';
import * as api from '../services/api';
import { alpha } from '@mui/system';

interface IdeaDetailProps {
  open: boolean;
  onClose: () => void;
  idea: Idea;
  onIdeaUpdate: (idea: Idea) => void;
  onIdeaDelete: (ideaId: number) => Promise<void>;
}

export default function IdeaDetail({ open, onClose, idea, onIdeaUpdate, onIdeaDelete }: IdeaDetailProps) {
  const theme = useTheme();
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
  
  const categoryColorMap: Record<string, string> = {
    viaggio: theme.palette.primary.main,
    ristorante: theme.palette.error.main,
    attività: theme.palette.success.main,
    challenge: theme.palette.secondary.main,
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
      maxWidth="md" 
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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5" component="div" fontWeight={600}>
            {isEditing ? 'Modifica idea' : 'Dettagli idea'}
          </Typography>
          <Box>
            {!isEditing && (
              <>
                <IconButton 
                  onClick={handleCheck} 
                  color={idea.checked ? "success" : "default"}
                  title={idea.checked ? "Segna come non completata" : "Segna come completata"}
                  sx={{
                    mr: 1,
                    bgcolor: idea.checked ? alpha(theme.palette.success.main, 0.1) : 'transparent',
                    '&:hover': {
                      bgcolor: idea.checked ? alpha(theme.palette.success.main, 0.2) : alpha(theme.palette.action.hover, 0.8),
                    }
                  }}
                >
                  <CheckCircleIcon />
                </IconButton>
                <IconButton 
                  onClick={handleEdit} 
                  color="primary"
                  sx={{
                    mr: 1,
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    '&:hover': {
                      bgcolor: alpha(theme.palette.primary.main, 0.2),
                    }
                  }}
                >
                  <EditIcon />
                </IconButton>
                <IconButton 
                  onClick={() => setShowDeleteDialog(true)} 
                  color="error"
                  sx={{
                    mr: 1,
                    bgcolor: alpha(theme.palette.error.main, 0.1),
                    '&:hover': {
                      bgcolor: alpha(theme.palette.error.main, 0.2),
                    }
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </>
            )}
            <IconButton 
              onClick={onClose}
              sx={{
                bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.background.paper, 0.15) : alpha(theme.palette.grey[200], 0.5),
                '&:hover': {
                  bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.background.paper, 0.25) : alpha(theme.palette.grey[300], 0.5),
                }
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ pt: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {isEditing ? (
            <>
              <TextField
                label="Titolo"
                value={editedIdea.title}
                onChange={(e) => setEditedIdea({ ...editedIdea, title: e.target.value })}
                fullWidth
                variant="outlined"
                InputProps={{
                  sx: {
                    borderRadius: 2,
                  }
                }}
              />
              <TextField
                label="Descrizione"
                value={editedIdea.description}
                onChange={(e) => setEditedIdea({ ...editedIdea, description: e.target.value })}
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
                    onClick={() => setEditedIdea({ ...editedIdea, category: option.value })}
                    sx={{
                      borderRadius: 3,
                      py: 2,
                      backgroundColor: editedIdea.category === option.value
                        ? option.color
                        : theme.palette.background.paper,
                      color: editedIdea.category === option.value
                        ? '#fff'
                        : 'text.primary',
                      border: '1px solid',
                      borderColor: option.color ? alpha(option.color, 0.3) : 'transparent',
                      boxShadow: editedIdea.category === option.value 
                        ? `0 4px 12px ${alpha(option.color, 0.3)}`
                        : '0 2px 8px rgba(0, 0, 0, 0.05)',
                      '&:hover': {
                        backgroundColor: editedIdea.category === option.value
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
                value={editedIdea.due_date?.split('T')[0] || ''}
                onChange={(e) => setEditedIdea({ ...editedIdea, due_date: e.target.value })}
                InputLabelProps={{ shrink: true }}
                fullWidth
                variant="outlined"
                InputProps={{
                  sx: {
                    borderRadius: 2,
                  }
                }}
              />
            </>
          ) : (
            <>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'flex-start', 
                gap: 2, 
                mb: 3,
                position: 'relative'
              }}>
                <Box
                  sx={{
                    bgcolor: alpha(categoryColorMap[idea.category as keyof typeof categoryColorMap] || theme.palette.primary.main, 0.1),
                    p: 2,
                    borderRadius: 3,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <EventNoteIcon 
                    sx={{ 
                      fontSize: 42,
                      color: categoryColorMap[idea.category as keyof typeof categoryColorMap] || theme.palette.primary.main
                    }} 
                  />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h5" gutterBottom fontWeight={600}>
                    {idea.title}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                    <Chip 
                      label={idea.category}
                      size="small"
                      sx={{
                        borderRadius: 8,
                        bgcolor: alpha(categoryColorMap[idea.category as keyof typeof categoryColorMap] || theme.palette.primary.main, 0.1),
                        color: categoryColorMap[idea.category as keyof typeof categoryColorMap] || theme.palette.primary.main,
                        border: '1px solid',
                        borderColor: alpha(categoryColorMap[idea.category as keyof typeof categoryColorMap] || theme.palette.primary.main, 0.2),
                        fontWeight: 500,
                      }}
                    />
                    {idea.checked && (
                      <Chip 
                        label="Completata"
                        color="success"
                        size="small"
                        icon={<CheckCircleIcon style={{ fontSize: 16 }} />}
                        sx={{ borderRadius: 8 }}
                      />
                    )}
                  </Box>
                </Box>
              </Box>
              
              <Divider sx={{ mb: 3 }} />
              
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Descrizione
              </Typography>
              <Typography variant="body1" paragraph>
                {idea.description || 'Nessuna descrizione disponibile'}
              </Typography>
              
              <Grid container spacing={3} sx={{ mb: 3 }}>
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
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Data prevista
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {new Date(idea.due_date).toLocaleDateString('it-IT')}
                    </Typography>
                  </Paper>
                </Grid>
                {idea.checked && (
                  <Grid item xs={12} sm={6}>
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
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Completata il
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {idea.date_checked ? new Date(idea.date_checked).toLocaleDateString('it-IT') : 'N/A'}
                      </Typography>
                    </Paper>
                  </Grid>
                )}
              </Grid>
              
              <Divider sx={{ mb: 3 }} />
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar
                  sx={{
                    bgcolor: theme.palette.primary.main,
                    width: 40,
                    height: 40,
                  }}
                >
                  {idea.created_by_name?.[0]}
                </Avatar>
                <Box>
                  <Typography variant="subtitle2">
                    {idea.created_by_name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Creata il {new Date(idea.created_at).toLocaleDateString('it-IT')}
                  </Typography>
                </Box>
              </Box>
            </>
          )}
        </Box>
      </DialogContent>
      {isEditing && (
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button 
            onClick={handleCancel}
            variant="outlined"
            sx={{ 
              borderRadius: 2,
              textTransform: 'none', 
              px: 3,
              fontWeight: 500,
            }}
          >
            Annulla
          </Button>
          <Button 
            onClick={handleSave} 
            variant="contained" 
            sx={{ 
              borderRadius: 2, 
              textTransform: 'none', 
              px: 3,
              fontWeight: 500,
              boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              '&:hover': {
                boxShadow: `0 6px 16px ${alpha(theme.palette.primary.main, 0.4)}`,
                background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
              },
            }}
          >
            Salva
          </Button>
        </DialogActions>
      )}

      <Dialog 
        open={showDeleteDialog} 
        onClose={() => setShowDeleteDialog(false)}
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
          }
        }}
      >
        <DialogTitle>
          <Typography variant="h6" fontWeight={600}>
            Conferma eliminazione
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography>
            Sei sicuro di voler eliminare questa idea? Questa azione non può essere annullata.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={() => setShowDeleteDialog(false)}
            variant="outlined"
            sx={{ 
              borderRadius: 2,
              textTransform: 'none', 
              fontWeight: 500,
            }}
          >
            Annulla
          </Button>
          <Button 
            onClick={handleDelete} 
            color="error" 
            variant="contained"
            sx={{ 
              borderRadius: 2,
              textTransform: 'none', 
              fontWeight: 500,
              boxShadow: `0 4px 12px ${alpha(theme.palette.error.main, 0.3)}`,
              '&:hover': {
                boxShadow: `0 6px 16px ${alpha(theme.palette.error.main, 0.4)}`,
              },
            }}
          >
            Elimina
          </Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
}
