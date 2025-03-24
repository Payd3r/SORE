import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  TextField,
  Grid,
  Tabs,
  Tab,
  Paper,
  Chip,
  ToggleButtonGroup,
  ToggleButton,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Memory, Image } from '../types/api';
import * as api from '../services/api';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import ImageCarousel from '../components/ImageCarousel';
import TabPanel from '../components/TabPanel';
import CategoryIcon from '@mui/icons-material/Category';
import LabelIcon from '@mui/icons-material/Label';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';

const MemoryDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [memory, setMemory] = useState<Memory | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedMemory, setEditedMemory] = useState<Partial<Memory>>({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [galleryView, setGalleryView] = useState<'7' | '5' | '3'>('5');
  const [selectedTab, setSelectedTab] = useState(0);

  useEffect(() => {
    if (id) {
      loadMemory();
    }
  }, [id]);

  const loadMemory = async () => {
    if (!id) return;

    try {
      setIsLoading(true);
      const data = await api.getMemory(id);
      setMemory(data);
      setEditedMemory({
        title: data.title,
        description: data.description,
        type: data.type,
        date: data.date,
        category: data.category,
        start_date: data.start_date,
        end_date: data.end_date,
        location: data.location,
        song: data.song,
      });
      setError(null);
    } catch (err) {
      console.error('Error loading memory:', err);
      setError('Errore nel caricamento del ricordo');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateMemory = async () => {
    if (!memory || !user?.coupleId) return;

    try {
      setIsLoading(true);
      const updatedMemory = await api.updateMemory(user.coupleId, memory.id, {
        title: editedMemory.title,
        description: editedMemory.description,
        type: editedMemory.type,
        date: editedMemory.date,
        category: editedMemory.category,
        start_date: editedMemory.start_date,
        end_date: editedMemory.end_date,
        location: editedMemory.location,
        song: editedMemory.song,
      });
      setMemory(updatedMemory);
      setIsEditMode(false);
      setError(null);
    } catch (err) {
      console.error('Error updating memory:', err);
      setError('Errore nell\'aggiornamento del ricordo');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteMemory = async () => {
    if (!memory || !user?.coupleId) return;

    try {
      await api.deleteMemory(user.coupleId, memory.id);
      toast.success('Ricordo eliminato con successo!');
      navigate('/ricordi');
    } catch (err) {
      console.error('Error deleting memory:', err);
      toast.error('Impossibile eliminare il ricordo');
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || !memory) return;

    try {
      setIsLoading(true);
      const file = event.target.files[0];
      const formData = new FormData();
      formData.append('image', file);
      
      const uploadedImage = await api.uploadMemoryImage(memory.id.toString(), formData);
      
      setMemory(prev => prev ? {
        ...prev,
        images: [...prev.images, uploadedImage]
      } : null);
      
      setError(null);
    } catch (err) {
      console.error('Error uploading image:', err);
      setError('Errore nel caricamento dell\'immagine');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageDelete = async (imageId: number) => {
    if (!memory) return;

    try {
      setIsLoading(true);
      await api.deleteImage(imageId);
      
      setMemory(prev => prev ? {
        ...prev,
        images: prev.images.filter(img => img.id !== imageId)
      } : null);
      
      setError(null);
    } catch (err) {
      console.error('Error deleting image:', err);
      setError('Errore nell\'eliminazione dell\'immagine');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography>Caricamento...</Typography>
      </Box>
    );
  }

  if (error || !memory) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="error" sx={{ mb: 2 }}>
          {error || 'Ricordo non trovato'}
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/ricordi')}
        >
          Torna ai Ricordi
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      {/* Header con titolo e azioni */}
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconButton onClick={() => navigate('/ricordi')}>
          <ArrowBackIcon />
        </IconButton>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h4" component="h1">
            {memory.title}
          </Typography>
          <Typography variant="subtitle2" color="text.secondary">
            Creato da {memory.created_by_name} il {new Date(memory.created_at).toLocaleDateString('it-IT')}
          </Typography>
        </Box>
        <IconButton onClick={() => setIsEditMode(true)}>
          <EditIcon />
        </IconButton>
        <IconButton onClick={() => setDeleteDialogOpen(true)}>
          <DeleteIcon />
        </IconButton>
      </Box>

      {/* Carosello immagini */}
      {memory.images && memory.images.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <ImageCarousel images={memory.images} />
        </Box>
      )}

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Generali" />
          <Tab label="Dettagli" />
          <Tab label="Galleria" />
        </Tabs>
      </Box>

      {/* Tab Panels */}
      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Typography variant="h6" gutterBottom>
              Descrizione
            </Typography>
            <Typography paragraph>
              {memory.description || 'Nessuna descrizione disponibile'}
            </Typography>

            {memory.images.length > 0 && (
              <>
                <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                  Anteprima Galleria
                </Typography>
                <Grid container spacing={2}>
                  {memory.images.slice(0, 3).map((image) => (
                    <Grid item xs={4} key={image.id}>
                      <Box
                        sx={{
                          position: 'relative',
                          width: '100%',
                          paddingTop: '100%',
                          borderRadius: 2,
                          overflow: 'hidden',
                          cursor: 'pointer',
                        }}
                        onClick={() => setTabValue(2)}
                      >
                        <img
                          src={image.thumb_big_path}
                          alt={image.description || 'Anteprima'}
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                          }}
                        />
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </>
            )}
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Informazioni
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <CategoryIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Tipo"
                    secondary={memory.type.charAt(0).toUpperCase() + memory.type.slice(1)}
                  />
                </ListItem>
                {memory.category && (
                  <ListItem>
                    <ListItemIcon>
                      <LabelIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Categoria"
                      secondary={memory.category}
                    />
                  </ListItem>
                )}
                {memory.date && (
                  <ListItem>
                    <ListItemIcon>
                      <CalendarTodayIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Data"
                      secondary={new Date(memory.date).toLocaleDateString('it-IT')}
                    />
                  </ListItem>
                )}
                {memory.location && (
                  <ListItem>
                    <ListItemIcon>
                      <LocationOnIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Luogo"
                      secondary={memory.location}
                    />
                  </ListItem>
                )}
                {memory.song && (
                  <ListItem>
                    <ListItemIcon>
                      <MusicNoteIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Canzone"
                      secondary={memory.song}
                    />
                  </ListItem>
                )}
              </List>
            </Paper>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Dettagli Aggiuntivi
              </Typography>
              <Grid container spacing={2}>
                {memory.type === 'viaggio' && (
                  <>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle1" gutterBottom>
                        Data di Partenza
                      </Typography>
                      <Typography>
                        {memory.start_date ? new Date(memory.start_date).toLocaleDateString('it-IT') : 'Non specificata'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle1" gutterBottom>
                        Data di Ritorno
                      </Typography>
                      <Typography>
                        {memory.end_date ? new Date(memory.end_date).toLocaleDateString('it-IT') : 'Non specificata'}
                      </Typography>
                    </Grid>
                  </>
                )}
                {memory.type === 'evento' && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" gutterBottom>
                      Data dell'Evento
                    </Typography>
                    <Typography>
                      {memory.date ? new Date(memory.date).toLocaleDateString('it-IT') : 'Non specificata'}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <Box sx={{ mb: 3 }}>
          <input
            accept="image/*"
            style={{ display: 'none' }}
            id="image-upload"
            type="file"
            onChange={handleImageUpload}
          />
          <label htmlFor="image-upload">
            <Button
              variant="contained"
              component="span"
              startIcon={<AddPhotoAlternateIcon />}
            >
              Aggiungi Foto
            </Button>
          </label>
        </Box>

        {memory.images.length > 0 ? (
          <ImageCarousel images={memory.images} />
        ) : (
          <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
            Nessuna immagine disponibile
          </Typography>
        )}
      </TabPanel>

      {/* Actions */}
      <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
        <Button
          variant="outlined"
          startIcon={<EditIcon />}
          onClick={() => setIsEditMode(true)}
        >
          Modifica
        </Button>
        <Button
          variant="outlined"
          color="error"
          startIcon={<DeleteIcon />}
          onClick={() => setDeleteDialogOpen(true)}
        >
          Elimina
        </Button>
      </Box>

      {/* Edit Dialog */}
      <Dialog open={isEditMode} onClose={() => setIsEditMode(false)} maxWidth="md" fullWidth>
        <DialogTitle>Modifica Ricordo</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Titolo"
              value={editedMemory.title || ''}
              onChange={(e) => setEditedMemory({ ...editedMemory, title: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Descrizione"
              value={editedMemory.description || ''}
              onChange={(e) => setEditedMemory({ ...editedMemory, description: e.target.value })}
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Tipo</InputLabel>
              <Select
                value={editedMemory.type || 'semplice'}
                onChange={(e) => setEditedMemory({ ...editedMemory, type: e.target.value as 'viaggio' | 'evento' | 'semplice' })}
                label="Tipo"
              >
                <MenuItem value="semplice">Semplice</MenuItem>
                <MenuItem value="viaggio">Viaggio</MenuItem>
                <MenuItem value="evento">Evento</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Categoria"
              value={editedMemory.category || ''}
              onChange={(e) => setEditedMemory({ ...editedMemory, category: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Luogo"
              value={editedMemory.location || ''}
              onChange={(e) => setEditedMemory({ ...editedMemory, location: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Canzone"
              value={editedMemory.song || ''}
              onChange={(e) => setEditedMemory({ ...editedMemory, song: e.target.value })}
              sx={{ mb: 2 }}
            />
            {editedMemory.type === 'viaggio' && (
              <>
                <TextField
                  fullWidth
                  type="date"
                  label="Data di Partenza"
                  value={editedMemory.start_date || ''}
                  onChange={(e) => setEditedMemory({ ...editedMemory, start_date: e.target.value })}
                  sx={{ mb: 2 }}
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  fullWidth
                  type="date"
                  label="Data di Ritorno"
                  value={editedMemory.end_date || ''}
                  onChange={(e) => setEditedMemory({ ...editedMemory, end_date: e.target.value })}
                  sx={{ mb: 2 }}
                  InputLabelProps={{ shrink: true }}
                />
              </>
            )}
            {editedMemory.type === 'evento' && (
              <TextField
                fullWidth
                type="date"
                label="Data dell'Evento"
                value={editedMemory.date || ''}
                onChange={(e) => setEditedMemory({ ...editedMemory, date: e.target.value })}
                sx={{ mb: 2 }}
                InputLabelProps={{ shrink: true }}
              />
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsEditMode(false)}>Annulla</Button>
          <Button onClick={handleUpdateMemory} variant="contained">Salva</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Conferma Eliminazione</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Sei sicuro di voler eliminare questo ricordo? Questa azione non può essere annullata.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Annulla</Button>
          <Button onClick={handleDeleteMemory} color="error" variant="contained">
            Elimina
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MemoryDetail;
