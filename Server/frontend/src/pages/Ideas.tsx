
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  IconButton,
  LinearProgress,
  Grid,
  Button,
  TextField,
  Chip,
  ToggleButtonGroup,
  ToggleButton,
  Tooltip,
  Paper,
  CardActions,
  Zoom,
  useTheme,
  alpha,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import FilterListIcon from '@mui/icons-material/FilterList';
import TuneIcon from '@mui/icons-material/Tune';
import SearchIcon from '@mui/icons-material/Search';
import SortIcon from '@mui/icons-material/Sort';
import { Idea } from '../types/api';
import * as api from '../services/api';
import CreateIdeaDialog from '../components/CreateIdeaDialog';
import IdeaDetail from '../components/IdeaDetail';
import { toast } from 'react-hot-toast';

const Ideas: React.FC = () => {
  const theme = useTheme();
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tutte');
  const [statusFilter, setStatusFilter] = useState<'all' | 'checked' | 'unchecked'>('all');
  const [filtersVisible, setFiltersVisible] = useState(false);

  const categories = [
    { label: 'Tutte', color: theme.palette.primary.main },
    { label: 'Viaggio', color: '#ed6c02' },
    { label: 'Ristorante', color: '#2e7d32' },
    { label: 'Attività', color: '#9c27b0' },
    { label: 'Challenge', color: '#d32f2f' },
  ];

  useEffect(() => {
    loadIdeas();
  }, []);

  const loadIdeas = async () => {
    try {
      const response = await api.getIdeas(1);
      console.log('Idee caricate:', response);
      setIdeas(response);
    } catch (err) {
      setError('Failed to load ideas. Please try again.');
    }
  };

  const handleCreateIdea = async (newIdea: Idea) => {
    try {
      setIdeas([newIdea, ...ideas]);
      setCreateDialogOpen(false);
      toast.success('Idea creata con successo!');
    } catch (err) {
      setError('Failed to create idea. Please try again.');
      toast.error('Impossibile creare l\'idea');
    }
  };

  const handleUpdateIdea = async (updatedIdea: Idea) => {
    try {
      setIdeas(prevIdeas => 
        prevIdeas.map(idea => 
          idea.id === updatedIdea.id ? updatedIdea : idea
        )
      );
      setSelectedIdea(null);
      toast.success('Idea aggiornata con successo!');
    } catch (error) {
      console.error('Error updating idea:', error);
      toast.error('Impossibile aggiornare l\'idea');
    }
  };

  const handleDeleteIdea = async (ideaId: number) => {
    try {
      await api.deleteIdea(ideaId);
      setIdeas(ideas.filter(idea => idea.id !== ideaId));
      setSelectedIdea(null);
      toast.success('Idea eliminata con successo!');
    } catch (err) {
      setError('Failed to delete idea. Please try again.');
      toast.error('Impossibile eliminare l\'idea');
    }
  };

  const handleCheckIdea = async (ideaId: number, checked: boolean, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    
    try {
      await api.checkIdea(ideaId, checked);
      setIdeas(prevIdeas => 
        prevIdeas.map(idea => 
          idea.id === ideaId 
            ? { ...idea, checked, date_checked: checked ? new Date().toISOString() : null }
            : idea
        )
      );
      toast.success(checked ? 'Idea completata!' : 'Idea riaperta!');
    } catch (error) {
      console.error('Error checking idea:', error);
      toast.error('Impossibile aggiornare lo stato dell\'idea');
    }
  };

  const filteredIdeas = ideas.filter(idea => {
    // Filtro per ricerca
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      idea.title.toLowerCase().includes(searchLower) ||
      idea.description.toLowerCase().includes(searchLower) ||
      idea.category.toLowerCase().includes(searchLower);

    // Filtro per categoria
    const matchesCategory = 
      selectedCategory === 'Tutte' || 
      idea.category.toLowerCase() === selectedCategory.toLowerCase();

    // Filtro per stato (checked/unchecked)
    const matchesStatus = 
      statusFilter === 'all' ||
      (statusFilter === 'checked' && idea.checked) ||
      (statusFilter === 'unchecked' && !idea.checked);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1400, mx: 'auto' }} className="fade-in">
      <Paper 
        elevation={0} 
        sx={{ 
          p: { xs: 2, md: 4 }, 
          borderRadius: 4, 
          mb: 4, 
          background: theme.palette.mode === 'dark' 
            ? 'linear-gradient(135deg, rgba(30,40,60,0.5) 0%, rgba(20,30,50,0.5) 100%)'
            : 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(245,245,250,0.9) 100%)',
          backdropFilter: 'blur(10px)',
          boxShadow: theme.palette.mode === 'dark'
            ? '0 8px 32px rgba(0, 0, 0, 0.2)'
            : '0 8px 32px rgba(0, 0, 0, 0.05)',
        }}
      >
        <Box sx={{ mb: 3 }}>
          <Typography 
            variant="h4" 
            sx={{ 
              mb: 1,
              fontWeight: 'bold',
              background: theme.palette.mode === 'dark' 
                ? 'linear-gradient(90deg, #9b87f5 0%, #7E69AB 100%)' 
                : 'linear-gradient(90deg, #7E69AB 0%, #6E59A5 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Le vostre Idee
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Pianifica nuove avventure insieme
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'flex',
            alignItems: { xs: 'stretch', md: 'center' },
            gap: 2,
            mb: 4,
            flexWrap: { xs: 'wrap', md: 'nowrap' },
          }}
        >
          <Box 
            sx={{ 
              flex: 1, 
              minWidth: { xs: '100%', md: 200 },
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <SearchIcon 
              sx={{ 
                position: 'absolute', 
                left: 12, 
                color: 'text.secondary',
                fontSize: '1.2rem',
              }} 
            />
            <TextField
              fullWidth
              placeholder="Cerca idee per titolo, descrizione o categoria..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{
                bgcolor: alpha(theme.palette.background.paper, 0.6),
                borderRadius: 3,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  paddingLeft: 5,
                },
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: alpha(theme.palette.divider, 0.3),
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: theme.palette.primary.main,
                },
              }}
            />
          </Box>

          <Button
            variant="contained"
            startIcon={<FilterListIcon />}
            onClick={() => setFiltersVisible(!filtersVisible)}
            sx={{
              borderRadius: 3,
              textTransform: 'none',
              px: 3,
              display: { xs: 'flex', md: 'none' },
              background: theme.palette.mode === 'dark'
                ? 'linear-gradient(90deg, rgba(126,105,171,0.8) 0%, rgba(154,135,245,0.8) 100%)'
                : 'linear-gradient(90deg, rgba(126,105,171,1) 0%, rgba(154,135,245,1) 100%)',
              boxShadow: '0 4px 15px rgba(126,105,171,0.2)',
              '&:hover': {
                boxShadow: '0 6px 20px rgba(126,105,171,0.3)',
                background: theme.palette.mode === 'dark'
                  ? 'linear-gradient(90deg, rgba(126,105,171,0.9) 0%, rgba(154,135,245,0.9) 100%)'
                  : 'linear-gradient(90deg, rgba(126,105,171,1) 0%, rgba(154,135,245,1) 100%)',
              },
            }}
          >
            Filtri
          </Button>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateDialogOpen(true)}
            sx={{
              borderRadius: 3,
              textTransform: 'none',
              px: 3,
              background: theme.palette.mode === 'dark'
                ? 'linear-gradient(90deg, rgba(126,105,171,0.8) 0%, rgba(154,135,245,0.8) 100%)'
                : 'linear-gradient(90deg, rgba(126,105,171,1) 0%, rgba(154,135,245,1) 100%)',
              boxShadow: '0 4px 15px rgba(126,105,171,0.2)',
              '&:hover': {
                boxShadow: '0 6px 20px rgba(126,105,171,0.3)',
                background: theme.palette.mode === 'dark'
                  ? 'linear-gradient(90deg, rgba(126,105,171,0.9) 0%, rgba(154,135,245,0.9) 100%)'
                  : 'linear-gradient(90deg, rgba(126,105,171,1) 0%, rgba(154,135,245,1) 100%)',
              },
            }}
          >
            Nuova Idea
          </Button>
        </Box>

        <Zoom in={filtersVisible || window.innerWidth >= 960}>
          <Box sx={{ mb: 4, display: { xs: filtersVisible ? 'block' : 'none', md: 'block' } }}>
            <Paper
              sx={{
                p: 3,
                borderRadius: 4,
                bgcolor: alpha(theme.palette.background.paper, 0.4),
                backdropFilter: 'blur(8px)',
                boxShadow: theme.palette.mode === 'dark'
                  ? '0 4px 20px rgba(0, 0, 0, 0.1)'
                  : '0 4px 20px rgba(0, 0, 0, 0.03)',
              }}
            >
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TuneIcon fontSize="small" color="primary" />
                  Filtra per categoria
                </Typography>
                <Box
                  sx={{
                    display: 'flex',
                    gap: 1,
                    flexWrap: 'wrap',
                  }}
                >
                  {categories.map((category) => (
                    <Chip
                      key={category.label}
                      label={category.label}
                      onClick={() => setSelectedCategory(category.label)}
                      sx={{
                        borderRadius: 3,
                        py: 2.5,
                        bgcolor: selectedCategory === category.label
                          ? category.color
                          : alpha(theme.palette.background.paper, 0.7),
                        color: selectedCategory === category.label
                          ? '#fff'
                          : 'text.primary',
                        '&:hover': {
                          bgcolor: selectedCategory === category.label
                            ? category.color
                            : alpha(theme.palette.background.paper, 0.9),
                          opacity: 0.9,
                        },
                        transition: 'all 0.2s',
                        boxShadow: selectedCategory === category.label
                          ? '0 4px 12px rgba(0, 0, 0, 0.1)'
                          : 'none',
                      }}
                    />
                  ))}
                </Box>
              </Box>

              <Box>
                <Typography variant="subtitle1" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <SortIcon fontSize="small" color="primary" />
                  Filtra per stato
                </Typography>
                <ToggleButtonGroup
                  value={statusFilter}
                  exclusive
                  onChange={(e, newValue) => newValue && setStatusFilter(newValue)}
                  sx={{ 
                    '& .MuiToggleButton-root': {
                      borderRadius: 3,
                      py: 1,
                      px: 3,
                      mx: 0.5,
                      textTransform: 'none',
                      fontWeight: 500,
                      fontSize: '0.9rem',
                      '&.Mui-selected': {
                        backgroundColor: theme.palette.primary.main,
                        color: '#fff',
                        '&:hover': {
                          backgroundColor: theme.palette.primary.dark,
                        }
                      },
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                      }
                    }
                  }}
                >
                  <ToggleButton value="all">Tutte</ToggleButton>
                  <ToggleButton value="checked">Completate</ToggleButton>
                  <ToggleButton value="unchecked">Da completare</ToggleButton>
                </ToggleButtonGroup>
              </Box>
            </Paper>
          </Box>
        </Zoom>

        {error ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography color="error" sx={{ mb: 2 }}>
              {error}
            </Typography>
            <Button 
              variant="contained" 
              onClick={() => window.location.reload()}
              sx={{
                borderRadius: 3,
                textTransform: 'none',
                background: theme.palette.error.main,
                '&:hover': {
                  background: theme.palette.error.dark,
                }
              }}
            >
              Riprova
            </Button>
          </Box>
        ) : filteredIdeas.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Paper
              sx={{
                p: 4,
                borderRadius: 4,
                bgcolor: alpha(theme.palette.background.paper, 0.6),
                maxWidth: 600,
                mx: 'auto',
                backdropFilter: 'blur(10px)',
              }}
            >
              <Typography variant="h6" sx={{ mb: 2 }}>
                Nessuna idea trovata
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 3 }}>
                {searchQuery || selectedCategory !== 'Tutte' || statusFilter !== 'all'
                  ? 'Prova a modificare i filtri di ricerca'
                  : 'Crea la tua prima idea cliccando sul pulsante "Nuova Idea"'}
              </Typography>
              {!searchQuery && selectedCategory === 'Tutte' && statusFilter === 'all' && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setCreateDialogOpen(true)}
                  sx={{
                    borderRadius: 3,
                    textTransform: 'none',
                    px: 3,
                    py: 1.2,
                    background: theme.palette.mode === 'dark'
                      ? 'linear-gradient(90deg, rgba(126,105,171,0.8) 0%, rgba(154,135,245,0.8) 100%)'
                      : 'linear-gradient(90deg, rgba(126,105,171,1) 0%, rgba(154,135,245,1) 100%)',
                    boxShadow: '0 4px 15px rgba(126,105,171,0.2)',
                    '&:hover': {
                      boxShadow: '0 6px 20px rgba(126,105,171,0.3)',
                    },
                  }}
                >
                  Nuova Idea
                </Button>
              )}
            </Paper>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {filteredIdeas.map((idea) => (
              <Grid item xs={12} sm={6} key={idea.id}>
                <Card
                  sx={{
                    bgcolor: alpha(theme.palette.background.paper, 0.8),
                    borderRadius: 4,
                    height: '100%',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    overflow: 'hidden',
                    position: 'relative',
                    backdropFilter: 'blur(8px)',
                    boxShadow: theme.palette.mode === 'dark'
                      ? '0 4px 20px rgba(0, 0, 0, 0.15)'
                      : '0 4px 20px rgba(0, 0, 0, 0.05)',
                    border: '1px solid',
                    borderColor: alpha(theme.palette.divider, 0.1),
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: theme.palette.mode === 'dark'
                        ? '0 8px 30px rgba(0, 0, 0, 0.25)'
                        : '0 8px 30px rgba(0, 0, 0, 0.1)',
                      '& .card-actions': {
                        opacity: 1,
                        transform: 'translateY(0)',
                      }
                    },
                  }}
                  onClick={() => setSelectedIdea(idea)}
                >
                  {idea.checked && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        backgroundColor: theme.palette.success.main,
                        color: '#fff',
                        px: 2,
                        py: 0.5,
                        borderBottomLeftRadius: 12,
                        fontWeight: 500,
                        fontSize: '0.75rem',
                        zIndex: 1,
                      }}
                    >
                      Completata
                    </Box>
                  )}
                  <CardContent sx={{ pb: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          fontWeight: 600,
                          color: idea.checked ? theme.palette.success.main : 'text.primary',
                        }}
                      >
                        {idea.title}
                      </Typography>
                      <Tooltip title={idea.checked ? "Segna come non completata" : "Segna come completata"}>
                        <IconButton
                          size="small"
                          onClick={(e) => handleCheckIdea(idea.id, !idea.checked, e)}
                          sx={{
                            color: idea.checked ? theme.palette.success.main : 'text.secondary',
                            transition: 'all 0.2s',
                            '&:hover': {
                              color: idea.checked ? theme.palette.success.dark : theme.palette.primary.main,
                              transform: 'scale(1.1)',
                            }
                          }}
                        >
                          {idea.checked ? <CheckCircleIcon /> : <CheckCircleOutlineIcon />}
                        </IconButton>
                      </Tooltip>
                    </Box>
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      paragraph
                      sx={{
                        opacity: idea.checked ? 0.7 : 1,
                        textDecoration: idea.checked ? 'line-through' : 'none',
                        fontStyle: idea.checked ? 'italic' : 'normal',
                      }}
                    >
                      {idea.description.length > 120
                        ? `${idea.description.substring(0, 120)}...`
                        : idea.description}
                    </Typography>
                    <Chip 
                      label={idea.category} 
                      size="small" 
                      sx={{ 
                        mb: 2,
                        borderRadius: 3,
                        backgroundColor: getCategoryColor(idea.category),
                        color: '#fff',
                      }}
                    />
                    
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                        {idea.checked ? 'Completata' : 'Da completare'}
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={idea.checked ? 100 : 0}
                        sx={{
                          height: 6,
                          borderRadius: 3,
                          bgcolor: alpha(theme.palette.background.default, 0.5),
                          '& .MuiLinearProgress-bar': {
                            bgcolor: idea.checked ? theme.palette.success.main : theme.palette.primary.main,
                            borderRadius: 3,
                          },
                        }}
                      />
                    </Box>
                    
                    {idea.checked && idea.date_checked && (
                      <Typography variant="caption" color="success.main" sx={{ mt: 1, display: 'block' }}>
                        Completata il: {new Date(idea.date_checked).toLocaleDateString()}
                      </Typography>
                    )}
                  </CardContent>
                  
                  <CardActions className="card-actions" sx={{ 
                    justifyContent: 'center',
                    p: 2,
                    opacity: 0,
                    transform: 'translateY(10px)',
                    transition: 'all 0.3s',
                  }}>
                    <Button
                      variant="contained"
                      size="small"
                      sx={{
                        borderRadius: 3,
                        textTransform: 'none',
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedIdea(idea);
                      }}
                    >
                      Visualizza Dettagli
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>

      <CreateIdeaDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        coupleId={1} // TODO: Get from user context
        onIdeaCreated={handleCreateIdea}
      />

      {selectedIdea && (
        <IdeaDetail
          open={!!selectedIdea}
          onClose={() => setSelectedIdea(null)}
          idea={selectedIdea}
          onIdeaUpdate={handleUpdateIdea}
          onIdeaDelete={handleDeleteIdea}
        />
      )}
    </Box>
  );
};

// Utility function to get category color
const getCategoryColor = (category: string): string => {
  const categoryMap: Record<string, string> = {
    'Viaggio': '#ed6c02',
    'Ristorante': '#2e7d32',
    'Attività': '#9c27b0',
    'Challenge': '#d32f2f',
  };
  
  return categoryMap[category] || '#3f51b5';
};

export default Ideas;
