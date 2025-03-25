
import React, { useState } from 'react';
import { 
  Search, 
  MapPin, 
  Image as ImageIcon,
  BookMarked,
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Memory, Image as ImageType } from '@/types';
import { format } from 'date-fns';

// Mock data - we'll use the same mock memories and additional mock images for the map
// This would be merged with real data from a database in a real application
const mockLocations = [
  {
    id: 'loc-1',
    type: 'memory',
    title: 'Vacanza a Roma',
    date: new Date('2023-06-10'),
    location: { latitude: 41.9028, longitude: 12.4964, name: 'Roma, Italia' },
    thumbnail: 'https://picsum.photos/seed/1/200/200',
    memoryId: '1',
    imageId: null
  },
  {
    id: 'loc-2',
    type: 'memory',
    title: 'Compleanno di Sara',
    date: new Date('2023-04-15'),
    location: { latitude: 45.4642, longitude: 9.1900, name: 'Milano, Italia' },
    thumbnail: 'https://picsum.photos/seed/20/200/200',
    memoryId: '2',
    imageId: null
  },
  {
    id: 'loc-3',
    type: 'memory',
    title: 'Weekend a Firenze',
    date: new Date('2023-07-22'),
    location: { latitude: 43.7696, longitude: 11.2558, name: 'Firenze, Italia' },
    thumbnail: 'https://picsum.photos/seed/40/200/200',
    memoryId: '4',
    imageId: null
  },
  {
    id: 'loc-4',
    type: 'image',
    title: 'Tramonto sul mare',
    date: new Date('2023-08-05'),
    location: { latitude: 40.6329, longitude: 14.6011, name: 'Amalfi, Italia' },
    thumbnail: 'https://picsum.photos/seed/120/200/200',
    memoryId: null,
    imageId: 'img-25'
  },
  {
    id: 'loc-5',
    type: 'image',
    title: 'Vista montagne',
    date: new Date('2023-02-15'),
    location: { latitude: 46.8182, longitude: 8.2275, name: 'Alpi Svizzere' },
    thumbnail: 'https://picsum.photos/seed/130/200/200',
    memoryId: null,
    imageId: 'img-30'
  },
  {
    id: 'loc-6',
    type: 'memory',
    title: 'Concerto insieme',
    date: new Date('2023-08-15'),
    location: { latitude: 45.4785, longitude: 9.1217, name: 'San Siro, Milano' },
    thumbnail: 'https://picsum.photos/seed/60/200/200',
    memoryId: '5',
    imageId: null
  },
  {
    id: 'loc-7',
    type: 'image',
    title: 'Vista lago',
    date: new Date('2023-05-10'),
    location: { latitude: 45.9878, longitude: 9.2574, name: 'Lago di Como, Italia' },
    thumbnail: 'https://picsum.photos/seed/140/200/200',
    memoryId: null,
    imageId: 'img-35'
  },
  {
    id: 'loc-8',
    type: 'image',
    title: 'Passeggiata in città',
    date: new Date('2023-04-23'),
    location: { latitude: 45.4384, longitude: 10.9916, name: 'Verona, Italia' },
    thumbnail: 'https://picsum.photos/seed/150/200/200',
    memoryId: null,
    imageId: 'img-40'
  }
];

const MapPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'memory' | 'image'>('all');
  const [searchResults, setSearchResults] = useState<typeof mockLocations>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = () => {
    if (!searchTerm && selectedType === 'all') {
      setSearchResults([]);
      setHasSearched(false);
      return;
    }

    const filtered = mockLocations.filter(location => {
      const matchesSearch = !searchTerm || 
                           location.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           location.location.name?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = selectedType === 'all' || location.type === selectedType;
      
      return matchesSearch && matchesType;
    });
    
    setSearchResults(filtered);
    setHasSearched(true);
  };

  return (
    <div className="container mx-auto px-4 py-6 animate-fade-in h-full">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-4xl font-bold">Mappa dei Ricordi</h1>
          <p className="text-muted-foreground mt-1">
            Esplora i luoghi dei vostri momenti insieme
          </p>
        </div>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Cerca luoghi, città o ricordi..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>
        
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center">
                <Filter className="mr-2 h-4 w-4" />
                {selectedType === 'all' ? 'Tutti' :
                 selectedType === 'memory' ? 'Ricordi' : 'Immagini'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setSelectedType('all')}>
                Tutti
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedType('memory')}>
                Solo ricordi
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedType('image')}>
                Solo immagini
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button onClick={handleSearch}>
            Cerca
          </Button>
        </div>
      </div>

      <div className="flex h-[calc(100vh-300px)] min-h-[500px]">
        <div className="w-full h-full rounded-lg overflow-hidden flex relative">
          {/* Map placeholder */}
          <div className="w-full h-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
            <div className="text-center p-8">
              <MapPin className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-xl font-medium mb-2">Mappa interattiva</h3>
              <p className="text-muted-foreground">
                Qui verrà visualizzata una mappa interattiva con i luoghi dei vostri ricordi e delle immagini.
                <br />
                Integrare Mapbox o Google Maps per visualizzare i luoghi.
              </p>
            </div>
          </div>
          
          {/* Results sidebar */}
          {hasSearched && (
            <div className="absolute right-0 top-0 bottom-0 w-80 bg-card border-l border-border overflow-y-auto animate-slide-in-right p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold">Risultati ({searchResults.length})</h3>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setHasSearched(false)}
                >
                  Chiudi
                </Button>
              </div>
              
              {searchResults.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    Nessun risultato trovato per la tua ricerca.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {searchResults.map((result) => (
                    <div key={result.id} className="flex gap-3 p-2 rounded-lg hover:bg-accent transition-colors cursor-pointer">
                      <div className="w-16 h-16 rounded-md overflow-hidden flex-shrink-0">
                        <img 
                          src={result.thumbnail} 
                          alt={result.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center">
                          <Badge className="mr-2">
                            {result.type === 'memory' ? (
                              <BookMarked className="h-3 w-3 mr-1" />
                            ) : (
                              <ImageIcon className="h-3 w-3 mr-1" />
                            )}
                            {result.type === 'memory' ? 'Ricordo' : 'Immagine'}
                          </Badge>
                        </div>
                        <h4 className="font-medium mt-1 line-clamp-1">{result.title}</h4>
                        <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                          {result.location.name}
                        </p>
                        <p className="text-xs mt-1">
                          {format(result.date, 'dd/MM/yyyy')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Legend */}
      <div className="mt-4 flex items-center justify-center gap-4">
        <div className="flex items-center">
          <div className="w-4 h-4 rounded-full bg-primary mr-2"></div>
          <span className="text-sm">Ricordi</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 rounded-full bg-purple-500 mr-2"></div>
          <span className="text-sm">Immagini</span>
        </div>
      </div>
    </div>
  );
};

export default MapPage;
