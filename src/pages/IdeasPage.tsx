import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Lightbulb, 
  Calendar, 
  Check, 
  X,
  Plane,
  UtensilsCrossed,
  Sparkles,
  Trophy,
  UserCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { Idea, IdeaType } from '@/types';
import { format } from 'date-fns';
import { useAuth } from '@/context/auth-context';
import IdeaModal from '@/components/modals/IdeaModal';
import FiltersModal from '@/components/modals/FiltersModal';

let mockIdeas: Idea[] = [
  {
    id: '1',
    type: 'travel',
    title: 'Weekend a Venezia',
    description: 'Passare un weekend romantico a Venezia, visitando i canali e gustando la cucina locale.',
    createdAt: new Date('2023-05-15'),
    completed: false,
    userId: '1',
    creatorName: 'John Doe',
    coupleId: 'couple1'
  },
  {
    id: '2',
    type: 'restaurant',
    title: 'Cena al ristorante stellato',
    description: 'Andare a cena al nuovo ristorante stellato Michelin che ha aperto in centro.',
    createdAt: new Date('2023-06-20'),
    completed: true,
    completedAt: new Date('2023-07-15'),
    completedById: '2',
    completedByName: 'Jane Smith',
    userId: '2',
    creatorName: 'Jane Smith',
    coupleId: 'couple1'
  },
  {
    id: '3',
    type: 'general',
    title: 'Corso di fotografia insieme',
    description: 'Iscriverci a un corso di fotografia per imparare a catturare meglio i nostri momenti.',
    createdAt: new Date('2023-04-10'),
    completed: false,
    userId: '1',
    creatorName: 'John Doe',
    coupleId: 'couple1'
  },
  {
    id: '4',
    type: 'challenge',
    title: '30 giorni di nuove ricette',
    description: 'Provare una nuova ricetta ogni giorno per un mese, alternandoci in cucina.',
    createdAt: new Date('2023-03-05'),
    completed: false,
    userId: '2',
    creatorName: 'Jane Smith',
    coupleId: 'couple1'
  },
  {
    id: '5',
    type: 'travel',
    title: 'Viaggio in Giappone',
    description: 'Pianificare un viaggio in Giappone durante la stagione dei ciliegi in fiore.',
    createdAt: new Date('2023-02-18'),
    completed: false,
    userId: '1',
    creatorName: 'John Doe',
    coupleId: 'couple1'
  },
  {
    id: '6',
    type: 'restaurant',
    title: 'Pizza Napoletana autentica',
    description: 'Trovare la migliore pizzeria napoletana in città e provarla insieme.',
    createdAt: new Date('2023-01-25'),
    completed: true,
    completedAt: new Date('2023-02-10'),
    completedById: '1',
    completedByName: 'John Doe',
    userId: '2',
    creatorName: 'Jane Smith',
    coupleId: 'couple1'
  },
  {
    id: '7',
    type: 'general',
    title: 'Maratona film classici',
    description: 'Guardare insieme 10 film classici che non abbiamo mai visto.',
    createdAt: new Date('2023-07-03'),
    completed: false,
    userId: '1',
    creatorName: 'John Doe',
    coupleId: 'couple1'
  },
  {
    id: '8',
    type: 'challenge',
    title: 'Escursione in montagna',
    description: 'Fare un\'escursione in montagna e raggiungere la vetta.',
    createdAt: new Date('2023-08-12'),
    completed: true,
    completedAt: new Date('2023-08-20'),
    completedById: '2',
    completedByName: 'Jane Smith',
    userId: '1',
    creatorName: 'John Doe',
    coupleId: 'couple1'
  }
];

const initializeIdeas = () => {
  const storedIdeas = localStorage.getItem('ideas');
  if (!storedIdeas) {
    localStorage.setItem('ideas', JSON.stringify(mockIdeas));
  } else {
    mockIdeas = JSON.parse(storedIdeas);
  }
};

