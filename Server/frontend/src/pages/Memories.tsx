
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
  InputAdornment,
  Tooltip,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { Memory } from '../types/api';
import * as api from '../services/api';
import CreateMemoryDialog from '../components/CreateMemoryDialog';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { alpha } from '@mui/system';
import { 
  staggerContainer, 
  staggerItem, 
  cardAnimation,
  buttonAnimation
} from '../utils/animation';

// Category type definition
type MemoryCategory = 'Tutti' | 'Viaggio' | 'Evento' | 'Semplice';

const Memories: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { user } = useAuth();
  const [memories, setMemories] = useState<Memory[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<MemoryCategory>('Tutti');
  const [dateFilter, setDateFilter] = useState<'all' | 'recent' | 'old'>('all');
  const [filtersVisible, setFiltersVisible] = useState(true);
  const [sortOption, setSortOption] = useState<'newest' | 'oldest'>('newest');

  const types: { label: MemoryCategory; color: string }[] = [
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

  // Function to get color based on memory type
  const getMemoryTypeColor = (type: string) => {
    switch(type.toLowerCase()) {
      case 'viaggio':
        return theme.palette.secondary.main;
      case 'evento':
        return theme.palette.success.main;
      default:
        return theme.palette.info.main;
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
  })
  // Ordina i ricordi in base all'opzione selezionata
  .sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return sortOption === 'newest' ? dateB - dateA : dateA - dateB;
  });

  console.log('Ricordi filtrati:', filteredMemories);

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
    >
      <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
        <motion.div variants={staggerItem}>
          <Box sx={{ mb: 4 }}>
            <Typography 
              variant="h4" 
              component="h1" 
              fontWeight="bold" 
              sx={{ 
                mb: 1,
                background: `linear-gradient(135deg, ${theme.palette.text.primary} 0%, ${alpha(theme.palette.text.primary, 0.8)} 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                textFillColor: 'transparent',
              }}
            >
              I vostri Ricordi
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Conserva i momenti speciali della vostra storia insieme
            </Typography>
          </Box>
        </motion.div>

        <motion.div variants={staggerItem}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2, md: 3 },
              mb: 4,
              borderRadius: 4,
              backgroundImage: `radial-gradient(circle at top right, ${alpha(theme.palette.primary.light, 0.1)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 50%, transparent 100%)`,
              border: '1px solid',
              borderColor: alpha(theme.palette.primary.main, 0.1),
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                top: -50,
                right: -50,
                width: 100,
                height: 100,
                borderRadius: '50%',
                background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 70%)`,
                zIndex: 0,
              }}
            />
            
            <Box
              sx={{
                position: 'relative',
                zIndex: 1,
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
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: alpha(theme.palette.text.primary, 0.5) }} />
                      </InputAdornment>
                    ),
                    sx: {
                      backgroundColor: theme.palette.background.paper,
                      borderRadius: 3,
                      height: '46px',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: alpha(theme.palette.primary.main, 0.1),
                        borderWidth: 1.5,
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: alpha(theme.palette.primary.main, 0.3),
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: theme.palette.primary.main,
                        borderWidth: 1.5,
                      },
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                      }
                    }
                  }}
                />
              </Box>

              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <Tooltip title="Toggle Filters">
                  <IconButton 
                    onClick={() => setFiltersVisible(!filtersVisible)}
                    sx={{
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        bgcolor: alpha(theme.palette.primary.main, 0.2),
                        transform: 'rotate(180deg)',
                      }
                    }}
                  >
                    <FilterListIcon />
                  </IconButton>
                </Tooltip>
                
                <motion.div variants={buttonAnimation} whileHover="hover" whileTap="tap">
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
                      position: 'relative',
                      overflow: 'hidden',
                      '&:hover': {
                        boxShadow: `0 6px 16px ${alpha(theme.palette.primary.main, 0.4)}`,
                      },
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: '-100%',
                        width: '100%',
                        height: '100%',
                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                        transition: 'all 0.5s ease',
                      },
                      '&:hover::after': {
                        left: '100%',
                      }
                    }}
                  >
                    Nuovo Ricordo
                  </Button>
                </motion.div>
              </Box>
            </Box>
          </Paper>
        </motion.div>

        <AnimatePresence>
          {filtersVisible && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 2, md: 3 },
                  mb: 4,
                  borderRadius: 4,
                  border: '1px solid',
                  borderColor: alpha(theme.palette.primary.main, 0.1),
                  backgroundImage: `radial-gradient(circle at bottom left, ${alpha(theme.palette.primary.light, 0.05)} 0%, ${alpha(theme.palette.primary.main, 0.02)} 50%, transparent 100%)`,
                }}
              >
                <Box sx={{ mb: 3 }}>
                  <Typography 
                    variant="subtitle1" 
                    fontWeight="600" 
                    sx={{ 
                      mb: 2,
                      display: 'flex',
                      alignItems: 'center',
                      '&::before': {
                        content: '""',
                        display: 'block',
                        width: '3px',
                        height: '18px',
                        background: `linear-gradient(to bottom, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                        marginRight: '10px',
                        borderRadius: '3px',
                      }
                    }}
                  >
                    Filtra per tipo
                  </Typography>
                  <Box
                    sx={{
                      display: 'flex',
                      gap: 1.5,
                      flexWrap: 'wrap',
                    }}
                  >
                    {types.map((type) => (
                      <motion.div 
                        key={type.label}
                        whileHover={{ y: -3, boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                        whileTap={{ y: 0, boxShadow: '0 5px 15px rgba(0,0,0,0.05)' }}
                        transition={{ type: "spring", stiffness: 300, damping: 10 }}
                      >
                        <Chip
                          label={type.label}
                          onClick={() => setSelectedType(type.label)}
                          sx={{
                            borderRadius: 3,
                            py: 2.5,
                            px: 1,
                            backgroundColor: selectedType === type.label
                              ? type.color
                              : theme.palette.background.paper,
                            color: selectedType === type.label
                              ? '#fff'
                              : 'text.primary',
                            border: '1.5px solid',
                            borderColor: selectedType === type.label 
                              ? 'transparent' 
                              : alpha(type.color, 0.3),
                            boxShadow: selectedType === type.label 
                              ? `0 4px 12px ${alpha(type.color, 0.3)}`
                              : '0 2px 8px rgba(0, 0, 0, 0.05)',
                            transition: 'all 0.3s ease',
                            fontWeight: 600,
                            '&:hover': {
                              backgroundColor: selectedType === type.label
                                ? type.color
                                : alpha(type.color, 0.1),
                            },
                          }}
                        />
                      </motion.div>
                    ))}
                  </Box>
                </Box>

                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Typography 
                      variant="subtitle1" 
                      fontWeight="600" 
                      sx={{ 
                        mb: 2,
                        display: 'flex',
                        alignItems: 'center',
                        '&::before': {
                          content: '""',
                          display: 'block',
                          width: '3px',
                          height: '18px',
                          background: `linear-gradient(to bottom, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                          marginRight: '10px',
                          borderRadius: '3px',
                        }
                      }}
                    >
                      Filtra per data
                    </Typography>
                    <ToggleButtonGroup
                      value={dateFilter}
                      exclusive
                      onChange={(e, newValue) => newValue && setDateFilter(newValue)}
                      sx={{ 
                        '.MuiToggleButtonGroup-grouped': {
                          border: `1.5px solid ${alpha(theme.palette.divider, 0.5)}`,
                          '&.Mui-selected': {
                            backgroundColor: theme.palette.primary.main,
                            color: theme.palette.primary.contrastText,
                            fontWeight: 600,
                            '&:hover': {
                              backgroundColor: theme.palette.primary.dark,
                            },
                          },
                          '&:not(:first-of-type)': {
                            borderRadius: 3,
                            borderLeft: `1.5px solid ${alpha(theme.palette.divider, 0.5)}`,
                          },
                          '&:first-of-type': {
                            borderRadius: 3,
                          },
                          '&:last-of-type': {
                            borderRadius: 3,
                          },
                          px: 3,
                          py: 1,
                          textTransform: 'none',
                          fontWeight: 500,
                          transition: 'all 0.3s ease',
                        }
                      }}
                    >
                      <ToggleButton value="all">Tutti</ToggleButton>
                      <ToggleButton value="recent">Ultimi 6 mesi</ToggleButton>
                      <ToggleButton value="old">Più vecchi</ToggleButton>
                    </ToggleButtonGroup>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Typography 
                      variant="subtitle1" 
                      fontWeight="600" 
                      sx={{ 
                        mb: 2,
                        display: 'flex',
                        alignItems: 'center',
                        '&::before': {
                          content: '""',
                          display: 'block',
                          width: '3px',
                          height: '18px',
                          background: `linear-gradient(to bottom, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                          marginRight: '10px',
                          borderRadius: '3px',
                        }
                      }}
                    >
                      Ordina per
                    </Typography>
                    <ToggleButtonGroup
                      value={sortOption}
                      exclusive
                      onChange={(e, newValue) => newValue && setSortOption(newValue)}
                      sx={{ 
                        '.MuiToggleButtonGroup-grouped': {
                          border: `1.5px solid ${alpha(theme.palette.divider, 0.5)}`,
                          '&.Mui-selected': {
                            backgroundColor: theme.palette.secondary.main,
                            color: theme.palette.secondary.contrastText,
                            fontWeight: 600,
                            '&:hover': {
                              backgroundColor: theme.palette.secondary.dark,
                            },
                          },
                          '&:not(:first-of-type)': {
                            borderRadius: 3,
                            borderLeft: `1.5px solid ${alpha(theme.palette.divider, 0.5)}`,
                          },
                          '&:first-of-type': {
                            borderRadius: 3,
                          },
                          '&:last-of-type': {
                            borderRadius: 3,
                          },
                          px: 3,
                          py: 1,
                          textTransform: 'none',
                          fontWeight: 500,
                          transition: 'all 0.3s ease',
                        }
                      }}
                    >
                      <ToggleButton value="newest">Più recenti</ToggleButton>
                      <ToggleButton value="oldest">Più vecchi</ToggleButton>
                    </ToggleButtonGroup>
                  </Grid>
                </Grid>
              </Paper>
            </motion.div>
          )}
        </AnimatePresence>

        {loading ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <CircularProgress size={40} sx={{ color: theme.palette.primary.main }} />
            </motion.div>
          </Box>
        ) : error ? (
          <motion.div variants={staggerItem}>
            <Paper
              elevation={0}
              sx={{
                textAlign: 'center',
                py: 6,
                borderRadius: 4,
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
                sx={{ 
                  borderRadius: 3, 
                  textTransform: 'none',
                  fontWeight: 500,
                  boxShadow: `0 4px 12px ${alpha(theme.palette.error.main, 0.3)}`,
                }}
              >
                Riprova
              </Button>
            </Paper>
          </motion.div>
        ) : filteredMemories.length === 0 ? (
          <motion.div variants={staggerItem}>
            <Paper
              elevation={0}
              sx={{
                textAlign: 'center',
                py: 6,
                borderRadius: 4,
                border: '1px dashed',
                borderColor: alpha(theme.palette.primary.main, 0.3),
                bgcolor: alpha(theme.palette.primary.main, 0.05),
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  top: -50,
                  left: -50,
                  width: 100,
                  height: 100,
                  borderRadius: '50%',
                  background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 70%)`,
                  zIndex: 0,
                }}
              />
              
              <Box
                sx={{
                  position: 'absolute',
                  bottom: -50,
                  right: -50,
                  width: 100,
                  height: 100,
                  borderRadius: '50%',
                  background: `radial-gradient(circle, ${alpha(theme.palette.primary.light, 0.1)} 0%, transparent 70%)`,
                  zIndex: 0,
                }}
              />
              
              <Box sx={{ position: 'relative', zIndex: 1 }}>
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 80, damping: 15 }}
                >
                  {searchQuery || selectedType !== 'Tutti' || dateFilter !== 'all' ? (
                    <FilterListIcon sx={{ 
                      fontSize: 60, 
                      color: alpha(theme.palette.primary.main, 0.6), 
                      mb: 2,
                      filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))',
                    }} />
                  ) : (
                    <FavoriteIcon sx={{ 
                      fontSize: 60, 
                      color: alpha(theme.palette.primary.main, 0.6), 
                      mb: 2,
                      filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))',
                    }} />
                  )}
                </motion.div>
                
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Nessun ricordo trovato
                </Typography>
                <Typography color="text.secondary" sx={{ mb: 3, maxWidth: 500, mx: 'auto' }}>
                  {searchQuery || selectedType !== 'Tutti' || dateFilter !== 'all'
                    ? 'Prova a modificare i filtri di ricerca'
                    : 'Crea il tuo primo ricordo cliccando sul pulsante "Nuovo Ricordo"'}
                </Typography>
                {!searchQuery && selectedType === 'Tutti' && dateFilter === 'all' && (
                  <motion.div variants={buttonAnimation} whileHover="hover" whileTap="tap">
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
                        position: 'relative',
                        overflow: 'hidden',
                        '&:hover': {
                          boxShadow: `0 6px 16px ${alpha(theme.palette.primary.main, 0.4)}`,
                        },
                        '&::after': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: '-100%',
                          width: '100%',
                          height: '100%',
                          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                          transition: 'all 0.5s ease',
                        },
                        '&:hover::after': {
                          left: '100%',
                        }
                      }}
                    >
                      Nuovo Ricordo
                    </Button>
                  </motion.div>
                )}
              </Box>
            </Paper>
          </motion.div>
        ) : (
          <Grid container spacing={3}>
            {filteredMemories.map((memory, index) => (
              <Grid item xs={12} sm={6} md={4} key={memory.id}>
                <motion.div 
                  variants={cardAnimation}
                  custom={index}
                  whileHover="hover"
                  whileTap="tap"
                >
                  <Card
                    elevation={0}
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      cursor: 'pointer',
                      borderRadius: 4,
                      overflow: 'hidden',
                      border: '1px solid',
                      borderColor: alpha(theme.palette.divider, 0.8),
                      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                      position: 'relative',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        inset: 0,
                        background: `linear-gradient(135deg, ${alpha(getMemoryTypeColor(memory.type), 0.05)} 0%, ${alpha(getMemoryTypeColor(memory.type), 0.02)} 100%)`,
                        zIndex: 0,
                        opacity: 0,
                        transition: 'opacity 0.3s ease',
                      },
                      '&:hover::before': {
                        opacity: 1,
                      },
                    }}
                    onClick={() => navigate(`/ricordi/${memory.id}`)}
                  >
                    {memory.images && memory.images.length > 0 ? (
                      <CardMedia
                        component="img"
                        height="160"
                        image={memory.images[0].thumb_big_path}
                        alt={memory.title}
                        sx={{
                          objectFit: 'cover',
                          borderBottom: '1px solid',
                          borderColor: alpha(theme.palette.divider, 0.5),
                          transition: 'transform 0.5s ease',
                        }}
                      />
                    ) : (
                      <Box
                        sx={{
                          height: 160,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: `linear-gradient(135deg, ${alpha(getMemoryTypeColor(memory.type), 0.1)} 0%, ${alpha(getMemoryTypeColor(memory.type), 0.2)} 100%)`,
                        }}
                      >
                        <FavoriteIcon 
                          sx={{ 
                            fontSize: 60, 
                            color: alpha(getMemoryTypeColor(memory.type), 0.6),
                            filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))',
                          }} 
                        />
                      </Box>
                    )}
                    <CardContent sx={{ flex: 1, p: 3, position: 'relative', zIndex: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Typography 
                          variant="h6" 
                          component="div" 
                          sx={{ 
                            fontWeight: 600, 
                            flex: 1, 
                            mr: 2,
                            color: theme.palette.text.primary,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            lineHeight: 1.3,
                          }}
                        >
                          {memory.title}
                        </Typography>
                        <Chip
                          label={memory.type === 'viaggio' ? 'Viaggio' : memory.type === 'evento' ? 'Evento' : 'Semplice'}
                          size="small"
                          sx={{
                            borderRadius: 3,
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
                            fontWeight: 600,
                            py: 0.5,
                            px: 1,
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
                          lineHeight: 1.5,
                        }}
                      >
                        {memory.description}
                      </Typography>
                      
                      <Box sx={{ mt: 'auto' }}>
                        {(memory.location || memory.song) && (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                            {memory.location && (
                              <Chip
                                icon={<LocationOnIcon sx={{ fontSize: '0.9rem' }} />}
                                label={memory.location}
                                size="small"
                                sx={{ 
                                  borderRadius: 3,
                                  bgcolor: alpha(theme.palette.primary.main, 0.05),
                                  border: '1px solid',
                                  borderColor: alpha(theme.palette.primary.main, 0.1),
                                  fontSize: '0.75rem',
                                  fontWeight: 500,
                                }}
                              />
                            )}
                            {memory.song && (
                              <Chip
                                icon={<MusicNoteIcon sx={{ fontSize: '0.9rem' }} />}
                                label={memory.song}
                                size="small"
                                sx={{ 
                                  borderRadius: 3,
                                  bgcolor: alpha(theme.palette.secondary.main, 0.05),
                                  border: '1px solid',
                                  borderColor: alpha(theme.palette.secondary.main, 0.1),
                                  fontSize: '0.75rem',
                                  fontWeight: 500,
                                }}
                              />
                            )}
                          </Box>
                        )}
                        
                        <Divider sx={{ my: 1.5 }} />
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar
                              sx={{ 
                                width: 28, 
                                height: 28, 
                                bgcolor: theme.palette.primary.main, 
                                fontSize: '0.75rem',
                                fontWeight: 'bold',
                                boxShadow: `0 2px 5px ${alpha(theme.palette.primary.main, 0.2)}`,
                              }}
                            >
                              {memory.created_by_name?.[0]}
                            </Avatar>
                            <Typography variant="caption" color="text.secondary" fontWeight={500}>
                              {memory.created_by_name}
                            </Typography>
                          </Box>
                          <Chip
                            icon={<CalendarMonthIcon sx={{ fontSize: '0.8rem' }} />}
                            label={new Date(memory.date).toLocaleDateString('it-IT')}
                            size="small"
                            variant="outlined"
                            sx={{ 
                              borderRadius: 3,
                              fontSize: '0.7rem',
                              fontWeight: 500,
                              borderColor: alpha(theme.palette.primary.main, 0.2),
                            }}
                          />
                        </Box>
                        
                        <Box 
                          sx={{ 
                            mt: 2, 
                            display: 'flex', 
                            justifyContent: 'flex-end',
                            opacity: 0.7,
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              opacity: 1,
                            }
                          }}
                        >
                          <Button
                            endIcon={<ArrowForwardIcon />}
                            size="small"
                            sx={{
                              borderRadius: 3,
                              textTransform: 'none',
                              fontWeight: 500,
                              fontSize: '0.75rem',
                              color: theme.palette.primary.main,
                            }}
                          >
                            Vedi dettagli
                          </Button>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </motion.div>
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
    </motion.div>
  );
};

export default Memories;
