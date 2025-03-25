
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
  Divider,
  Avatar,
  useTheme,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloseIcon from '@mui/icons-material/Close';
import CategoryIcon from '@mui/icons-material/Category';
import LabelIcon from '@mui/icons-material/Label';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import DirectionsBoatIcon from '@mui/icons-material/DirectionsBoat';
import EventIcon from '@mui/icons-material/Event';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import InfoIcon from '@mui/icons-material/Info';
import { Memory, Image } from '../types/api';
import * as api from '../services/api';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import ImageCarousel from '../components/ImageCarousel';
import TabPanel from '../components/TabPanel';
import { alpha } from '@mui/system';

const MemoryDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const theme = useTheme();
  const [memory, setMemory] = useState<Memory | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedMemory, setEditedMemory] = useState<Partial<Memory>>({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [galleryView, setGalleryView] = useState<'7' | '5' | '3'>('5');
  const [selectedTab, setSelectedTab] = useState(0);
  const [uploadingImage, setUploadingImage] = useState(false);

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
      toast.error('Errore nel caricamento del ricordo');
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
      toast.success('Ricordo aggiornato con successo!');
    } catch (err) {
      console.error('Error updating memory:', err);
      setError('Errore nell\'aggiornamento del ricordo');
      toast.error('Errore nell\'aggiornamento del ricordo');
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
      setUploadingImage(true);
      const file = event.target.files[0];
      const formData = new FormData();
      formData.append('image', file);
      
      const uploadedImage = await api.uploadMemoryImage(memory.id.toString(), formData);
      
      setMemory(prev => prev ? {
        ...prev,
        images: [...prev.images, uploadedImage]
      } : null);
      
      setError(null);
      toast.success('Immagine caricata con successo!');
    } catch (err) {
      console.error('Error uploading image:', err);
      setError('Errore nel caricamento dell\'immagine');
      toast.error('Errore nel caricamento dell\'immagine');
    } finally {
      setUploadingImage(false);
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
      toast.success('Immagine eliminata con successo!');
    } catch (err) {
      console.error('Error deleting image:', err);
      setError('Errore nell\'eliminazione dell\'immagine');
      toast.error('Errore nell\'eliminazione dell\'immagine');
    } finally {
      setIsLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'viaggio':
        return <DirectionsBoatIcon />;
      case 'evento':
        return <EventIcon />;
      default:
        return <CategoryIcon />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'viaggio':
        return theme.palette.secondary.main;
      case 'evento':
        return theme.palette.success.main;
      default:
        return theme.palette.info.main;
    }
  };

  if (isLoading && !memory) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress size={60} thickness={4} />
      </Box>
    );
  }

  if (error || !memory) {
    return (
      <Paper 
        elevation={0} 
        sx={{ 
          p: 4, 
          textAlign: 'center',
          borderRadius: 3,
          maxWidth: 500,
          mx: 'auto',
          mt: 4,
          bgcolor: alpha(theme.palette.error.main, 0.05),
          border: '1px solid',
          borderColor: alpha(theme.palette.error.main, 0.2),
        }}
      >
        <Typography color="error" variant="h6" sx={{ mb: 3 }}>
          {error || 'Ricordo non trovato'}
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/ricordi')}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 500,
            px: 3,
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          }}
        >
          Torna ai Ricordi
        </Button>
      </Paper>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      {/* Header con titolo e azioni */}
      <Box 
        sx={{ 
          mb: 4, 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'flex-start', sm: 'center' }, 
          gap: 2,
          justifyContent: 'space-between', 
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton 
            onClick={() => navigate('/ricordi')}
            sx={{ 
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              '&:hover': {
                bgcolor: alpha(theme.palette.primary.main, 0.2),
              }
            }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Box>
            <Typography variant="h4" component="h1" fontWeight="bold">
              {memory.title}
            </Typography>
            <Typography variant="subtitle2" color="text.secondary">
              Creato da {memory.created_by_name} il {new Date(memory.created_at).toLocaleDateString('it-IT')}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={() => setIsEditMode(true)}
            sx={{ 
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 500,
            }}
          >
            Modifica
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={() => setDeleteDialogOpen(true)}
            sx={{ 
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 500,
            }}
          >
            Elimina
          </Button>
        </Box>
      </Box>

      {/* Carosello immagini */}
      {memory.images && memory.images.length > 0 && (
        <Paper 
          elevation={0} 
          sx={{ 
            mb: 4, 
            overflow: 'hidden', 
            borderRadius: 3,
            border: '1px solid',
            borderColor: alpha(theme.palette.divider, 0.8),
          }}
        >
          <ImageCarousel images={memory.images} />
        </Paper>
      )}

      {/* Tabs */}
      <Paper 
        elevation={0} 
        sx={{ 
          mb: 4, 
          borderRadius: 3,
          overflow: 'hidden',
          border: '1px solid',
          borderColor: alpha(theme.palette.divider, 0.8),
        }}
      >
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange}
            sx={{
              '.MuiTabs-indicator': {
                height: 3,
                borderRadius: 1.5,
              },
              '.MuiTab-root': {
                textTransform: 'none',
                fontWeight: 500,
                minHeight: 56,
                '&.Mui-selected': {
                  fontWeight: 600,
                },
              },
            }}
          >
            <Tab 
              label="Informazioni" 
              icon={<InfoIcon />} 
              iconPosition="start"
              sx={{ textTransform: 'none' }} 
            />
            <Tab 
              label="Dettagli" 
              icon={<CategoryIcon />} 
              iconPosition="start"
              sx={{ textTransform: 'none' }} 
            />
            <Tab 
              label="Galleria" 
              icon={<PhotoLibraryIcon />} 
              iconPosition="start"
              sx={{ textTransform: 'none' }} 
            />
          </Tabs>
        </Box>

        {/* Tab Panels */}
        <Box sx={{ p: 3 }}>
          <TabPanel value={tabValue} index={0}>
            <Grid container spacing={4}>
              <Grid item xs={12} md={8}>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  Descrizione
                </Typography>
                <Typography paragraph>
                  {memory.description || 'Nessuna descrizione disponibile'}
                </Typography>

                {memory.images.length > 0 && (
                  <>
                    <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ mt: 4 }}>
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
                              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                transform: 'scale(1.03)',
                                boxShadow: '0 8px 20px rgba(0, 0, 0, 0.15)',
                              }
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
                    {memory.images.length > 3 && (
                      <Button
                        variant="outlined"
                        onClick={() => setTabValue(2)}
                        startIcon={<PhotoLibraryIcon />}
                        sx={{ 
                          mt: 2, 
                          borderRadius: 2,
                          textTransform: 'none',
                          fontWeight: 500,
                        }}
                      >
                        Vedi tutte le foto ({memory.images.length})
                      </Button>
                    )}
                  </>
                )}
              </Grid>

              <Grid item xs={12} md={4}>
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 3, 
                    borderRadius: 3,
                    bgcolor: alpha(getTypeColor(memory.type), 0.05),
                    border: '1px solid',
                    borderColor: alpha(getTypeColor(memory.type), 0.1),
                  }}
                >
                  <Typography variant="h6" gutterBottom fontWeight="bold">
                    Informazioni
                  </Typography>
                  <List disablePadding>
                    <ListItem sx={{ px: 0, py: 1.5 }}>
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        {getTypeIcon(memory.type)}
                      </ListItemIcon>
                      <ListItemText 
                        primary="Tipo"
                        secondary={memory.type.charAt(0).toUpperCase() + memory.type.slice(1)}
                        primaryTypographyProps={{ variant: 'subtitle2', color: 'text.secondary' }}
                        secondaryTypographyProps={{ variant: 'body1', fontWeight: 500 }}
                      />
                    </ListItem>
                    {memory.category && (
                      <ListItem sx={{ px: 0, py: 1.5 }}>
                        <ListItemIcon sx={{ minWidth: 40 }}>
                          <LabelIcon />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Categoria"
                          secondary={memory.category}
                          primaryTypographyProps={{ variant: 'subtitle2', color: 'text.secondary' }}
                          secondaryTypographyProps={{ variant: 'body1', fontWeight: 500 }}
                        />
                      </ListItem>
                    )}
                    {memory.date && (
                      <ListItem sx={{ px: 0, py: 1.5 }}>
                        <ListItemIcon sx={{ minWidth: 40 }}>
                          <CalendarTodayIcon />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Data"
                          secondary={new Date(memory.date).toLocaleDateString('it-IT')}
                          primaryTypographyProps={{ variant: 'subtitle2', color: 'text.secondary' }}
                          secondaryTypographyProps={{ variant: 'body1', fontWeight: 500 }}
                        />
                      </ListItem>
                    )}
                    {memory.location && (
                      <ListItem sx={{ px: 0, py: 1.5 }}>
                        <ListItemIcon sx={{ minWidth: 40 }}>
                          <LocationOnIcon />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Luogo"
                          secondary={memory.location}
                          primaryTypographyProps={{ variant: 'subtitle2', color: 'text.secondary' }}
                          secondaryTypographyProps={{ variant: 'body1', fontWeight: 500 }}
                        />
                      </ListItem>
                    )}
                    {memory.song && (
                      <ListItem sx={{ px: 0, py: 1.5 }}>
                        <ListItemIcon sx={{ minWidth: 40 }}>
                          <MusicNoteIcon />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Canzone"
                          secondary={memory.song}
                          primaryTypographyProps={{ variant: 'subtitle2', color: 'text.secondary' }}
                          secondaryTypographyProps={{ variant: 'body1', fontWeight: 500 }}
                        />
                      </ListItem>
                    )}
                  </List>
                </Paper>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 3 }}>
                  <Avatar
                    sx={{
                      bgcolor: theme.palette.primary.main,
                      width: 40,
                      height: 40,
                    }}
                  >
                    {memory.created_by_name?.[0]}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle2" fontWeight={600}>
                      {memory.created_by_name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Creato il {new Date(memory.created_at).toLocaleDateString('it-IT')}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 3, 
                    borderRadius: 3,
                    bgcolor: alpha(getTypeColor(memory.type), 0.05),
                    border: '1px solid',
                    borderColor: alpha(getTypeColor(memory.type), 0.1),
                  }}
                >
                  <Typography variant="h6" gutterBottom fontWeight="bold">
                    Dettagli Aggiuntivi
                  </Typography>
                  <Grid container spacing={3} sx={{ mt: 1 }}>
                    {memory.type === 'viaggio' && (
                      <>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            Data di Partenza
                          </Typography>
                          <Typography variant="body1" fontWeight={500}>
                            {memory.start_date ? new Date(memory.start_date).toLocaleDateString('it-IT') : 'Non specificata'}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            Data di Ritorno
                          </Typography>
                          <Typography variant="body1" fontWeight={500}>
                            {memory.end_date ? new Date(memory.end_date).toLocaleDateString('it-IT') : 'Non specificata'}
                          </Typography>
                        </Grid>
                      </>
                    )}
                    {memory.type === 'evento' && (
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Data dell'Evento
                        </Typography>
                        <Typography variant="body1" fontWeight={500}>
                          {memory.date ? new Date(memory.date).toLocaleDateString('it-IT') : 'Non specificata'}
                        </Typography>
                      </Grid>
                    )}
                    
                    {memory.location && (
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Posizione
                        </Typography>
                        <Paper 
                          elevation={0} 
                          sx={{ 
                            p: 2, 
                            borderRadius: 2,
                            bgcolor: alpha(theme.palette.background.paper, 0.6),
                            border: '1px solid',
                            borderColor: alpha(theme.palette.divider, 0.3),
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                          }}
                        >
                          <LocationOnIcon color="primary" />
                          <Typography variant="body1">
                            {memory.location}
                          </Typography>
                        </Paper>
                      </Grid>
                    )}
                    
                    {memory.song && (
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Canzone del Ricordo
                        </Typography>
                        <Paper 
                          elevation={0} 
                          sx={{ 
                            p: 2, 
                            borderRadius: 2,
                            bgcolor: alpha(theme.palette.background.paper, 0.6),
                            border: '1px solid',
                            borderColor: alpha(theme.palette.divider, 0.3),
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                          }}
                        >
                          <MusicNoteIcon color="secondary" />
                          <Typography variant="body1">
                            {memory.song}
                          </Typography>
                        </Paper>
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
                disabled={uploadingImage}
              />
              <label htmlFor="image-upload">
                <Button
                  variant="contained"
                  component="span"
                  startIcon={uploadingImage ? <CircularProgress size={20} color="inherit" /> : <AddPhotoAlternateIcon />}
                  disabled={uploadingImage}
                  sx={{ 
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 500,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                  }}
                >
                  {uploadingImage ? 'Caricamento...' : 'Aggiungi Foto'}
                </Button>
              </label>
            </Box>

            {memory.images.length > 0 ? (
              <>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Galleria ({memory.images.length} foto)
                </Typography>
                <Grid container spacing={2}>
                  {memory.images.map((image) => (
                    <Grid item xs={6} sm={4} md={3} key={image.id}>
                      <Box
                        sx={{
                          position: 'relative',
                          width: '100%',
                          paddingTop: '100%',
                          borderRadius: 2,
                          overflow: 'hidden',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'scale(1.03)',
                            boxShadow: '0 8px 20px rgba(0, 0, 0, 0.15)',
                            '& .image-overlay': {
                              opacity: 1,
                            }
                          }
                        }}
                      >
                        <img
                          src={image.thumb_big_path}
                          alt={image.description || 'Foto del ricordo'}
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                          }}
                        />
                        <Box 
                          className="image-overlay"
                          sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            bgcolor: 'rgba(0, 0, 0, 0.5)',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            opacity: 0,
                            transition: 'opacity 0.3s ease',
                          }}
                        >
                          <IconButton 
                            color="error" 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleImageDelete(image.id);
                            }}
                            sx={{
                              bgcolor: 'rgba(255, 255, 255, 0.2)',
                              '&:hover': {
                                bgcolor: 'rgba(255, 255, 255, 0.3)',
                              }
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </>
            ) : (
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 4, 
                  textAlign: 'center',
                  borderRadius: 3,
                  border: '1px dashed',
                  borderColor: alpha(theme.palette.primary.main, 0.3),
                  bgcolor: alpha(theme.palette.primary.main, 0.05),
                }}
              >
                <Typography variant="body1" sx={{ mb: 2 }}>
                  Nessuna immagine disponibile
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Aggiungi foto a questo ricordo per arricchirlo
                </Typography>
                <label htmlFor="image-upload">
                  <Button
                    variant="contained"
                    component="span"
                    startIcon={<AddPhotoAlternateIcon />}
                    sx={{ 
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 500,
                      background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                    }}
                  >
                    Aggiungi la prima foto
                  </Button>
                </label>
              </Paper>
            )}
          </TabPanel>
        </Box>
      </Paper>

      {/* Edit Dialog */}
      <Dialog 
        open={isEditMode} 
        onClose={() => setIsEditMode(false)} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
          }
        }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" fontWeight="bold">
              Modifica Ricordo
            </Typography>
            <IconButton onClick={() => setIsEditMode(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <TextField
              fullWidth
              label="Titolo"
              value={editedMemory.title || ''}
              onChange={(e) => setEditedMemory({ ...editedMemory, title: e.target.value })}
              variant="outlined"
              InputProps={{
                sx: {
                  borderRadius: 2,
                }
              }}
            />
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Descrizione"
              value={editedMemory.description || ''}
              onChange={(e) => setEditedMemory({ ...editedMemory, description: e.target.value })}
              variant="outlined"
              InputProps={{
                sx: {
                  borderRadius: 2,
                }
              }}
            />
            <FormControl fullWidth variant="outlined">
              <InputLabel>Tipo</InputLabel>
              <Select
                value={editedMemory.type || 'semplice'}
                onChange={(e) => setEditedMemory({ ...editedMemory, type: e.target.value as 'viaggio' | 'evento' | 'semplice' })}
                label="Tipo"
                sx={{ borderRadius: 2 }}
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
              variant="outlined"
              InputProps={{
                sx: {
                  borderRadius: 2,
                }
              }}
            />
            <TextField
              fullWidth
              label="Luogo"
              value={editedMemory.location || ''}
              onChange={(e) => setEditedMemory({ ...editedMemory, location: e.target.value })}
              variant="outlined"
              InputProps={{
                sx: {
                  borderRadius: 2,
                }
              }}
            />
            <TextField
              fullWidth
              label="Canzone"
              value={editedMemory.song || ''}
              onChange={(e) => setEditedMemory({ ...editedMemory, song: e.target.value })}
              variant="outlined"
              InputProps={{
                sx: {
                  borderRadius: 2,
                }
              }}
            />
            {editedMemory.type === 'viaggio' && (
              <>
                <TextField
                  fullWidth
                  type="date"
                  label="Data di Partenza"
                  value={editedMemory.start_date || ''}
                  onChange={(e) => setEditedMemory({ ...editedMemory, start_date: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  variant="outlined"
                  InputProps={{
                    sx: {
                      borderRadius: 2,
                    }
                  }}
                />
                <TextField
                  fullWidth
                  type="date"
                  label="Data di Ritorno"
                  value={editedMemory.end_date || ''}
                  onChange={(e) => setEditedMemory({ ...editedMemory, end_date: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  variant="outlined"
                  InputProps={{
                    sx: {
                      borderRadius: 2,
                    }
                  }}
                />
              </>
            )}
            {(editedMemory.type === 'evento' || editedMemory.type === 'semplice') && (
              <TextField
                fullWidth
                type="date"
                label="Data dell'Evento"
                value={editedMemory.date ? new Date(editedMemory.date).toISOString().split('T')[0] : ''}
                onChange={(e) => setEditedMemory({ ...editedMemory, date: e.target.value })}
                InputLabelProps={{ shrink: true }}
                variant="outlined"
                InputProps={{
                  sx: {
                    borderRadius: 2,
                  }
                }}
              />
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button 
            onClick={() => setIsEditMode(false)}
            variant="outlined"
            sx={{ 
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 500,
              px: 3,
            }}
          >
            Annulla
          </Button>
          <Button 
            onClick={handleUpdateMemory} 
            variant="contained"
            sx={{ 
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 500,
              px: 3,
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            }}
          >
            Salva
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog 
        open={deleteDialogOpen} 
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
          }
        }}
      >
        <DialogTitle>
          <Typography variant="h6" fontWeight="bold">
            Conferma Eliminazione
          </Typography>
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Sei sicuro di voler eliminare questo ricordo? Questa azione non può essere annullata.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button 
            onClick={() => setDeleteDialogOpen(false)}
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
            onClick={handleDeleteMemory} 
            color="error" 
            variant="contained"
            sx={{ 
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 500,
            }}
          >
            Elimina
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MemoryDetail;
