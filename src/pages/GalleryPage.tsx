import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Heart,
  HeartOff,
  Download,
  SlidersHorizontal,
  Filter,
  Grid,
  Grid2X2,
  LayoutGrid,
  Rows3,
  Search,
} from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { Image, ImageType } from '@/types';
import { format } from 'date-fns';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import FiltersModal from '@/components/modals/FiltersModal';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { toast } from 'sonner';

const mockImages: Image[] = [
  {
    id: '1',
    name: 'Sunset at the beach',
    url: 'https://images.unsplash.com/photo-1682685797527-64aa99ca83e1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDF8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1682685797527-64aa99ca83e1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDF8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80',
    date: new Date('2023-01-01'),
    type: 'landscape',
    userId: '1',
    uploaderName: 'John Doe',
    coupleId: 'couple1',
    createdAt: new Date(),
    isFavorite: true,
  },
  {
    id: '2',
    name: 'Portrait of a woman',
    url: 'https://images.unsplash.com/photo-1682687220703-b7c6982e7937?ixlib=rb-4.0.3&ixid=M3wxMjA3fDF8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1682687220703-b7c6982e7937?ixlib=rb-4.0.3&ixid=M3wxMjA3fDF8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80',
    date: new Date('2023-02-15'),
    type: 'singlePerson',
    userId: '2',
    uploaderName: 'Jane Smith',
    coupleId: 'couple1',
    createdAt: new Date(),
    isFavorite: false,
  },
  {
    id: '3',
    name: 'Couple in love',
    url: 'https://images.unsplash.com/photo-1679936420997-a49093ef1567?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1679936420997-a49093ef1567?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80',
    date: new Date('2023-03-20'),
    type: 'couple',
    userId: '1',
    uploaderName: 'John Doe',
    coupleId: 'couple1',
    createdAt: new Date(),
    isFavorite: true,
  },
  {
    id: '4',
    name: 'City at night',
    url: 'https://images.unsplash.com/photo-1683009424379-51ca69a4b791?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1683009424379-51ca69a4b791?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80',
    date: new Date('2023-04-01'),
    type: 'landscape',
    userId: '2',
    uploaderName: 'Jane Smith',
    coupleId: 'couple1',
    createdAt: new Date(),
    isFavorite: false,
  },
  {
    id: '5',
    name: 'Woman in a field',
    url: 'https://images.unsplash.com/photo-1682555709843-4c989e43990e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1682555709843-4c989e43990e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80',
    date: new Date('2023-05-10'),
    type: 'singlePerson',
    userId: '1',
    uploaderName: 'John Doe',
    coupleId: 'couple1',
    createdAt: new Date(),
    isFavorite: true,
  },
  {
    id: '6',
    name: 'Couple holding hands',
    url: 'https://images.unsplash.com/photo-1679949073941-9c907b3ca3a7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1679949073941-9c907b3ca3a7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80',
    date: new Date('2023-06-01'),
    type: 'couple',
    userId: '2',
    uploaderName: 'Jane Smith',
    coupleId: 'couple1',
    createdAt: new Date(),
    isFavorite: false,
  },
  {
    id: '7',
    name: 'Mountains and lake',
    url: 'https://images.unsplash.com/photo-1677639503783-55894286a02c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1677639503783-55894286a02c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80',
    date: new Date('2023-07-15'),
    type: 'landscape',
    userId: '1',
    uploaderName: 'John Doe',
    coupleId: 'couple1',
    createdAt: new Date(),
    isFavorite: true,
  },
  {
    id: '8',
    name: 'Man with a hat',
    url: 'https://images.unsplash.com/photo-1683031940841-77591973949a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1683031940841-77591973949a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80',
    date: new Date('2023-08-01'),
    type: 'singlePerson',
    userId: '2',
    uploaderName: 'Jane Smith',
    coupleId: 'couple1',
    createdAt: new Date(),
    isFavorite: false,
  },
  {
    id: '9',
    name: 'Couple laughing',
    url: 'https://images.unsplash.com/photo-1679948755389-748f4d599c9a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1679948755389-748f4d599c9a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80',
    date: new Date('2023-09-10'),
    type: 'couple',
    userId: '1',
    uploaderName: 'John Doe',
    coupleId: 'couple1',
    createdAt: new Date(),
    isFavorite: true,
  },
  {
    id: '10',
    name: 'Forest in autumn',
    url: 'https://images.unsplash.com/photo-1682394347944-955b4194c191?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1682394347944-955b4194c191?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80',
    date: new Date('2023-10-01'),
    type: 'landscape',
    userId: '2',
    uploaderName: 'Jane Smith',
    coupleId: 'couple1',
    createdAt: new Date(),
    isFavorite: false,
  },
];

