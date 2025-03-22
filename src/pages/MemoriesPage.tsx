
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  BookMarked, 
  Music2, 
  Calendar, 
  MapPin, 
  Filter,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon
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
import { Memory, MemoryType, EventTag, Image, ImageType } from '@/types';
import { format } from 'date-fns';

// Mock data for demonstration
export const mockMemories: Memory[] = [
  {
    id: '1',
    type: 'travel',
    title: 'Vacanza a Roma',
    startDate: new Date('2023-06-10'),
    endDate: new Date('2023-06-15'),
    song: 'Perfect - Ed Sheeran',
    location: { latitude: 41.9028, longitude: 12.4964, name: 'Roma, Italia' },
    eventTag: 'anniversary',
    images: Array(15).fill(null).map((_, i) => ({
      id: `1-${i}`,
      name: `Roma ${i+1}`,
      url: `https://picsum.photos/seed/${i+1}/800/600`,
      thumbnailUrl: `https://picsum.photos/seed/${i+1}/200/200`,
      date: new Date(2023, 5, 10 + Math.floor(i/3)),
      location: { 
        latitude: 41.9028 + (Math.random() * 0.01 - 0.005), 
        longitude: 12.4964 + (Math.random() * 0.01 - 0.005) 
      },
      userId: '1',
      uploaderName: 'Mario Rossi',
      coupleId: 'couple1',
      type: i % 3 === 0 ? 'landscape' : i % 3 === 1 ? 'singlePerson' : 'couple',
      createdAt: new Date()
    })),
    userId: '1',
    creatorName: 'Mario Rossi',
    coupleId: 'couple1',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '2',
    type: 'event',
    title: 'Compleanno di Sara',
    startDate: new Date('2023-04-15'),
    eventTag: 'birthday',
    location: { latitude: 45.4642, longitude: 9.1900, name: 'Milano, Italia' },
    images: Array(8).fill(null).map((_, i) => ({
      id: `2-${i}`,
      name: `Compleanno ${i+1}`,
      url: `https://picsum.photos/seed/${i+20}/800/600`,
      thumbnailUrl: `https://picsum.photos/seed/${i+20}/200/200`,
      date: new Date(2023, 3, 15),
      location: { 
        latitude: 45.4642 + (Math.random() * 0.01 - 0.005), 
        longitude: 9.1900 + (Math.random() * 0.01 - 0.005) 
      },
      userId: '1',
      uploaderName: 'Mario Rossi',
      coupleId: 'couple1',
      type: i % 3 === 0 ? 'landscape' : i % 3 === 1 ? 'singlePerson' : 'couple',
      createdAt: new Date()
    })),
    userId: '1',
    creatorName: 'Mario Rossi',
    coupleId: 'couple1',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '3',
    type: 'simple',
    title: 'Passeggiata al Parco',
    startDate: new Date('2023-05-20'),
    location: { latitude: 45.4773, longitude: 9.1815, name: 'Parco Sempione, Milano' },
    images: [{
      id: '3-0',
      name: 'Passeggiata',
      url: 'https://picsum.photos/seed/30/800/600',
      thumbnailUrl: 'https://picsum.photos/seed/30/200/200',
      date: new Date(2023, 4, 20),
      location: { latitude: 45.4773, longitude: 9.1815 },
      userId: '1',
      uploaderName: 'Mario Rossi',
      coupleId: 'couple1',
      type: 'landscape',
      createdAt: new Date()
    }],
    userId: '1',
    creatorName: 'Mario Rossi',
    coupleId: 'couple1',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '4',
    type: 'travel',
    title: 'Weekend a Firenze',
    startDate: new Date('2023-07-22'),
    endDate: new Date('2023-07-24'),
    song: 'Volare - Gipsy Kings',
    location: { latitude: 43.7696, longitude: 11.2558, name: 'Firenze, Italia' },
    images: Array(12).fill(null).map((_, i) => ({
      id: `4-${i}`,
      name: `Firenze ${i+1}`,
      url: `https://picsum.photos/seed/${i+40}/800/600`,
      thumbnailUrl: `https://picsum.photos/seed/${i+40}/200/200`,
      date: new Date(2023, 6, 22 + Math.floor(i/4)),
      location: { 
        latitude: 43.7696 + (Math.random() * 0.01 - 0.005), 
        longitude: 11.2558 + (Math.random() * 0.01 - 0.005) 
      },
      userId: '1',
      uploaderName: 'Mario Rossi',
      coupleId: 'couple1',
      type: i % 3 === 0 ? 'landscape' : i % 3 === 1 ? 'singlePerson' : 'couple',
      createdAt: new Date()
    })),
    userId: '1',
    creatorName: 'Mario Rossi',
    coupleId: 'couple1',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '5',
    type: 'event',
    title: 'Concerto insieme',
    startDate: new Date('2023-08-15'),
    song: 'Bohemian Rhapsody - Queen',
    location: { latitude: 45.4785, longitude: 9.1217, name: 'San Siro, Milano' },
    eventTag: 'gift',
    images: Array(5).fill(null).map((_, i) => ({
      id: `5-${i}`,
      name: `Concerto ${i+1}`,
      url: `https://picsum.photos/seed/${i+60}/800/600`,
      thumbnailUrl: `https://picsum.photos/seed/${i+60}/200/200`,
      date: new Date(2023, 7, 15),
      location: { 
        latitude: 45.4785 + (Math.random() * 0.01 - 0.005), 
        longitude: 9.1217 + (Math.random() * 0.01 - 0.005) 
      },
      userId: '1',
      uploaderName: 'Mario Rossi',
      coupleId: 'couple1',
      type: i % 3 === 0 ? 'landscape' : i % 3 === 1 ? 'singlePerson' : 'couple',
      createdAt: new Date()
    })),
    userId: '1',
    creatorName: 'Mario Rossi',
    coupleId: 'couple1',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

const MemoriesPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<MemoryType | 'all'>('all');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'title'>('date-desc');

  // Filter memories based on search term and type
  const filteredMemories = mockMemories.filter(memory => {
    const matchesSearch = memory.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          memory.location?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          memory.song?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = selectedType === 'all' || memory.type === selectedType;
    
    return matchesSearch && matchesType;
  });

  // Sort memories
  const sortedMemories = [...filteredMemories].sort((a, b) => {
    if (sortBy === 'date-desc') {
      return b.startDate.getTime() - a.startDate.getTime();
    } else if (sortBy === 'date-asc') {
      return a.startDate.getTime() - b.startDate.getTime();
    } else {
      return a.title.localeCompare(b.title);
    }
  });

  // Memory type styles
  const typeStyles: Record<MemoryType, { color: string, icon: React.ReactNode, gradientClass: string }> = {
    'travel': { 
      color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300', 
      icon: <BookMarked className="h-5 w-5" />,
      gradientClass: 'from-blue-500/10 to-blue-500/5'
    },
    'event': { 
      color: 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-300', 
      icon: <Calendar className="h-5 w-5" />,
      gradientClass: 'from-pink-500/10 to-pink-500/5'
    },
    'simple': { 
      color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-300', 
      icon: <MapPin className="h-5 w-5" />,
      gradientClass: 'from-green-500/10 to-green-500/5'
    }
  };

  // Tag styles
  const tagStyles: Record<EventTag, string> = {
    'birthday': 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-300',
    'gift': 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-300',
    'anniversary': 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-300',
    'holiday': 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-300',
    'other': 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
  };

  const renderMemoryCard = (memory: Memory) => {
    // Different layouts based on memory type
    switch(memory.type) {
      case 'travel':
        return (
          <Link to={`/memories/${memory.id}`} key={memory.id} className="transition-all col-span-1 md:col-span-2">
            <Card className={`h-full card-hover group bg-gradient-to-br ${typeStyles[memory.type].gradientClass}`}>
              <div className="grid md:grid-cols-2 h-full">
                <div className="relative h-48 md:h-full overflow-hidden rounded-t-lg md:rounded-l-lg md:rounded-tr-none">
                  <img 
                    src={memory.images[0]?.url || 'https://via.placeholder.com/400x300?text=No+Image'} 
                    alt={memory.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/70 to-transparent text-white">
                    <Badge className={typeStyles[memory.type].color}>
                      <span className="flex items-center">
                        {typeStyles[memory.type].icon}
                        <span className="ml-1">
                          {memory.type === 'travel' ? 'Viaggio' : 
                           memory.type === 'event' ? 'Evento' : 'Ricordo'}
                        </span>
                      </span>
                    </Badge>
                    {memory.eventTag && (
                      <Badge className={`ml-2 ${tagStyles[memory.eventTag]}`}>
                        {memory.eventTag === 'birthday' ? 'Compleanno' :
                         memory.eventTag === 'gift' ? 'Regalo' :
                         memory.eventTag === 'anniversary' ? 'Anniversario' :
                         memory.eventTag === 'holiday' ? 'Vacanza' : 'Altro'}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="p-5 flex flex-col">
                  <div>
                    <h3 className="text-xl font-bold mb-1">{memory.title}</h3>
                    <div className="flex items-center text-sm text-muted-foreground mb-4">
                      <Calendar className="h-4 w-4 mr-1" />
                      {format(memory.startDate, 'dd/MM/yyyy')}
                      {memory.endDate && ` - ${format(memory.endDate, 'dd/MM/yyyy')}`}
                    </div>
                  </div>
                  
                  <div className="space-y-2 flex-grow">
                    {memory.location?.name && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                        <span>{memory.location.name}</span>
                      </div>
                    )}
                    
                    {memory.song && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Music2 className="h-4 w-4 mr-1 flex-shrink-0" />
                        <span>{memory.song}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <ImageIcon className="h-4 w-4 mr-1 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{memory.images.length} foto</span>
                      </div>
                      <div className="flex -space-x-2">
                        {memory.images.slice(0, 4).map((image, index) => (
                          <div 
                            key={image.id} 
                            className="w-7 h-7 rounded-full border-2 border-background overflow-hidden"
                            style={{ zIndex: 4 - index }}
                          >
                            <img 
                              src={image.thumbnailUrl} 
                              alt={`Foto ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                        {memory.images.length > 4 && (
                          <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center border-2 border-background text-xs font-medium" style={{ zIndex: 0 }}>
                            +{memory.images.length - 4}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </Link>
        );
        
      case 'event':
        return (
          <Link to={`/memories/${memory.id}`} key={memory.id} className="transition-all">
            <Card className={`h-full card-hover group bg-gradient-to-br ${typeStyles[memory.type].gradientClass}`}>
              <div className="relative h-48 overflow-hidden rounded-t-lg">
                <img 
                  src={memory.images[0]?.url || 'https://via.placeholder.com/400x300?text=No+Image'} 
                  alt={memory.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 flex flex-col justify-end p-4 bg-gradient-to-t from-black/70 via-black/30 to-transparent text-white">
                  <div className="flex items-center justify-between mb-1">
                    <Badge className={typeStyles[memory.type].color}>
                      {memory.type === 'event' ? 'Evento' : 'Ricordo'}
                    </Badge>
                    {memory.eventTag && (
                      <Badge className={tagStyles[memory.eventTag]}>
                        {memory.eventTag === 'birthday' ? 'Compleanno' :
                         memory.eventTag === 'gift' ? 'Regalo' :
                         memory.eventTag === 'anniversary' ? 'Anniversario' :
                         memory.eventTag === 'holiday' ? 'Vacanza' : 'Altro'}
                      </Badge>
                    )}
                  </div>
                  <h3 className="text-xl font-bold">{memory.title}</h3>
                  <div className="flex items-center text-sm opacity-90 mt-1">
                    <Calendar className="h-4 w-4 mr-1" />
                    {format(memory.startDate, 'dd/MM/yyyy')}
                  </div>
                </div>
              </div>
              
              <CardContent className="pt-4">
                <div className="space-y-3">
                  {memory.location?.name && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                      <span>{memory.location.name}</span>
                    </div>
                  )}
                  
                  {memory.song && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Music2 className="h-4 w-4 mr-1 flex-shrink-0" />
                      <span>{memory.song}</span>
                    </div>
                  )}
                </div>
              </CardContent>
              
              <CardFooter className="pt-0">
                <div className="flex justify-between items-center w-full">
                  <span className="text-sm text-muted-foreground flex items-center">
                    <ImageIcon className="h-4 w-4 mr-1" />
                    {memory.images.length} foto
                  </span>
                  <div className="flex -space-x-2">
                    {memory.images.slice(0, 3).map((image, index) => (
                      <div 
                        key={image.id} 
                        className="w-7 h-7 rounded-full border-2 border-background overflow-hidden"
                      >
                        <img 
                          src={image.thumbnailUrl} 
                          alt={`Foto ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                    {memory.images.length > 3 && (
                      <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center border-2 border-background text-xs font-medium text-primary-foreground">
                        +{memory.images.length - 3}
                      </div>
                    )}
                  </div>
                </div>
              </CardFooter>
            </Card>
          </Link>
        );
        
      case 'simple':
      default:
        return (
          <Link to={`/memories/${memory.id}`} key={memory.id} className="transition-all">
            <Card className={`h-full card-hover group bg-gradient-to-br ${typeStyles[memory.type].gradientClass}`}>
              <div className="p-4 flex items-center space-x-4">
                <div className="relative h-16 w-16 rounded-full overflow-hidden flex-shrink-0">
                  <img 
                    src={memory.images[0]?.thumbnailUrl || 'https://via.placeholder.com/100x100?text=No+Image'} 
                    alt={memory.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <Badge className={typeStyles[memory.type].color}>
                    {memory.type === 'simple' ? 'Ricordo' : 'Evento'}
                  </Badge>
                  <h3 className="text-lg font-semibold mt-1">{memory.title}</h3>
                  <div className="text-sm text-muted-foreground flex items-center mt-1">
                    <Calendar className="h-3 w-3 mr-1" />
                    {format(memory.startDate, 'dd/MM/yyyy')}
                  </div>
                </div>
              </div>
              
              {memory.images.length > 0 && (
                <div className="px-4 pb-4 pt-0">
                  <div className="grid grid-cols-3 gap-1">
                    {memory.images.slice(0, 3).map((image, idx) => (
                      <div key={idx} className="aspect-square rounded overflow-hidden">
                        <img 
                          src={image.thumbnailUrl} 
                          alt={`Image ${idx+1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          </Link>
        );
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 animate-fade-in">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-4xl font-bold">I Tuoi Ricordi</h1>
          <p className="text-muted-foreground mt-1">
            Rivivere i momenti speciali insieme
          </p>
        </div>
        <Button asChild>
          <Link to="/memories/new" className="flex items-center">
            <Plus className="mr-2 h-4 w-4" />
            Nuovo Ricordo
          </Link>
        </Button>
      </div>

      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Cerca per titolo, luogo o canzone..."
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
                  Filtra
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setSelectedType('all')}>
                  Tutti i tipi
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedType('travel')}>
                  Solo Viaggi
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedType('event')}>
                  Solo Eventi
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedType('simple')}>
                  Solo Semplici
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center">
                  {sortBy === 'date-desc' ? (
                    <ChevronDown className="mr-2 h-4 w-4" />
                  ) : sortBy === 'date-asc' ? (
                    <ChevronUp className="mr-2 h-4 w-4" />
                  ) : null}
                  Ordina
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setSortBy('date-desc')}>
                  Data (più recenti)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('date-asc')}>
                  Data (più vecchi)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('title')}>
                  Titolo (A-Z)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        {selectedType !== 'all' && (
          <div className="flex items-center">
            <span className="text-sm text-muted-foreground mr-2">Filtro attivo:</span>
            <Badge 
              variant="secondary" 
              className="cursor-pointer"
              onClick={() => setSelectedType('all')}
            >
              {selectedType === 'travel' ? 'Viaggi' : 
               selectedType === 'event' ? 'Eventi' : 'Semplici'}
              <span className="ml-1">×</span>
            </Badge>
          </div>
        )}
      </div>

      {sortedMemories.length === 0 ? (
        <div className="text-center py-20">
          <BookMarked className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-xl font-medium mb-2">Nessun ricordo trovato</h3>
          <p className="text-muted-foreground mb-6">
            {searchTerm || selectedType !== 'all' 
              ? 'Prova a modificare i filtri o a cercare altro.' 
              : 'Inizia a creare bellissimi ricordi insieme.'}
          </p>
          <Button asChild>
            <Link to="/memories/new">
              <Plus className="mr-2 h-4 w-4" />
              Crea il tuo primo ricordo
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6 staggered-animate">
          {sortedMemories.map(memory => renderMemoryCard(memory))}
        </div>
      )}
    </div>
  );
};

export default MemoriesPage;
