
import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Upload, 
  Search, 
  Filter, 
  ChevronDown, 
  Calendar, 
  MapPin, 
  Info,
  Grid3X3,
  Grid2X2,
  Grid
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Image as ImageType } from '@/types';
import { format } from 'date-fns';

// Mock data for demonstration
const mockImages: ImageType[] = [];

// Generate 50 mock images
for (let i = 0; i < 50; i++) {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * 365));
  
  const image: ImageType = {
    id: `img-${i}`,
    name: `Immagine ${i+1}`,
    url: `https://picsum.photos/seed/${i+100}/800/600`,
    thumbnailUrl: `https://picsum.photos/seed/${i+100}/200/200`,
    date,
    location: i % 4 === 0 ? undefined : {
      latitude: 45.4642 + (Math.random() * 0.1 - 0.05),
      longitude: 9.1900 + (Math.random() * 0.1 - 0.05),
      name: 'Milano, Italia'
    },
    userId: '1',
    createdAt: new Date()
  };
  
  mockImages.push(image);
}

// Sort images by date (newest first)
mockImages.sort((a, b) => b.date.getTime() - a.date.getTime());

// Group images by month/year for timeline view
const groupImagesByMonth = (images: ImageType[]) => {
  const grouped: Record<string, ImageType[]> = {};
  
  images.forEach(image => {
    const monthYear = format(image.date, 'MMMM yyyy');
    if (!grouped[monthYear]) {
      grouped[monthYear] = [];
    }
    grouped[monthYear].push(image);
  });
  
  return grouped;
};

const GalleryPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [gridSize, setGridSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');
  const [selectedImage, setSelectedImage] = useState<ImageType | null>(null);
  const [filterWithLocation, setFilterWithLocation] = useState(false);
  
  // Filter images based on search and location filter
  const filteredImages = useMemo(() => {
    return mockImages.filter(image => {
      const matchesSearch = image.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesLocationFilter = !filterWithLocation || !!image.location;
      return matchesSearch && matchesLocationFilter;
    });
  }, [searchTerm, filterWithLocation]);
  
  // Sort images
  const sortedImages = useMemo(() => {
    return [...filteredImages].sort((a, b) => {
      if (sortBy === 'newest') {
        return b.date.getTime() - a.date.getTime();
      } else {
        return a.date.getTime() - b.date.getTime();
      }
    });
  }, [filteredImages, sortBy]);
  
  // Group images for timeline view
  const groupedImages = useMemo(() => {
    return groupImagesByMonth(sortedImages);
  }, [sortedImages]);
  
  // Render image grid
  const renderImageGrid = () => {
    // Column count based on grid size
    const columns = gridSize === 'small' ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6' :
                   gridSize === 'medium' ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4' :
                   'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
    
    // Image height based on grid size
    const height = gridSize === 'small' ? 'h-40' :
                 gridSize === 'medium' ? 'h-56' :
                 'h-80';
    
    return (
      <div className={`grid ${columns} gap-3 md:gap-4`}>
        {sortedImages.map((image) => (
          <div 
            key={image.id} 
            className={`${height} rounded-lg overflow-hidden relative cursor-pointer group card-hover`}
            onClick={() => setSelectedImage(image)}
          >
            <img 
              src={image.url} 
              alt={image.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="absolute bottom-0 left-0 right-0 p-2 text-white">
                <p className="text-sm font-medium truncate">{image.name}</p>
                <p className="text-xs opacity-80">{format(image.date, 'dd/MM/yyyy')}</p>
              </div>
            </div>
            {image.location && (
              <div className="absolute top-2 right-2">
                <Badge variant="secondary" className="bg-black/50 text-white border-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <MapPin className="h-3 w-3 mr-1" />
                </Badge>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };
  
  // Render timeline view
  const renderTimelineView = () => {
    return (
      <div className="space-y-8">
        {Object.entries(groupedImages).map(([monthYear, images]) => (
          <div key={monthYear} className="animate-in" style={{ animationDelay: "50ms" }}>
            <h3 className="text-lg font-medium mb-3 sticky top-0 bg-background/80 backdrop-blur-sm py-2 z-10">
              {monthYear}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {images.map((image) => (
                <div 
                  key={image.id} 
                  className="h-48 rounded-lg overflow-hidden relative cursor-pointer group card-hover"
                  onClick={() => setSelectedImage(image)}
                >
                  <img 
                    src={image.url} 
                    alt={image.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-0 left-0 right-0 p-2 text-white">
                      <p className="text-sm font-medium truncate">{image.name}</p>
                      <p className="text-xs opacity-80">{format(image.date, 'dd/MM/yyyy')}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-6 animate-fade-in">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-4xl font-bold">Galleria</h1>
          <p className="text-muted-foreground mt-1">
            Esplora i tuoi ricordi fotografici
          </p>
        </div>
        <Button asChild>
          <Link to="/gallery/upload" className="flex items-center">
            <Upload className="mr-2 h-4 w-4" />
            Carica Immagini
          </Link>
        </Button>
      </div>
      
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Cerca immagini..."
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
                <DropdownMenuItem onClick={() => setFilterWithLocation(!filterWithLocation)} className="flex items-center">
                  <div className={`w-4 h-4 mr-2 flex items-center justify-center border rounded ${filterWithLocation ? 'bg-primary border-primary' : 'border-input'}`}>
                    {filterWithLocation && (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-3 w-3 text-white">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    )}
                  </div>
                  Solo con posizione
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center">
                  <ChevronDown className="mr-2 h-4 w-4" />
                  {sortBy === 'newest' ? 'Più recenti' : 'Più vecchie'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setSortBy('newest')}>
                  Più recenti
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('oldest')}>
                  Più vecchie
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <div className="flex rounded-md border">
              <Button
                variant="ghost"
                size="icon"
                className={`rounded-none rounded-l-md ${gridSize === 'small' ? 'bg-accent' : ''}`}
                onClick={() => setGridSize('small')}
              >
                <Grid3X3 className="h-4 w-4" />
                <span className="sr-only">Griglia piccola</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={`rounded-none border-x ${gridSize === 'medium' ? 'bg-accent' : ''}`}
                onClick={() => setGridSize('medium')}
              >
                <Grid2X2 className="h-4 w-4" />
                <span className="sr-only">Griglia media</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={`rounded-none rounded-r-md ${gridSize === 'large' ? 'bg-accent' : ''}`}
                onClick={() => setGridSize('large')}
              >
                <Grid className="h-4 w-4" />
                <span className="sr-only">Griglia grande</span>
              </Button>
            </div>
          </div>
        </div>
        
        {filterWithLocation && (
          <div className="flex items-center">
            <span className="text-sm text-muted-foreground mr-2">Filtro attivo:</span>
            <Badge 
              variant="secondary" 
              className="cursor-pointer"
              onClick={() => setFilterWithLocation(false)}
            >
              Solo con posizione
              <span className="ml-1">×</span>
            </Badge>
          </div>
        )}
      </div>
      
      <Tabs defaultValue="grid" className="w-full">
        <TabsList className="w-full justify-start mb-6">
          <TabsTrigger value="grid">Griglia</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>
        
        <TabsContent value="grid" className="animate-in">
          {sortedImages.length === 0 ? (
            <div className="text-center py-20">
              <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-xl font-medium mb-2">Nessuna immagine trovata</h3>
              <p className="text-muted-foreground mb-6">
                {searchTerm || filterWithLocation 
                  ? 'Prova a modificare i filtri o a cercare altro.' 
                  : 'Inizia a caricare le tue immagini dei momenti speciali.'}
              </p>
              <Button asChild>
                <Link to="/gallery/upload">
                  <Upload className="mr-2 h-4 w-4" />
                  Carica Immagini
                </Link>
              </Button>
            </div>
          ) : renderImageGrid()}
        </TabsContent>
        
        <TabsContent value="timeline" className="animate-in">
          {Object.keys(groupedImages).length === 0 ? (
            <div className="text-center py-20">
              <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-xl font-medium mb-2">Nessuna immagine trovata</h3>
              <p className="text-muted-foreground mb-6">
                {searchTerm || filterWithLocation 
                  ? 'Prova a modificare i filtri o a cercare altro.' 
                  : 'Inizia a caricare le tue immagini dei momenti speciali.'}
              </p>
              <Button asChild>
                <Link to="/gallery/upload">
                  <Upload className="mr-2 h-4 w-4" />
                  Carica Immagini
                </Link>
              </Button>
            </div>
          ) : renderTimelineView()}
        </TabsContent>
      </Tabs>
      
      {/* Image Preview Dialog */}
      <Dialog open={!!selectedImage} onOpenChange={(open) => !open && setSelectedImage(null)}>
        <DialogContent className="max-w-4xl w-full">
          <DialogHeader>
            <DialogTitle>{selectedImage?.name}</DialogTitle>
            <DialogDescription>
              {format(selectedImage?.date || new Date(), 'dd MMMM yyyy, HH:mm')}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="aspect-square md:aspect-auto md:h-[60vh] rounded-lg overflow-hidden">
              {selectedImage && (
                <img
                  src={selectedImage.url}
                  alt={selectedImage.name}
                  className="w-full h-full object-contain bg-black/5 dark:bg-white/5"
                />
              )}
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-1 flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Data
                </h3>
                <p className="text-muted-foreground">
                  {selectedImage && format(selectedImage.date, 'dd MMMM yyyy, HH:mm')}
                </p>
              </div>
              
              {selectedImage?.location && (
                <div>
                  <h3 className="text-lg font-medium mb-1 flex items-center">
                    <MapPin className="w-5 h-5 mr-2" />
                    Posizione
                  </h3>
                  <p className="text-muted-foreground">
                    {selectedImage.location.name || 'Posizione sconosciuta'}
                  </p>
                  <div className="mt-2 rounded-md overflow-hidden h-32 bg-muted flex items-center justify-center">
                    <p className="text-sm text-center p-4">
                      Qui verrà visualizzata una mappa con la posizione dell'immagine
                    </p>
                  </div>
                </div>
              )}
              
              {selectedImage?.memoryId && (
                <div>
                  <h3 className="text-lg font-medium mb-1 flex items-center">
                    <Info className="w-5 h-5 mr-2" />
                    Ricordo associato
                  </h3>
                  <Link 
                    to={`/memories/${selectedImage.memoryId}`}
                    className="text-primary hover:underline inline-block"
                  >
                    Visualizza ricordo
                  </Link>
                </div>
              )}
              
              <Button variant="outline" className="w-full mt-4">
                Scarica immagine
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GalleryPage;
