
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  IconButton,
  TextField,
  ToggleButtonGroup,
  ToggleButton,
  ImageList,
  ImageListItem,
  CircularProgress,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper,
  Chip,
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import GridViewIcon from '@mui/icons-material/GridView';
import ViewAgendaIcon from '@mui/icons-material/ViewAgenda';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import { useAuth } from '../contexts/AuthContext';
import * as api from '../services/api';
import { Image, ImageType } from '../types/api';
import { useTheme } from '@mui/material/styles';
import { alpha } from '@mui/system';

const Gallery: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<'grid' | 'month'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [images, setImages] = useState<Image[]>([]);
  const [selectedImage, setSelectedImage] = useState<Image | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [uploading, setUploading] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });
  const [selectedCreators, setSelectedCreators] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<ImageType[]>([]);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [gridSize, setGridSize] = useState<3 | 5 | 7>(5);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const creators = Array.from(new Set(images.map(img => img.created_by_name).filter(Boolean)));
  const types = Object.values(ImageType);

  useEffect(() => {
    if (user?.coupleId) {
      loadImages();
    }
  }, [user?.coupleId]);

  const loadImages = async () => {
    if (!user?.coupleId) {
      setError('Utente non autenticato');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await api.getImages(user.coupleId);
      console.log('Immagini ricevute dal backend:', response);
      console.log('Tipi di immagini ricevuti:', response.map(img => img.type));
      setImages(response);
      setError(null);
    } catch (err) {
      console.error('Errore nel caricamento delle immagini:', err);
      setError('Errore nel caricamento delle immagini. Riprova.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setSelectedFiles(event.target.files);
    }
  };

  const handleUpload = async () => {
    if (!user?.coupleId || !selectedFiles) return;

    setUploading(true);
    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        await api.uploadImage(user.coupleId, selectedFiles[i]);
      }
      setSnackbar({
        open: true,
        message: 'Images uploaded successfully!',
        severity: 'success',
      });
      setUploadDialogOpen(false);
      loadImages();
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Failed to upload images. Please try again.',
        severity: 'error',
      });
    } finally {
      setUploading(false);
      setSelectedFiles(null);
    }
  };

  const handleImageClick = async (image: Image) => {
    try {
      const fullImage = await api.getImage(image.id);
      console.log('Immagine cliccata:', fullImage);
    } catch (error) {
      console.error('Errore nel caricamento dell\'immagine:', error);
    }
  };

  const handleImageDelete = async (imageId: number) => {
    try {
      await api.deleteImage(imageId);
      setImages(images.filter(img => img.id !== imageId));
    } catch (error) {
      console.error('Errore nell\'eliminazione dell\'immagine:', error);
    }
  };

  const handleImageUpdate = async (imageId: number, data: Partial<Image>) => {
    try {
      const updatedImage = await api.updateImageMetadata(imageId, data);
      setImages(prevImages => 
        prevImages.map(img => 
          img.id === imageId ? updatedImage : img
        )
      );
      setSelectedImage(null);
    } catch (error) {
      console.error('Errore nell\'aggiornamento dell\'immagine:', error);
    }
  };

  const filteredImages = images
    .filter(img => {
      const matchesCreators = selectedCreators.length === 0 ||
        selectedCreators.includes(img.created_by_name || '');

      const imageType = img.type || ImageType.COUPLE;

      const matchesTypes = selectedTypes.length === 0 ||
        selectedTypes.some(selectedType => {
          const normalizedSelectedType = selectedType.toLowerCase();
          const normalizedImageType = imageType.toLowerCase();
          return normalizedSelectedType === normalizedImageType;
        });

      console.log('Filtraggio immagine:', { 
        id: img.id, 
        type: imageType,
        matchesTypes, 
        selectedTypes,
        normalizedSelectedTypes: selectedTypes.map(t => t.toLowerCase()),
        normalizedImageType: imageType.toLowerCase()
      });

      return matchesCreators && matchesTypes;
    })
    .sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });

  console.log('Immagini filtrate:', filteredImages.length);

  const groupImagesByMonth = () => {
    const grouped = filteredImages.reduce((acc, img) => {
      if (!img.taken_at) return acc;
      const date = new Date(img.taken_at);
      const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(img);
      return acc;
    }, {} as Record<string, typeof images>);

    return Object.entries(grouped).sort((a, b) => b[0].localeCompare(a[0]));
  };

  const monthNames = [
    'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
    'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
  ];

  const formatMonthYear = (dateKey: string) => {
    const [year, month] = dateKey.split('-');
    return `${monthNames[parseInt(month) - 1]} ${year}`;
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1400, mx: 'auto' }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ mb: 1, fontWeight: "bold" }}>
          La tua Galleria
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Sfoglia e gestisci i tuoi ricordi fotografici
        </Typography>
        {error && (
          <Typography color="error" sx={{ mt: 2 }}>
            {error}
          </Typography>
        )}
      </Box>

      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 4,
          borderRadius: 3,
          backgroundImage: `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.1)} 0%, ${alpha(theme.palette.primary.main, 0.1)} 100%)`,
          border: '1px solid',
          borderColor: alpha(theme.palette.primary.main, 0.1),
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: { xs: 'flex-start', md: 'center' },
            justifyContent: 'space-between',
            gap: 2,
          }}
        >
          <Box sx={{ flex: 1, width: { xs: '100%', md: 'auto' } }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Cerca immagini..."
              InputProps={{
                sx: {
                  backgroundColor: theme.palette.background.paper,
                  borderRadius: 3,
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'transparent',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: theme.palette.primary.main,
                  },
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                }
              }}
            />
          </Box>

          <Box sx={{ display: 'flex', gap: 1, ml: { xs: 0, md: 'auto' } }}>
            <Button
              variant="outlined"
              startIcon={<FilterListIcon />}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                borderColor: 'divider',
                color: 'text.primary',
              }}
              onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            >
              Filtri
            </Button>

            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(_, value) => value && setViewMode(value)}
              sx={{
                bgcolor: 'background.paper',
                borderRadius: 2,
                '& .MuiToggleButton-root': {
                  border: 'none',
                  borderRadius: 2,
                  '&.Mui-selected': {
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                    '&:hover': {
                      bgcolor: 'primary.dark',
                    },
                  },
                },
              }}
            >
              <ToggleButton value="grid">
                <GridViewIcon />
              </ToggleButton>
              <ToggleButton value="month">
                <ViewAgendaIcon />
              </ToggleButton>
            </ToggleButtonGroup>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddPhotoAlternateIcon />}
              onClick={() => setUploadDialogOpen(true)}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              }}
            >
              Upload Images
            </Button>
          </Box>
        </Box>
      </Paper>

      {isFiltersOpen && (
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 4,
            borderRadius: 3,
            border: '1px solid',
            borderColor: alpha(theme.palette.divider, 0.8),
          }}
        >
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Creatori</InputLabel>
              <Select
                multiple
                value={selectedCreators}
                onChange={(e) => setSelectedCreators(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={value} size="small" />
                    ))}
                  </Box>
                )}
                sx={{ borderRadius: 2 }}
              >
                {creators.map(creator => (
                  <MenuItem key={creator} value={creator}>
                    {creator}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Tipo</InputLabel>
              <Select
                multiple
                value={selectedTypes}
                onChange={(e) => setSelectedTypes(typeof e.target.value === 'string' ? e.target.value.split(',') as ImageType[] : e.target.value as ImageType[])}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={value === ImageType.LANDSCAPE ? 'Paesaggio' : value === ImageType.SINGLE ? 'Singolo' : 'Coppia'} size="small" />
                    ))}
                  </Box>
                )}
                sx={{ borderRadius: 2 }}
              >
                {types.map(type => (
                  <MenuItem key={type} value={type}>
                    {type === ImageType.LANDSCAPE ? 'Paesaggio' :
                      type === ImageType.SINGLE ? 'Singolo' : 'Coppia'}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Ordine</InputLabel>
              <Select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="desc">Più recenti</MenuItem>
                <MenuItem value="asc">Più vecchie</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Paper>
      )}

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Typography variant="body1" fontWeight="medium">Dimensione griglia:</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {[3, 5, 7].map(size => (
            <Button
              key={size}
              variant={gridSize === size ? "contained" : "outlined"}
              size="small"
              onClick={() => setGridSize(size as 3 | 5 | 7)}
              sx={{ 
                minWidth: 40, 
                borderRadius: 2,
                background: gridSize === size ? 
                  `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)` : 
                  'transparent'
              }}
            >
              {size}
            </Button>
          ))}
        </Box>
      </Box>

      {viewMode === 'grid' ? (
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
          gap: 2 
        }}>
          {filteredImages.map((image) => (
            <Box
              key={image.id}
              sx={{
                position: 'relative',
                aspectRatio: '1',
                cursor: 'pointer',
                borderRadius: 2,
                overflow: 'hidden',
                boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 5px 15px rgba(0,0,0,0.15)',
                  '& .overlay': {
                    opacity: 1,
                  },
                },
              }}
              onClick={() => handleImageClick(image)}
            >
              <img
                src={image.thumb_big_path}
                alt={image.description || 'Immagine'}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
                onError={(e) => console.error('Errore nel caricamento dell\'immagine:', e)}
              />
              <Box
                className="overlay"
                sx={{
                  position: 'absolute',
                  inset: 0,
                  bgcolor: 'rgba(0, 0, 0, 0.5)',
                  opacity: 0,
                  transition: 'opacity 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Typography sx={{ color: 'white', fontWeight: 'medium', fontSize: '0.9rem' }}>
                  Clicca per visualizzare
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      ) : (
        <Box sx={{ mb: 8 }}>
          {groupImagesByMonth().map(([dateKey, monthImages]) => (
            <Box key={dateKey} sx={{ mb: 6 }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  mb: 3, 
                  color: 'text.primary',
                  fontWeight: 600,
                  position: 'relative',
                  pl: 2,
                  '&:before': {
                    content: '""',
                    position: 'absolute',
                    left: 0,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: 4,
                    height: '70%',
                    bgcolor: 'primary.main',
                    borderRadius: 4,
                  }
                }}
              >
                {formatMonthYear(dateKey)}
              </Typography>
              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(4, 1fr)', lg: 'repeat(5, 1fr)' },
                gap: 2 
              }}>
                {monthImages.map((image) => (
                  <Box
                    key={image.id}
                    className="image-card"
                    onClick={() => handleImageClick(image)}
                    sx={{
                      position: 'relative',
                      aspectRatio: '1',
                      cursor: 'pointer',
                      borderRadius: 2,
                      overflow: 'hidden',
                      boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: '0 5px 15px rgba(0,0,0,0.15)',
                        '& .overlay': {
                          opacity: 1,
                        },
                      },
                    }}
                  >
                    <img
                      src={image.thumb_big_path}
                      alt={image.description || 'Immagine'}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                      onError={(e) => {
                        console.error('Errore nel caricamento dell\'immagine:', e);
                      }}
                    />
                    <Box
                      className="overlay"
                      sx={{
                        position: 'absolute',
                        inset: 0,
                        bgcolor: 'rgba(0, 0, 0, 0.5)',
                        opacity: 0,
                        transition: 'opacity 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Typography sx={{ color: 'white', fontWeight: 'medium', fontSize: '0.9rem' }}>
                        Clicca per visualizzare
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          ))}
        </Box>
      )}
      <Dialog 
        open={uploadDialogOpen} 
        onClose={() => setUploadDialogOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 600 }}>Upload Images</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, mb: 2 }}>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              style={{ display: 'none' }}
              id="file-input"
            />
            <label htmlFor="file-input">
              <Button
                variant="outlined"
                component="span"
                startIcon={<AddPhotoAlternateIcon />}
                sx={{ 
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 500,
                }}
              >
                Seleziona immagini
              </Button>
            </label>
            {selectedFiles && (
              <Typography variant="body2" sx={{ mt: 2 }}>
                {selectedFiles.length} {selectedFiles.length === 1 ? 'file selezionato' : 'files selezionati'}
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, px: 3 }}>
          <Button 
            onClick={() => setUploadDialogOpen(false)}
            sx={{ 
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 500,
            }}
          >
            Annulla
          </Button>
          <Button
            onClick={handleUpload}
            variant="contained"
            color="primary"
            disabled={!selectedFiles || uploading}
            sx={{ 
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 500,
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            }}
          >
            {uploading ? 'Caricamento...' : 'Carica'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default Gallery;
