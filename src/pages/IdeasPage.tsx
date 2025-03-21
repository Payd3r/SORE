
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
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
  Trophy
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

// Mock data for demonstration
const mockIdeas: Idea[] = [
  {
    id: '1',
    type: 'travel',
    title: 'Weekend a Venezia',
    description: 'Passare un weekend romantico a Venezia, visitando i canali e gustando la cucina locale.',
    createdAt: new Date('2023-05-15'),
    completed: false,
    userId: '1'
  },
  {
    id: '2',
    type: 'restaurant',
    title: 'Cena al ristorante stellato',
    description: 'Andare a cena al nuovo ristorante stellato Michelin che ha aperto in centro.',
    createdAt: new Date('2023-06-20'),
    completed: true,
    completedAt: new Date('2023-07-15'),
    userId: '1'
  },
  {
    id: '3',
    type: 'general',
    title: 'Corso di fotografia insieme',
    description: 'Iscriverci a un corso di fotografia per imparare a catturare meglio i nostri momenti.',
    createdAt: new Date('2023-04-10'),
    completed: false,
    userId: '1'
  },
  {
    id: '4',
    type: 'challenge',
    title: '30 giorni di nuove ricette',
    description: 'Provare una nuova ricetta ogni giorno per un mese, alternandoci in cucina.',
    createdAt: new Date('2023-03-05'),
    completed: false,
    userId: '1'
  },
  {
    id: '5',
    type: 'travel',
    title: 'Viaggio in Giappone',
    description: 'Pianificare un viaggio in Giappone durante la stagione dei ciliegi in fiore.',
    createdAt: new Date('2023-02-18'),
    completed: false,
    userId: '1'
  },
  {
    id: '6',
    type: 'restaurant',
    title: 'Pizza Napoletana autentica',
    description: 'Trovare la migliore pizzeria napoletana in città e provarla insieme.',
    createdAt: new Date('2023-01-25'),
    completed: true,
    completedAt: new Date('2023-02-10'),
    userId: '1'
  },
  {
    id: '7',
    type: 'general',
    title: 'Maratona film classici',
    description: 'Guardare insieme 10 film classici che non abbiamo mai visto.',
    createdAt: new Date('2023-07-03'),
    completed: false,
    userId: '1'
  },
  {
    id: '8',
    type: 'challenge',
    title: 'Escursione in montagna',
    description: 'Fare un\'escursione in montagna e raggiungere la vetta.',
    createdAt: new Date('2023-08-12'),
    completed: true,
    completedAt: new Date('2023-08-20'),
    userId: '1'
  }
];

const IdeasPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'completed' | 'pending'>('all');
  const [selectedType, setSelectedType] = useState<IdeaType | 'all'>('all');
  const [localIdeas, setLocalIdeas] = useState<Idea[]>(mockIdeas);

  // Filter ideas based on search, status and type
  const filteredIdeas = localIdeas.filter(idea => {
    const matchesSearch = idea.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         idea.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = selectedStatus === 'all' || 
                         (selectedStatus === 'completed' && idea.completed) ||
                         (selectedStatus === 'pending' && !idea.completed);
    
    const matchesType = selectedType === 'all' || idea.type === selectedType;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  // Toggle idea completion status
  const toggleIdeaCompletion = (id: string, completed: boolean) => {
    setLocalIdeas(prevIdeas => prevIdeas.map(idea => {
      if (idea.id === id) {
        const updatedIdea = {
          ...idea,
          completed,
          completedAt: completed ? new Date() : undefined
        };
        
        if (completed) {
          toast.success('Idea completata!');
        } else {
          toast.info('Idea riaperta.');
        }
        
        return updatedIdea;
      }
      return idea;
    }));
  };

  // Handle quick completion toggle
  const handleQuickToggle = (e: React.MouseEvent, id: string, currentStatus: boolean) => {
    e.preventDefault();
    e.stopPropagation();
    toggleIdeaCompletion(id, !currentStatus);
  };

  // Delete idea
  const deleteIdea = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    setLocalIdeas(prevIdeas => prevIdeas.filter(idea => idea.id !== id));
    toast.success('Idea eliminata.');
  };

  // Idea type styles and icons
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

  return (
    <div className="container mx-auto px-4 py-6 animate-fade-in">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-4xl font-bold">Le Vostre Idee</h1>
          <p className="text-muted-foreground mt-1">
            Pianificate nuove avventure insieme
          </p>
        </div>
        <Button asChild>
          <Link to="/ideas/new" className="flex items-center">
            <Plus className="mr-2 h-4 w-4" />
            Nuova Idea
          </Link>
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
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center">
                  <Filter className="mr-2 h-4 w-4" />
                  Tipo
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setSelectedType('all')}>
                  Tutti i tipi
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedType('travel')}>
                  Viaggi
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedType('restaurant')}>
                  Ristoranti
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedType('general')}>
                  Generiche
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedType('challenge')}>
                  Sfide
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        {(selectedType !== 'all' || selectedStatus !== 'all') && (
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
          </div>
        )}
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="w-full justify-start mb-6">
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
    </div>
  );

  function renderIdeasGrid(ideas: Idea[]) {
    if (ideas.length === 0) {
      return (
        <div className="text-center py-20">
          <Lightbulb className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-xl font-medium mb-2">Nessuna idea trovata</h3>
          <p className="text-muted-foreground mb-6">
            {searchTerm || selectedType !== 'all' || selectedStatus !== 'all'
              ? 'Prova a modificare i filtri o a cercare altro.' 
              : 'Inizia ad aggiungere idee per attività da fare insieme.'}
          </p>
          <Button asChild>
            <Link to="/ideas/new">
              <Plus className="mr-2 h-4 w-4" />
              Aggiungi la tua prima idea
            </Link>
          </Button>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 staggered-animate">
        {ideas.map((idea) => (
          <Link to={`/ideas/${idea.id}`} key={idea.id} className="transition-all">
            <Card 
              className={`h-full card-hover idea-card-${idea.type} ${idea.completed ? 'bg-muted/30' : ''}`}
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
                      onClick={(e) => deleteIdea(e, idea.id)}
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
                  Creata il {format(idea.createdAt, 'dd/MM/yyyy')}
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
                    Completata {idea.completedAt && `il ${format(idea.completedAt, 'dd/MM/yyyy')}`}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400">
                    Da completare
                  </Badge>
                )}
              </CardFooter>
            </Card>
          </Link>
        ))}
      </div>
    );
  }
};

export default IdeasPage;
