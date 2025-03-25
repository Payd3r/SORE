
import React, { useState, useEffect } from 'react';
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
  MenuItem,
  Menu,
  Checkbox,
  FormControlLabel,
  CircularProgress,
  Tooltip,
  Paper,
  Tabs,
  Tab,
  Divider,
  Avatar,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import FilterListIcon from '@mui/icons-material/FilterList';
import SortIcon from '@mui/icons-material/Sort';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { Idea } from '../types/api';
import * as api from '../services/api';
import CreateIdeaDialog from '../components/CreateIdeaDialog';
import IdeaDetail from '../components/IdeaDetail';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { useTheme } from '@mui/material/styles';
import { alpha } from '@mui/system';
import { useNavigate } from 'react-router-dom';

const Ideas: React.FC = () => {
  const { user } = useAuth();
  const theme = useTheme();
  const navigate = useNavigate();
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showCompleted, setShowCompleted] = useState(true);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [sortBy, setSortBy] = useState<'date' | 'title'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  useEffect(() => {
    if (!user?.coupleId) {
      setError('Non sei associato a nessuna coppia');
      setLoading(false);
      return;
    }
    
    loadIdeas();
  }, [user?.coupleId]);

  const loadIdeas = async () => {
    if (!user?.coupleId) return;
    
    try {
      setLoading(true);
      const response = await api.getIdeas(user.coupleId);
      setIdeas(response);
      setError(null);
    } catch (err) {
      console.error('Error loading ideas:', err);
      setError('Impossibile caricare le idee. Riprova.');
      toast.error('Impossibile caricare le idee');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateIdea = (newIdea: Idea) => {
    setIdeas([newIdea, ...ideas]);
    setCreateDialogOpen(false);
    toast.success('Idea creata con successo!');
  };

  const handleUpdateIdea = (updatedIdea: Idea) => {
    setIdeas(prevIdeas => 
      prevIdeas.map(idea => 
        idea.id === updatedIdea.id ? updatedIdea : idea
      )
    );
    setDetailDialogOpen(false);
    setSelectedIdea(null);
    toast.success('Idea aggiornata con successo!');
  };

  const handleDeleteIdea = async (ideaId: number) => {
    if (!user?.coupleId) return;
    
    try {
      await api.deleteIdea(ideaId);
      setIdeas(ideas.filter(idea => idea.id !== ideaId));
      setDetailDialogOpen(false);
      setSelectedIdea(null);
      toast.success('Idea eliminata con successo!');
    } catch (err) {
      console.error('Error deleting idea:', err);
      toast.error('Impossibile eliminare l\'idea');
    }
  };

  const handleOpenDetail = (idea: Idea) => {
    // For detail page navigation
    navigate(`/idee/${idea.id}`);
  };

  const handleOpenSortMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseSortMenu = () => {
    setAnchorEl(null);
  };

  const applySorting = (ideas: Idea[]) => {
    return [...ideas].sort((a, b) => {
      if (sortBy === 'date') {
        const dateA = new Date(a.due_date).getTime();
        const dateB = new Date(b.due_date).getTime();
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      } else {
        return sortOrder === 'asc'
          ? a.title.localeCompare(b.title)
          : b.title.localeCompare(a.title);
      }
    });
  };

  const categoryColorMap: Record<string, string> = {
    viaggio: theme.palette.primary.main,
    ristorante: theme.palette.error.main,
    attività: theme.palette.success.main,
    challenge: theme.palette.secondary.main,
  };

  const filteredIdeas = ideas.filter(idea => {
    // Filter by search query
    const matchesSearch = 
      idea.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      idea.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filter by completion status
    const matchesCompletion = showCompleted || !idea.checked;
    
    // Filter by category
    const matchesCategory = selectedCategory === 'all' || idea.category === selectedCategory;
    
    // Filter by tab (completed vs uncompleted)
    const matchesTab = 
      (tabValue === 0) ||
      (tabValue === 1 && !idea.checked) ||
      (tabValue === 2 && idea.checked);
    
    return matchesSearch && matchesCompletion && matchesCategory && matchesTab;
  });

  const sortedIdeas = applySorting(filteredIdeas);

  const getCategoryCount = (category: string) => {
    return ideas.filter(idea => idea.category === category).length;
  };

  const allCategories = [
    { value: 'all', label: 'Tutte' },
    { value: 'viaggio', label: 'Viaggi', color: categoryColorMap.viaggio },
    { value: 'ristorante', label: 'Ristoranti', color: categoryColorMap.ristorante },
    { value: 'attività', label: 'Attività', color: categoryColorMap.attività },
    { value: 'challenge', label: 'Challenge', color: categoryColorMap.challenge },
  ];

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" fontWeight="bold" sx={{ mb: 1 }}>
          Le vostre Idee
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Gestisci le attività da fare insieme e tieni traccia dei vostri obiettivi
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
              placeholder="Cerca tra le tue idee..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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

          <Box sx={{ display: 'flex', gap: 2, width: { xs: '100%', md: 'auto' } }}>
            <Tooltip title="Ordina">
              <Button
                variant="outlined"
                color="inherit"
                onClick={handleOpenSortMenu}
                startIcon={<SortIcon />}
                sx={{
                  borderRadius: 3,
                  borderColor: alpha(theme.palette.text.primary, 0.2),
                  textTransform: 'none',
                }}
              >
                Ordina
              </Button>
            </Tooltip>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setCreateDialogOpen(true)}
              sx={{
                borderRadius: 3,
                textTransform: 'none',
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
              Nuova Idea
            </Button>
          </Box>
        </Box>
      </Paper>

      <Box sx={{ mb: 4 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{
            '.MuiTabs-indicator': {
              height: 3,
              borderRadius: 1.5,
            },
            '.MuiTab-root': {
              textTransform: 'none',
              fontWeight: 500,
              borderRadius: 2,
              '&.Mui-selected': {
                fontWeight: 600,
              },
            },
          }}
        >
          <Tab label="Tutte" sx={{ textTransform: 'none' }} />
          <Tab label="Da fare" sx={{ textTransform: 'none' }} />
          <Tab label="Completate" sx={{ textTransform: 'none' }} />
        </Tabs>
      </Box>

      <Box sx={{ mb: 4 }}>
        <Box
          sx={{
            display: 'flex',
            gap: 1.5,
            flexWrap: 'wrap',
            mb: 1,
          }}
        >
          {allCategories.map((category) => (
            <Chip
              key={category.value}
              label={`${category.label}${category.value !== 'all' ? ` (${getCategoryCount(category.value)})` : ''}`}
              onClick={() => setSelectedCategory(category.value)}
              sx={{
                borderRadius: 3,
                py: 2,
                backgroundColor: selectedCategory === category.value
                  ? category.color || theme.palette.primary.main
                  : theme.palette.background.paper,
                color: selectedCategory === category.value
                  ? '#fff'
                  : 'text.primary',
                border: '1px solid',
                borderColor: category.color ? alpha(category.color, 0.3) : 'transparent',
                boxShadow: selectedCategory === category.value 
                  ? `0 4px 12px ${alpha(category.color || theme.palette.primary.main, 0.3)}`
                  : '0 2px 8px rgba(0, 0, 0, 0.05)',
                '&:hover': {
                  backgroundColor: selectedCategory === category.value
                    ? category.color || theme.palette.primary.main
                    : alpha(category.color || theme.palette.primary.main, 0.1),
                },
                transition: 'all 0.3s ease',
              }}
            />
          ))}
        </Box>
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
            onClick={loadIdeas}
            sx={{ borderRadius: 3, textTransform: 'none' }}
          >
            Riprova
          </Button>
        </Paper>
      ) : sortedIdeas.length === 0 ? (
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
            Nessuna idea trovata
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3, maxWidth: 500, mx: 'auto' }}>
            {searchQuery || selectedCategory !== 'all' || tabValue !== 0
              ? 'Prova a modificare i filtri di ricerca'
              : 'Inizia a creare idee per le attività da fare insieme!'}
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateDialogOpen(true)}
            sx={{
              borderRadius: 3,
              textTransform: 'none',
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
            Crea la prima idea
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {sortedIdeas.map((idea) => (
            <Grid item xs={12} sm={6} md={4} key={idea.id}>
              <Card
                elevation={0}
                className="card-hover"
                onClick={() => handleOpenDetail(idea)}
                sx={{
                  borderRadius: 3,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  overflow: 'visible',
                  cursor: 'pointer',
                  bgcolor: idea.checked
                    ? alpha(theme.palette.success.main, 0.05)
                    : theme.palette.background.paper,
                  border: '1px solid',
                  borderColor: idea.checked
                    ? alpha(theme.palette.success.main, 0.2)
                    : alpha(theme.palette.divider, 0.8),
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                  opacity: idea.checked ? 0.8 : 1,
                  '&:hover': {
                    boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
                    borderColor: idea.checked
                      ? alpha(theme.palette.success.main, 0.3)
                      : alpha(theme.palette.primary.main, 0.3),
                  }
                }}
              >
                {idea.checked && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: -10,
                      right: -10,
                      bgcolor: theme.palette.success.main,
                      color: 'white',
                      borderRadius: '50%',
                      width: 30,
                      height: 30,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '2px solid white',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      zIndex: 1,
                    }}
                  >
                    <CheckCircleIcon fontSize="small" />
                  </Box>
                )}
                <CardContent sx={{ flex: 1, p: 3 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      mb: 2,
                    }}
                  >
                    <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
                      {idea.title}
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ 
                      mb: 2,
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>
                      {idea.description}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Chip
                      label={idea.category}
                      size="small"
                      sx={{
                        borderRadius: 3,
                        bgcolor: alpha(categoryColorMap[idea.category as keyof typeof categoryColorMap] || theme.palette.primary.main, 0.1),
                        color: categoryColorMap[idea.category as keyof typeof categoryColorMap] || theme.palette.primary.main,
                        border: '1px solid',
                        borderColor: alpha(categoryColorMap[idea.category as keyof typeof categoryColorMap] || theme.palette.primary.main, 0.2),
                        fontWeight: 500,
                      }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {new Date(idea.due_date).toLocaleDateString('it-IT')}
                    </Typography>
                  </Box>
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar
                      src={undefined}
                      sx={{ width: 24, height: 24, bgcolor: theme.palette.primary.main, fontSize: '0.75rem' }}
                    >
                      {idea.created_by_name?.[0]}
                    </Avatar>
                    <Typography variant="caption" color="text.secondary">
                      {idea.created_by_name}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <CreateIdeaDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        coupleId={user?.coupleId || 0}
        onIdeaCreated={handleCreateIdea}
      />

      {selectedIdea && (
        <IdeaDetail
          open={detailDialogOpen}
          onClose={() => {
            setDetailDialogOpen(false);
            setSelectedIdea(null);
          }}
          idea={selectedIdea}
          onIdeaUpdate={handleUpdateIdea}
          onIdeaDelete={handleDeleteIdea}
        />
      )}

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseSortMenu}
      >
        <MenuItem 
          onClick={() => {
            setSortBy('date');
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
            handleCloseSortMenu();
          }}
          sx={{ minWidth: 180 }}
        >
          Data {sortBy === 'date' && (sortOrder === 'asc' ? '(crescente)' : '(decrescente)')}
        </MenuItem>
        <MenuItem 
          onClick={() => {
            setSortBy('title');
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
            handleCloseSortMenu();
          }}
        >
          Titolo {sortBy === 'title' && (sortOrder === 'asc' ? '(A-Z)' : '(Z-A)')}
        </MenuItem>
        <MenuItem>
          <FormControlLabel
            control={
              <Checkbox
                checked={showCompleted}
                onChange={(e) => setShowCompleted(e.target.checked)}
              />
            }
            label="Mostra completate"
          />
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default Ideas;
