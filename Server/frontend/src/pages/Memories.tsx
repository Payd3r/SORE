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
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { Memory } from '../types/api';
import * as api from '../services/api';
import CreateMemoryDialog from '../components/CreateMemoryDialog';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

const Memories: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [memories, setMemories] = useState<Memory[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('Tutti');
  const [dateFilter, setDateFilter] = useState<'all' | 'recent' | 'old'>('all');

  const types = [
    { label: 'Tutti', color: '#1976d2' },
    { label: 'Viaggio', color: '#ed6c02' },
    { label: 'Evento', color: '#2e7d32' },
    { label: 'Semplice', color: '#9c27b0' },
  ];

  useEffect(() => {
    if (!user?.coupleId) {
      setError('Non sei associato a nessuna coppia');
      return;
    }
    loadMemories();
  }, [user?.coupleId]);

  const loadMemories = async () => {
    if (!user?.coupleId) return;
    
    try {
      const response = await api.getMemories(user.coupleId);
      console.log('Ricordi caricati:', response);
      setMemories(response);
      setError(null);
    } catch (err) {
      console.error('Error loading memories:', err);
      setError('Impossibile caricare i ricordi. Riprova.');
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
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ mb: 1 }}>
          I vostri Ricordi
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Conserva i momenti speciali insieme
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
            placeholder="Cerca ricordi per titolo, descrizione, tipo, posizione o canzone..."
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
          Nuovo Ricordo
        </Button>
      </Box>

      <Box sx={{ mb: 4 }}>
        <Typography variant="subtitle1" sx={{ mb: 2 }}>
          Filtra per tipo
        </Typography>
        <Box
          sx={{
            display: 'flex',
            gap: 1,
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
                borderRadius: 2,
                bgcolor: selectedType === type.label
                  ? type.color
                  : 'background.paper',
                color: selectedType === type.label
                  ? '#fff'
                  : 'text.primary',
                '&:hover': {
                  bgcolor: type.color,
                  opacity: 0.9,
                },
              }}
            />
          ))}
        </Box>

        <Typography variant="subtitle1" sx={{ mb: 2 }}>
          Filtra per data
        </Typography>
        <ToggleButtonGroup
          value={dateFilter}
          exclusive
          onChange={(e, newValue) => newValue && setDateFilter(newValue)}
          sx={{ mb: 3 }}
        >
          <ToggleButton value="all">Tutti</ToggleButton>
          <ToggleButton value="recent">Ultimi 6 mesi</ToggleButton>
          <ToggleButton value="old">Più vecchi</ToggleButton>
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
      ) : filteredMemories.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Nessun ricordo trovato
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
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
                borderRadius: 2,
                textTransform: 'none',
              }}
            >
              Nuovo Ricordo
            </Button>
          )}
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredMemories.map((memory) => (
            <Grid item xs={12} sm={6} md={4} key={memory.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'scale(1.02)',
                  },
                }}
                onClick={() => navigate(`/ricordi/${memory.id}`)}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h6" component="div" sx={{ flex: 1, mr: 2 }}>
                      {memory.title}
                    </Typography>
                    <Chip
                      label={memory.type === 'viaggio' ? 'Viaggio' : memory.type === 'evento' ? 'Evento' : 'Ricordo semplice'}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {memory.description.length > 150
                      ? `${memory.description.substring(0, 150)}...`
                      : memory.description}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(memory.date).toLocaleDateString('it-IT')}
                  </Typography>
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