const IdeasPage: React.FC = () => {
  const { user, couple } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'completed' | 'pending'>('all');
  const [selectedType, setSelectedType] = useState<IdeaType | 'all'>('all');
  const [selectedCreator, setSelectedCreator] = useState<string | 'all'>('all');
  const [localIdeas, setLocalIdeas] = useState<Idea[]>([]);
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'view' | 'edit'>('create');
  
  useEffect(() => {
    initializeIdeas();
    loadIdeas();
  }, []);
  
  const loadIdeas = () => {
    const storedIdeas = localStorage.getItem('ideas');
    if (storedIdeas) {
      setLocalIdeas(JSON.parse(storedIdeas));
    } else {
      setLocalIdeas(mockIdeas);
    }
  };
  
  const saveIdeas = (ideas: Idea[]) => {
    localStorage.setItem('ideas', JSON.stringify(ideas));
    setLocalIdeas(ideas);
  };

  const filteredIdeas = localIdeas.filter(idea => {
    const matchesSearch = idea.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         idea.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = selectedStatus === 'all' || 
                         (selectedStatus === 'completed' && idea.completed) ||
                         (selectedStatus === 'pending' && !idea.completed);
    
    const matchesType = selectedType === 'all' || idea.type === selectedType;
    
    const matchesCreator = selectedCreator === 'all' || idea.userId === selectedCreator;
    
    return matchesSearch && matchesStatus && matchesType && matchesCreator;
  });

  const openCreateModal = () => {
    setSelectedIdea(null);
    setModalMode('create');
    setModalOpen(true);
  };
  
  const openViewModal = (idea: Idea) => {
    setSelectedIdea(idea);
    setModalMode('view');
    setModalOpen(true);
  };
  
  const handleSaveIdea = (ideaData: Partial<Idea>) => {
    if (modalMode === 'create') {
      const newIdea: Idea = {
        id: Math.random().toString(36).substring(2, 9),
        title: ideaData.title || '',
        description: ideaData.description || '',
        type: ideaData.type || 'general',
        completed: false,
        createdAt: new Date(),
        userId: user?.id || '',
        creatorName: user?.name || '',
        coupleId: couple?.id || '',
      };
      
      const updatedIdeas = [...localIdeas, newIdea];
      saveIdeas(updatedIdeas);
      console.log('Idea created:', newIdea);
      toast.success('Idea creata con successo!');
    } else if (modalMode === 'edit' && selectedIdea) {
      const updatedIdeas = localIdeas.map(idea => {
        if (idea.id === selectedIdea.id) {
          const updatedIdea = { ...idea, ...ideaData };
          console.log('Idea updated:', updatedIdea);
          return updatedIdea;
        }
        return idea;
      });
      
      saveIdeas(updatedIdeas);
      toast.success('Idea aggiornata con successo!');
    }
    
    setModalOpen(false);
  };
  
  const handleDeleteIdea = () => {
    if (selectedIdea) {
      const updatedIdeas = localIdeas.filter(idea => idea.id !== selectedIdea.id);
      saveIdeas(updatedIdeas);
      console.log('Idea deleted:', selectedIdea);
      toast.success('Idea eliminata con successo!');
      setModalOpen(false);
    }
  };
  
  const handleToggleComplete = (completed: boolean) => {
    if (selectedIdea && user) {
      const updatedIdeas = localIdeas.map(idea => {
        if (idea.id === selectedIdea.id) {
          const updatedIdea = { 
            ...idea, 
            completed, 
            completedAt: completed ? new Date() : undefined,
            completedById: completed ? user.id : undefined,
            completedByName: completed ? user.name : undefined
          };
          return updatedIdea;
        }
        return idea;
      });
      
      saveIdeas(updatedIdeas);
      console.log('Idea completion toggled:', selectedIdea.id, completed);
      toast.success(completed ? 'Idea completata!' : 'Completamento rimosso.');
    }
  };

  const handleQuickToggle = (e: React.MouseEvent, id: string, currentStatus: boolean) => {
    e.preventDefault();
    e.stopPropagation();
    
    const ideaToUpdate = localIdeas.find(idea => idea.id === id);
    if (!ideaToUpdate) return;
    
    const updatedIdeas = localIdeas.map(idea => {
      if (idea.id === id) {
        const updatedIdea = { 
          ...idea, 
          completed: !currentStatus,
          completedAt: !currentStatus ? new Date() : undefined,
          completedById: !currentStatus ? user?.id : undefined,
          completedByName: !currentStatus ? user?.name : undefined
        };
        return updatedIdea;
      }
      return idea;
    });
    
    saveIdeas(updatedIdeas);
    console.log('Idea quick completion toggled:', id, !currentStatus);
    toast.success(!currentStatus ? 'Idea completata!' : 'Completamento rimosso.');
  };

  const handleQuickDelete = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    const updatedIdeas = localIdeas.filter(idea => idea.id !== id);
    saveIdeas(updatedIdeas);
    console.log('Idea quick deleted:', id);
    toast.success('Idea eliminata.');
  };

  const typeStyles: Record<IdeaType, { color: string, bgColor: string, icon: React.ReactNode }> = {
    'travel': { 
      color: 'text-blue-600 dark:text-blue-400', 
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      icon: <Plane className="h-5 w-5" /> 
    },
    'restaurant': { 
      color: 'text-orange-600 dark:text-orange-400', 
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      icon: <UtensilsCrossed className="h-5 w-5" /> 
    },
    'general': { 
      color: 'text-purple-600 dark:text-purple-400', 
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      icon: <Sparkles className="h-5 w-5" /> 
    },
    'challenge': { 
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      icon: <Trophy className="h-5 w-5" /> 
    }
  };

  const creators = localIdeas.reduce((acc: { id: string, name: string }[], idea) => {
    if (!acc.some(creator => creator.id === idea.userId)) {
      acc.push({ id: idea.userId, name: idea.creatorName });
    }
    return acc;
  }, []);

  const typeOptions = [
    { value: 'travel', label: 'Viaggi' },
    { value: 'restaurant', label: 'Ristoranti' },
    { value: 'general', label: 'Generiche' },
    { value: 'challenge', label: 'Sfide' }
  ];

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedStatus('all');
    setSelectedType('all');
    setSelectedCreator('all');
  };

  return (
    <div className="container mx-auto px-4 py-6 animate-fade-in">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-4xl font-bold">Le Vostre Idee</h1>
          <p className="text-muted-foreground mt-1">
            Pianificate nuove avventure insieme
          </p>
        </div>
        <Button onClick={openCreateModal} className="flex items-center">
          <Plus className="mr-2 h-4 w-4" />
          Nuova Idea
        </Button>
      </div>

      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Cerca idee..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2">
            <div className="hidden sm:flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center">
                    <Filter className="mr-2 h-4 w-4" />
                    Stato
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setSelectedStatus('all')}>
                    Tutte
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSelectedStatus('pending')}>
                    Da completare
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSelectedStatus('completed')}>
                    Completate
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              {creators.length > 1 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="flex items-center">
                      <UserCheck className="mr-2 h-4 w-4" />
                      Creatore
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setSelectedCreator('all')}>
                      Tutti
                    </DropdownMenuItem>
                    {creators.map(creator => (
                      <DropdownMenuItem 
                        key={creator.id} 
                        onClick={() => setSelectedCreator(creator.id)}
                      >
                        {creator.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
            
            <div className="block sm:hidden">
              <FiltersModal 
                title="Filtra Idee"
                description="Seleziona i filtri per le tue idee"
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                selectedStatus={selectedStatus}
                onStatusChange={setSelectedStatus}
                selectedType={selectedType}
                onTypeChange={(value) => setSelectedType(value as IdeaType | 'all')}
                selectedCreator={selectedCreator}
                onCreatorChange={setSelectedCreator}
                creators={creators}
                onResetFilters={resetFilters}
                typeOptions={typeOptions}
              />
            </div>
          </div>
        </div>
        
        {(selectedType !== 'all' || selectedStatus !== 'all' || selectedCreator !== 'all') && (
          <div className="flex items-center flex-wrap gap-2">
            <span className="text-sm text-muted-foreground">Filtri attivi:</span>
            {selectedType !== 'all' && (
              <Badge 
                variant="secondary" 
                className="cursor-pointer"
                onClick={() => setSelectedType('all')}
              >
                {selectedType === 'travel' ? 'Viaggi' : 
                 selectedType === 'restaurant' ? 'Ristoranti' : 
                 selectedType === 'general' ? 'Generiche' : 'Sfide'}
                <span className="ml-1">×</span>
              </Badge>
            )}
            
            {selectedStatus !== 'all' && (
              <Badge 
                variant="secondary" 
                className="cursor-pointer"
                onClick={() => setSelectedStatus('all')}
              >
                {selectedStatus === 'completed' ? 'Completate' : 'Da completare'}
                <span className="ml-1">×</span>
              </Badge>
            )}
            
            {selectedCreator !== 'all' && (
              <Badge 
                variant="secondary" 
                className="cursor-pointer"
                onClick={() => setSelectedCreator('all')}
              >
                {creators.find(c => c.id === selectedCreator)?.name || 'Creatore'}
                <span className="ml-1">×</span>
              </Badge>
            )}
          </div>
        )}
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="w-full justify-start mb-6 overflow-x-auto flex-nowrap">
          <TabsTrigger value="all" onClick={() => setSelectedType('all')}>Tutte</TabsTrigger>
          <TabsTrigger value="travel" onClick={() => setSelectedType('travel')}>Viaggi</TabsTrigger>
          <TabsTrigger value="restaurant" onClick={() => setSelectedType('restaurant')}>Ristoranti</TabsTrigger>
          <TabsTrigger value="general" onClick={() => setSelectedType('general')}>Generiche</TabsTrigger>
          <TabsTrigger value="challenge" onClick={() => setSelectedType('challenge')}>Sfide</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="animate-in">
          {renderIdeasGrid(filteredIdeas)}
        </TabsContent>
        
        <TabsContent value="travel" className="animate-in">
          {renderIdeasGrid(filteredIdeas)}
        </TabsContent>
        
        <TabsContent value="restaurant" className="animate-in">
          {renderIdeasGrid(filteredIdeas)}
        </TabsContent>
        
        <TabsContent value="general" className="animate-in">
          {renderIdeasGrid(filteredIdeas)}
        </TabsContent>
        
        <TabsContent value="challenge" className="animate-in">
          {renderIdeasGrid(filteredIdeas)}
        </TabsContent>
      </Tabs>
      
      <IdeaModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSave={handleSaveIdea}
        onDelete={handleDeleteIdea}
        onComplete={handleToggleComplete}
        idea={selectedIdea || undefined}
        mode={modalMode}
      />
    </div>
  );

  function renderIdeasGrid(ideas: Idea[]) {
    if (ideas.length === 0) {
      return (
        <div className="text-center py-20">
          <Lightbulb className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-xl font-medium mb-2">Nessuna idea trovata</h3>
          <p className="text-muted-foreground mb-6">
            {searchTerm || selectedType !== 'all' || selectedStatus !== 'all' || selectedCreator !== 'all'
              ? 'Prova a modificare i filtri o a cercare altro.' 
              : 'Inizia ad aggiungere idee per attività da fare insieme.'}
          </p>
          <Button onClick={openCreateModal}>
            <Plus className="mr-2 h-4 w-4" />
            Aggiungi la tua prima idea
          </Button>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 staggered-animate">
        {ideas.map((idea) => (
          <div key={idea.id} className="transition-all" onClick={() => openViewModal(idea)}>
            <Card 
              className={`h-full card-hover idea-card-${idea.type} backdrop-blur-sm bg-white/40 dark:bg-black/40 border-none shadow-lg ${idea.completed ? 'bg-muted/30' : ''}`}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <Badge className={`${typeStyles[idea.type].bgColor} ${typeStyles[idea.type].color}`}>
                    <span className="flex items-center">
                      {typeStyles[idea.type].icon}
                      <span className="ml-1">
                        {idea.type === 'travel' ? 'Viaggio' : 
                         idea.type === 'restaurant' ? 'Ristorante' : 
                         idea.type === 'general' ? 'Generica' : 'Sfida'}
                      </span>
                    </span>
                  </Badge>
                  
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={(e) => handleQuickDelete(e, idea.id)}
                    >
                      <X className="h-4 w-4" />
                      <span className="sr-only">Elimina</span>
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`h-8 w-8 ${
                        idea.completed 
                        ? 'text-green-600 hover:text-muted-foreground' 
                        : 'text-muted-foreground hover:text-green-600'
                      }`}
                      onClick={(e) => handleQuickToggle(e, idea.id, idea.completed)}
                    >
                      <Check className="h-4 w-4" />
                      <span className="sr-only">
                        {idea.completed ? 'Segna come da fare' : 'Segna come completata'}
                      </span>
                    </Button>
                  </div>
                </div>
                
                <CardTitle className={`line-clamp-1 ${idea.completed ? 'line-through text-muted-foreground' : ''}`}>
                  {idea.title}
                </CardTitle>
                
                <CardDescription className="flex items-center pt-1">
                  <Calendar className="h-4 w-4 mr-1" />
                  Creata il {format(new Date(idea.createdAt), 'dd/MM/yyyy')}
                </CardDescription>
                
                <CardDescription className="flex items-center pt-1">
                  Creata da: {idea.creatorName}
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <p className={`text-sm ${idea.completed ? 'text-muted-foreground line-through' : ''}`}>
                  {idea.description}
                </p>
              </CardContent>
              
              <CardFooter>
                {idea.completed ? (
                  <Badge variant="outline" className="bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400">
                    <Check className="h-3 w-3 mr-1" />
                    Completata da {idea.completedByName} {idea.completedAt && `il ${format(new Date(idea.completedAt), 'dd/MM/yyyy')}`}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400">
                    Da completare
                  </Badge>
                )}
              </CardFooter>
            </Card>
          </div>
        ))}
      </div>
    );
  }
};

export default IdeasPage;