const GalleryPage: React.FC = () => {
  const [images, setImages] = useState<Image[]>(mockImages);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<ImageType | 'all'>('all');
  const [favoriteFilter, setFavoriteFilter] = useState<'all' | 'favorites' | 'regular'>('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [gridSize, setGridSize] = useState<'small' | 'medium' | 'large'>('medium');
  const { user } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<Image | null>(null);

  const toggleFavorite = useCallback((imageId: string) => {
    setImages(prevImages =>
      prevImages.map(img =>
        img.id === imageId ? { ...img, isFavorite: !img.isFavorite } : img
      )
    );
    toast.success('Immagine aggiunta ai preferiti!');
  }, []);

  const handleImageClick = (image: Image) => {
    setSelectedImage(image);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedImage(null);
  };

  useEffect(() => {
    localStorage.setItem('images', JSON.stringify(images));
  }, [images]);

  const filterOptions = [
    { value: 'landscape', label: 'Paesaggi' },
    { value: 'singlePerson', label: 'Persona singola' },
    { value: 'couple', label: 'Coppia' }
  ];

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedType('all');
    setFavoriteFilter('all');
  };

  const filteredImages = images.filter((image) => {
    const matchesSearch = image.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'all' || image.type === selectedType;
    const matchesFavorite =
      favoriteFilter === 'all' ||
      (favoriteFilter === 'favorites' && image.isFavorite) ||
      (favoriteFilter === 'regular' && !image.isFavorite);

    return matchesSearch && matchesType && matchesFavorite;
  });

  const sortedImages = [...filteredImages].sort((a, b) => {
    const dateA = a.date.getTime();
    const dateB = b.date.getTime();
    return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
  });

  const displayedImages = sortedImages;

  return (
    <div className="container mx-auto px-4 py-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Cerca immagini..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Mobile Filters */}
          <div className="block sm:hidden w-full">
            <FiltersModal 
              title="Filtra Immagini"
              description="Seleziona i filtri per le tue immagini"
              searchTerm={searchQuery}
              onSearchChange={setSearchQuery}
              selectedType={selectedType}
              onTypeChange={setSelectedType}
              typeOptions={filterOptions}
              selectedFavorite={favoriteFilter}
              onFavoriteChange={setFavoriteFilter}
              onResetFilters={resetFilters}
            />
          </div>
          
          {/* Desktop Filters */}
          <div className="hidden sm:flex items-center gap-2">
            <ToggleGroup 
              type="single" 
              value={favoriteFilter}
              onValueChange={(value) => {
                if (value) setFavoriteFilter(value as 'all' | 'favorites' | 'regular');
              }}
            >
              <ToggleGroupItem value="all" aria-label="Tutte le immagini">
                <Grid2X2 className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="favorites" aria-label="Solo preferiti">
                <Heart className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="regular" aria-label="No preferiti">
                <HeartOff className="h-4 w-4" />
              </ToggleGroupItem>
            </ToggleGroup>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8">
                  <Filter className="h-4 w-4 mr-2" />
                  Filtri
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Tipo di immagine</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => setSelectedType('all')}>
                  Tutte
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedType('landscape')}>
                  Paesaggi
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedType('singlePerson')}>
                  Persona singola
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedType('couple')}>
                  Coppia
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8">
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  Ordina
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Ordina per</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => setSortOrder('newest')}>
                  Più recenti prima
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortOrder('oldest')}>
                  Più vecchie prima
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Shared controls */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 sm:w-auto">
                <LayoutGrid className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Vista</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Dimensione griglia</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => setGridSize('small')}>
                <Grid className="h-4 w-4 mr-2" />
                Piccola
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setGridSize('medium')}>
                <LayoutGrid className="h-4 w-4 mr-2" />
                Media
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setGridSize('large')}>
                <Rows3 className="h-4 w-4 mr-2" />
                Grande
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <h1 className="text-3xl font-bold mb-4">Galleria</h1>
      <p className="text-muted-foreground">Esplora i tuoi ricordi più belli</p>

      <div className={`gallery-${gridSize} gap-2`}>
        {displayedImages.map((image) => (
          <div key={image.id} className="relative group cursor-pointer" onClick={() => handleImageClick(image)}>
            <Card className="overflow-hidden shadow-md rounded-md transition-transform hover:scale-105">
              <div className="aspect-w-16 aspect-h-9">
                <img
                  src={image.thumbnailUrl}
                  alt={image.name}
                  className="object-cover w-full h-full"
                />
              </div>
              <CardFooter className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/80 to-transparent text-white p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">{image.name}</CardTitle>
                  <Button variant="ghost" size="icon" onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(image.id);
                    }}>
                    {image.isFavorite ? <Heart className="h-4 w-4 text-red-500" /> : <HeartOff className="h-4 w-4" />}
                  </Button>
                </div>
                <CardDescription className="text-xs">
                  {format(image.date, 'dd/MM/yyyy')}
                </CardDescription>
              </CardFooter>
            </Card>
          </div>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[60%] bg-background border rounded-lg p-6 shadow-xl">
          {selectedImage && (
            <div className="flex flex-col">
              <img
                src={selectedImage.url}
                alt={selectedImage.name}
                className="object-contain max-h-[60vh] w-full rounded-md mb-4"
              />
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-semibold">{selectedImage.name}</h2>
                <Button variant="ghost" size="icon" onClick={() => toggleFavorite(selectedImage.id)}>
                  {selectedImage.isFavorite ? <Heart className="h-5 w-5 text-red-500" /> : <HeartOff className="h-5 w-5" />}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Data: {format(selectedImage.date, 'dd/MM/yyyy')} | Tipo: {selectedImage.type}
              </p>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={handleCloseDialog}>
                  Chiudi
                </Button>
                <Button asChild>
                  <a href={selectedImage.url} download={selectedImage.name} className="flex items-center">
                    <Download className="w-4 h-4 mr-2" />
                    Scarica
                  </a>
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GalleryPage;
