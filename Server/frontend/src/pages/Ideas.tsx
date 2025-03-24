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
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { Idea } from '../types/api';
import * as api from '../services/api';
import CreateIdeaDialog from '../components/CreateIdeaDialog';
import IdeaDetail from '../components/IdeaDetail';
import { toast } from 'react-hot-toast';

const Ideas: React.FC = () => {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tutte');
  const [statusFilter, setStatusFilter] = useState<'all' | 'checked' | 'unchecked'>('all');

  const categories = [
    { label: 'Tutte', color: '#1976d2' },
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
    } catch (err) {
      setError('Failed to create idea. Please try again.');
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
    } catch (err) {
      setError('Failed to delete idea. Please try again.');
    }
  };

  const handleCheckIdea = async (ideaId: number, checked: boolean) => {
    try {
      await api.checkIdea(ideaId, checked);
      setIdeas(prevIdeas => 
        prevIdeas.map(idea => 
          idea.id === ideaId 
            ? { ...idea, checked, date_checked: checked ? new Date().toISOString() : null }
            : idea
        )
      );
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

    // Filtro per categoria (case-insensitive)
    const matchesCategory = 
      selectedCategory === 'Tutte' || 
      idea.category.toLowerCase() === selectedCategory.toLowerCase();
    console.log('Filtro categoria:', {
      selectedCategory,
      ideaCategory: idea.category,
      matches: matchesCategory
    });

    // Filtro per stato (checked/unchecked)
    const matchesStatus = 
      statusFilter === 'all' ||
      (statusFilter === 'checked' && idea.checked) ||
      (statusFilter === 'unchecked' && !idea.checked);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  console.log('Idee filtrate:', filteredIdeas);

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ mb: 1 }}>
          Le vostre Idee
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Pianifica nuove avventure insieme
        </Typography>
      </Box>

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          mb: 4,
          flexWrap: 'wrap',
        }}
      >
        <Box sx={{ flex: 1, minWidth: 200 }}>
          <TextField
            fullWidth
            placeholder="Cerca idee per titolo, descrizione o categoria..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{
              bgcolor: 'background.paper',
              borderRadius: 2,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              },
            }}
          />
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateDialogOpen(true)}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
          }}
        >
          Nuova Idea
        </Button>
      </Box>

      <Box sx={{ mb: 4 }}>
        <Typography variant="subtitle1" sx={{ mb: 2 }}>
          Filtra per categoria
        </Typography>
        <Box
          sx={{
            display: 'flex',
            gap: 1,
            flexWrap: 'wrap',
            mb: 3,
          }}
        >
          {categories.map((category) => (
            <Chip
              key={category.label}
              label={category.label}
              onClick={() => setSelectedCategory(category.label)}
              sx={{
                borderRadius: 2,
                bgcolor: selectedCategory === category.label
                  ? category.color
                  : 'background.paper',
                color: selectedCategory === category.label
                  ? '#fff'
                  : 'text.primary',
                '&:hover': {
                  bgcolor: category.color,
                  opacity: 0.9,
                },
              }}
            />
          ))}
        </Box>

        <Typography variant="subtitle1" sx={{ mb: 2 }}>
          Filtra per stato
        </Typography>
        <ToggleButtonGroup
          value={statusFilter}
          exclusive
          onChange={(e, newValue) => newValue && setStatusFilter(newValue)}
          sx={{ mb: 3 }}
        >
          <ToggleButton value="all">Tutte</ToggleButton>
          <ToggleButton value="checked">Completate</ToggleButton>
          <ToggleButton value="unchecked">Da completare</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {error ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => window.location.reload()}
          >
            Riprova
          </Button>
        </Box>
      ) : filteredIdeas.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
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
                borderRadius: 2,
                textTransform: 'none',
              }}
            >
              Nuova Idea
            </Button>
          )}
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredIdeas.map((idea) => (
            <Grid item xs={12} sm={6} key={idea.id}>
              <Card
                sx={{
                  bgcolor: 'background.paper',
                  borderRadius: 3,
                  height: '100%',
                  cursor: 'pointer',
                  '&:hover': {
                    boxShadow: 6,
                  },
                }}
                onClick={() => setSelectedIdea(idea)}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">{idea.title}</Typography>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCheckIdea(idea.id, !idea.checked);
                      }}
                      color={idea.checked ? "success" : "default"}
                    >
                      {idea.checked ? <CheckCircleIcon /> : <CheckCircleOutlineIcon />}
                    </IconButton>
                  </Box>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {idea.description}
                  </Typography>
                  <Chip 
                    label={idea.category} 
                    size="small" 
                    sx={{ mb: 1 }}
                  />
                  <LinearProgress
                    variant="determinate"
                    value={idea.checked ? 100 : 0}
                    sx={{
                      height: 6,
                      borderRadius: 3,
                      bgcolor: 'background.default',
                      '& .MuiLinearProgress-bar': {
                        bgcolor: idea.checked ? '#69f0ae' : 'primary.main',
                      },
                    }}
                  />
                  {idea.checked && idea.date_checked && (
                    <Typography variant="caption" color="success.main" sx={{ mt: 1, display: 'block' }}>
                      Completata il: {new Date(idea.date_checked).toLocaleDateString()}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

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

export default Ideas;
