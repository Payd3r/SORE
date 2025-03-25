
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  IconButton,
  Grid,
  Button,
  TextField,
  Chip,
  ToggleButtonGroup,
  ToggleButton,
  CircularProgress,
  Paper,
  CardMedia,
  Avatar,
  Divider,
  useTheme,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import { Memory } from '../types/api';
import * as api from '../services/api';
import CreateMemoryDialog from '../components/CreateMemoryDialog';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { alpha } from '@mui/system';

const Memories: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { user } = useAuth();
  const [memories, setMemories] = useState<Memory[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('Tutti');
  const [dateFilter, setDateFilter] = useState<'all' | 'recent' | 'old'>('all');

  const types = [
    { label: 'Tutti', color: theme.palette.primary.main },
    { label: 'Viaggio', color: theme.palette.secondary.main },
    { label: 'Evento', color: theme.palette.success.main },
    { label: 'Semplice', color: theme.palette.info.main },
  ];

  useEffect(() => {
    if (!user?.coupleId) {
      setError('Non sei associato a nessuna coppia');
      setLoading(false);
      return;
    }
    loadMemories();
  }, [user?.coupleId]);

  const loadMemories = async () => {
    if (!user?.coupleId) return;
    
    try {
      setLoading(true);
      const response = await api.getMemories(user.coupleId);
      console.log('Ricordi caricati:', response);
      setMemories(response);
      setError(null);
    } catch (err) {
      console.error('Error loading memories:', err);
      setError('Impossibile caricare i ricordi. Riprova.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMemory = async (newMemory: Memory) => {
    if (!user?.coupleId) {
      toast.error('Non sei associato a nessuna coppia');
      return;
    }

    try {
      setMemories([newMemory, ...memories]);
      setCreateDialogOpen(false);
      toast.success('Ricordo creato con successo!');
    } catch (err) {
      console.error('Error creating memory:', err);
      setError('Impossibile creare il ricordo. Riprova.');
      toast.error('Impossibile creare il ricordo');
    }
  };

  const handleUpdateMemory = async (updatedMemory: Memory) => {
    if (!user?.coupleId) {
      toast.error('Non sei associato a nessuna coppia');
      return;
    }

    try {
      setMemories(prevMemories => 
        prevMemories.map(memory => 
          memory.id === updatedMemory.id ? updatedMemory : memory
        )
      );
      toast.success('Ricordo aggiornato con successo!');
    } catch (error) {
      console.error('Error updating memory:', error);
      toast.error('Impossibile aggiornare il ricordo');
    }
  };

  const handleDeleteMemory = async (memoryId: number) => {
    if (!user?.coupleId) {
      toast.error('Non sei associato a nessuna coppia');
      return;
    }

    try {
      await api.deleteMemory(user.coupleId, memoryId);
      setMemories(memories.filter(memory => memory.id !== memoryId));
      toast.success('Ricordo eliminato con successo!');
    } catch (err) {
      console.error('Error deleting memory:', err);
      setError('Impossibile eliminare il ricordo. Riprova.');
      toast.error('Impossibile eliminare il ricordo');
    }
  };

  const filteredMemories = memories.filter(memory => {
    // Filtro per ricerca
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      memory.title.toLowerCase().includes(searchLower) ||
      memory.description.toLowerCase().includes(searchLower) ||
      memory.type.toLowerCase().includes(searchLower) ||
      (memory.location && memory.location.toLowerCase().includes(searchLower)) ||
      (memory.song && memory.song.toLowerCase().includes(searchLower));

    // Filtro per tipo
    const matchesType = 
      selectedType === 'Tutti' || 
      memory.type.toLowerCase() === selectedType.toLowerCase();

    // Filtro per data
    const memoryDate = new Date(memory.date);
    const now = new Date();
    const matchesDate = 
      dateFilter === 'all' ||
      (dateFilter === 'recent' && memoryDate > new Date(now.setMonth(now.getMonth() - 6))) ||
      (dateFilter === 'old' && memoryDate <= new Date(now.setMonth(now.getMonth() - 6)));

    return matchesSearch && matchesType && matchesDate;
  });

  console.log('Ricordi filtrati:', filteredMemories);

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" fontWeight="bold" sx={{ mb: 1 }}>
          I vostri Ricordi
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Conserva i momenti speciali della vostra storia insieme
        </Typography>
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
              placeholder="Cerca tra i tuoi ricordi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
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

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateDialogOpen(true)}
            sx={{
              borderRadius: 3,
              textTransform: 'none',
              fontWeight: 500,
              px: 3,
              py: 1.2,
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
              '&:hover': {
                background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                boxShadow: `0 6px 16px ${alpha(theme.palette.primary.main, 0.4)}`,
                transform: 'translateY(-2px)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            Nuovo Ricordo
          </Button>
        </Box>
      </Paper>

      <Box sx={{ mb: 4 }}>
        <Typography variant="subtitle1" fontWeight="medium" sx={{ mb: 2 }}>
          Filtra per tipo
        </Typography>
        <Box
          sx={{
            display: 'flex',
            gap: 1.5,
            flexWrap: 'wrap',
            mb: 3,
          }}
        >
          {types.map((type) => (
            <Chip
              key={type.label}
              label={type.label}
              onClick={() => setSelectedType(type.label)}
              sx={{
                borderRadius: 3,
                py: 2,
                px: 1,
                backgroundColor: selectedType === type.label
                  ? type.color
                  : theme.palette.background.paper,
                color: selectedType === type.label
                  ? '#fff'
                  : 'text.primary',
                border: '1px solid',
                borderColor: selectedType === type.label 
                  ? 'transparent' 
                  : alpha(type.color, 0.3),
                boxShadow: selectedType === type.label 
                  ? `0 4px 12px ${alpha(type.color, 0.3)}`
                  : '0 2px 8px rgba(0, 0, 0, 0.05)',
                '&:hover': {
                  backgroundColor: selectedType === type.label
                    ? type.color
                    : alpha(type.color, 0.1),
                },
                transition: 'all 0.3s ease',
                fontWeight: 500,
              }}
            />
          ))}
        </Box>

        <Typography variant="subtitle1" fontWeight="medium" sx={{ mb: 2 }}>
          Filtra per data
        </Typography>
        <ToggleButtonGroup
          value={dateFilter}
          exclusive
          onChange={(e, newValue) => newValue && setDateFilter(newValue)}
          sx={{ 
            mb: 3,
            '.MuiToggleButtonGroup-grouped': {
              border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
              '&.Mui-selected': {
                backgroundColor: theme.palette.primary.main,
                color: theme.palette.primary.contrastText,
                fontWeight: 500,
                '&:hover': {
                  backgroundColor: theme.palette.primary.dark,
                },
              },
              '&:not(:first-of-type)': {
                borderRadius: 2,
                borderLeft: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
              },
              '&:first-of-type': {
                borderRadius: 2,
              },
              '&:last-of-type': {
                borderRadius: 2,
              },
              px: 3,
              py: 1,
              textTransform: 'none',
            }
          }}
        >
          <ToggleButton value="all">Tutti</ToggleButton>
          <ToggleButton value="recent">Ultimi 6 mesi</ToggleButton>
          <ToggleButton value="old">Più vecchi</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {loading ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <CircularProgress size={40} />
        </Box>
      ) : error ? (
        <Paper
          elevation={0}
          sx={{
            textAlign: 'center',
            py: 6,
            borderRadius: 3,
            border: '1px dashed',
            borderColor: alpha(theme.palette.error.main, 0.3),
            bgcolor: alpha(theme.palette.error.main, 0.05),
          }}
        >
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
          <Button
            variant="contained"
            color="error"
            onClick={loadMemories}
            sx={{ borderRadius: 3, textTransform: 'none' }}
          >
            Riprova
          </Button>
        </Paper>
      ) : filteredMemories.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            textAlign: 'center',
            py: 6,
            borderRadius: 3,
            border: '1px dashed',
            borderColor: alpha(theme.palette.primary.main, 0.3),
            bgcolor: alpha(theme.palette.primary.main, 0.05),
          }}
        >
          <Typography variant="h6" sx={{ mb: 2 }}>
            Nessun ricordo trovato
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3, maxWidth: 500, mx: 'auto' }}>
            {searchQuery || selectedType !== 'Tutti' || dateFilter !== 'all'
              ? 'Prova a modificare i filtri di ricerca'
              : 'Crea il tuo primo ricordo cliccando sul pulsante "Nuovo Ricordo"'}
          </Typography>
          {!searchQuery && selectedType === 'Tutti' && dateFilter === 'all' && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setCreateDialogOpen(true)}
              sx={{
                borderRadius: 3,
                textTransform: 'none',
                fontWeight: 500,
                px: 3,
                py: 1.2,
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
                '&:hover': {
                  background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                  boxShadow: `0 6px 16px ${alpha(theme.palette.primary.main, 0.4)}`,
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              Nuovo Ricordo
            </Button>
          )}
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {filteredMemories.map((memory) => (
            <Grid item xs={12} sm={6} md={4} key={memory.id}>
              <Card
                elevation={0}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  borderRadius: 3,
                  overflow: 'hidden',
                  border: '1px solid',
                  borderColor: alpha(theme.palette.divider, 0.8),
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                    borderColor: alpha(theme.palette.primary.main, 0.3),
                  },
                }}
                onClick={() => navigate(`/ricordi/${memory.id}`)}
              >
                {memory.images && memory.images.length > 0 && (
                  <CardMedia
                    component="img"
                    height="140"
                    image={memory.images[0].thumb_big_path}
                    alt={memory.title}
                    sx={{
                      objectFit: 'cover',
                    }}
                  />
                )}
                <CardContent sx={{ flex: 1, p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h6" component="div" sx={{ fontWeight: 600, flex: 1, mr: 2 }}>
                      {memory.title}
                    </Typography>
                    <Chip
                      label={memory.type === 'viaggio' ? 'Viaggio' : memory.type === 'evento' ? 'Evento' : 'Semplice'}
                      size="small"
                      sx={{
                        borderRadius: 8,
                        bgcolor: memory.type === 'viaggio' 
                          ? alpha(theme.palette.secondary.main, 0.1)
                          : memory.type === 'evento'
                            ? alpha(theme.palette.success.main, 0.1)
                            : alpha(theme.palette.info.main, 0.1),
                        color: memory.type === 'viaggio' 
                          ? theme.palette.secondary.main
                          : memory.type === 'evento'
                            ? theme.palette.success.main
                            : theme.palette.info.main,
                        border: '1px solid',
                        borderColor: memory.type === 'viaggio' 
                          ? alpha(theme.palette.secondary.main, 0.3)
                          : memory.type === 'evento'
                            ? alpha(theme.palette.success.main, 0.3)
                            : alpha(theme.palette.info.main, 0.3),
                        fontWeight: 500,
                      }}
                    />
                  </Box>
                  <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    sx={{ 
                      mb: 2,
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      minHeight: '3.6em', // Roughly 3 lines of text
                    }}
                  >
                    {memory.description}
                  </Typography>
                  
                  <Box sx={{ mt: 'auto' }}>
                    {(memory.location || memory.song) && (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                        {memory.location && (
                          <Chip
                            icon={<LocationOnIcon sx={{ fontSize: '1rem' }} />}
                            label={memory.location}
                            size="small"
                            sx={{ 
                              borderRadius: 8,
                              bgcolor: alpha(theme.palette.primary.main, 0.05),
                              border: '1px solid',
                              borderColor: alpha(theme.palette.primary.main, 0.1),
                              fontSize: '0.75rem',
                            }}
                          />
                        )}
                        {memory.song && (
                          <Chip
                            icon={<MusicNoteIcon sx={{ fontSize: '1rem' }} />}
                            label={memory.song}
                            size="small"
                            sx={{ 
                              borderRadius: 8,
                              bgcolor: alpha(theme.palette.secondary.main, 0.05),
                              border: '1px solid',
                              borderColor: alpha(theme.palette.secondary.main, 0.1),
                              fontSize: '0.75rem',
                            }}
                          />
                        )}
                      </Box>
                    )}
                    
                    <Divider sx={{ my: 1.5 }} />
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar
                          sx={{ width: 24, height: 24, bgcolor: theme.palette.primary.main, fontSize: '0.75rem' }}
                        >
                          {memory.created_by_name?.[0]}
                        </Avatar>
                        <Typography variant="caption" color="text.secondary">
                          {memory.created_by_name}
                        </Typography>
                      </Box>
                      <Chip
                        icon={<CalendarMonthIcon sx={{ fontSize: '0.875rem' }} />}
                        label={new Date(memory.date).toLocaleDateString('it-IT')}
                        size="small"
                        variant="outlined"
                        sx={{ 
                          borderRadius: 8,
                          fontSize: '0.7rem',
                        }}
                      />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <CreateMemoryDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onMemoryCreated={handleCreateMemory}
      />
    </Box>
  );
};

export default Memories;
