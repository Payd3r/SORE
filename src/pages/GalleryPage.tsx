import React, { useState, useMemo, useEffect } from 'react';
import { 
  Upload, 
  Search, 
  Filter, 
  ChevronDown, 
  Calendar, 
  MapPin, 
  User,
  Grid2X2,
  Grid,
  Trash,
  Check,
  Heart
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
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem
} from '@/components/ui/dropdown-menu';
import { Image as ImageType, ImageType as ImageCategory, Memory } from '@/types';
import { format } from 'date-fns';
import { useAuth } from '@/context/auth-context';
import { toast } from 'sonner';
import ImageModal from '@/components/modals/ImageModal';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Download } from "lucide-react";

const generateMockImages = (): ImageType[] => {
  const images: ImageType[] = [];
  const imageTypes: ImageCategory[] = ['landscape', 'singlePerson', 'couple'];
  const userIds = ['1', '2'];
  const userNames = ['John Doe', 'Jane Smith'];
  const coupleId = 'couple1';
  
  for (let i = 0; i < 50; i++) {
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 365));
    
    const userIndex = i % 2;
    
    const image: ImageType = {
      id: `img-${i}`,
      name: `Immagine ${i+1}`,
      url: `https://picsum.photos/seed/${i+100}/800/600`,
      thumbnailUrl: `https://picsum.photos/seed/${i+100}/200/200`,
      date,
      type: imageTypes[i % 3],
      location: i % 4 === 0 ? undefined : {
        latitude: 45.4642 + (Math.random() * 0.1 - 0.05),
        longitude: 9.1900 + (Math.random() * 0.1 - 0.05),
        name: 'Milano, Italia'
      },
      userId: userIds[userIndex],
      uploaderName: userNames[userIndex],
      coupleId,
      createdAt: new Date()
    };
    
    images.push(image);
  }
  
  return images.sort((a, b) => b.date.getTime() - a.date.getTime());
};

const initializeImages = () => {
  const storedImages = localStorage.getItem('images');
  if (!storedImages) {
    const mockImages = generateMockImages();
    localStorage.setItem('images', JSON.stringify(mockImages));
    return mockImages;
  }
  return JSON.parse(storedImages);
};

const mockMemories: Memory[] = [
  {
    id: 'mem1',
    type: 'travel',
    title: 'Viaggio a Roma',
    startDate: new Date('2023-06-10'),
    endDate: new Date('2023-06-15'),
    images: [],
    userId: '1',
    creatorName: 'John Doe',
    coupleId: 'couple1',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'mem2',
    type: 'event',
    title: 'Anniversario',
    startDate: new Date('2023-04-20'),
    images: [],
    userId: '2',
    creatorName: 'Jane Smith',
    coupleId: 'couple1',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

const groupImagesByMonth = (images: ImageType[]) => {
  const grouped: Record<string, ImageType[]> = {};
  
  images.forEach(image => {
    const monthYear = format(new Date(image.date), 'MMMM yyyy');
    if (!grouped[monthYear]) {
      grouped[monthYear] = [];
    }
    grouped[monthYear].push(image);
  });
  
  return grouped;
};

const GalleryPage: React.FC = () => {
  const { user, couple } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [gridSize, setGridSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');
  const [selectedImage, setSelectedImage] = useState<ImageType | null>(null);
  const [selectedType, setSelectedType] = useState<ImageCategory | 'all'>('all');
  const [selectedUser, setSelectedUser] = useState<string | 'all'>('all');
  const [showFavorites, setShowFavorites] = useState(false);
  const [images, setImages] = useState<ImageType[]>([]);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [memories, setMemories] = useState<Memory[]>(mockMemories);
  
  useEffect(() => {
    const loadedImages = initializeImages();
    setImages(loadedImages);
    
    const storedMemories = localStorage.getItem('memories');
    if (storedMemories) {
      setMemories(JSON.parse(storedMemories));
    }
  }, []);
  
  const filteredImages = useMemo(() => {
    return images.filter(image => {
      const matchesSearch = image.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = selectedType === 'all' || image.type === selectedType;
      const matchesUser = selectedUser === 'all' || image.userId === selectedUser;
      const matchesFavorites = !showFavorites || image.isFavorite;
      return matchesSearch && matchesType && matchesUser && matchesFavorites;
    });
  }, [images, searchTerm, selectedType, selectedUser, showFavorites]);
  
  const sortedImages = useMemo(() => {
    return [...filteredImages].sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      } else {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      }
    });
  }, [filteredImages, sortBy]);
  
  const groupedImages = useMemo(() => {
    return groupImagesByMonth(sortedImages);
  }, [sortedImages]);
  
  const uploaders = useMemo(() => {
    const uniqueUploaders = new Map();
    
    images.forEach(image => {
      if (!uniqueUploaders.has(image.userId)) {
        uniqueUploaders.set(image.userId, image.uploaderName || 'Utente sconosciuto');
      }
    });
    
    return Array.from(uniqueUploaders.entries()).map(([id, name]) => ({ id, name }));
  }, [images]);
  
  const handleImageClick = (image: ImageType) => {
    if (isSelectionMode) {
      toggleImageSelection(image.id);
    } else {
      setSelectedImage(image);
      setModalOpen(true);
    }
  };
  
  const toggleImageSelection = (id: string) => {
    setSelectedImages(prev => {
      if (prev.includes(id)) {
        return prev.filter(imageId => imageId !== id);
      } else {
        return [...prev, id];
      }
    });
  };
  
  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    setSelectedImages([]);
  };
  
  const deleteSelectedImages = () => {
    if (selectedImages.length === 0) return;
    
    const updatedImages = images.filter(image => !selectedImages.includes(image.id));
    setImages(updatedImages);
    localStorage.setItem('images', JSON.stringify(updatedImages));
    
    toast.success(`${selectedImages.length} immagini eliminate`);
    console.log('Deleted images:', selectedImages);
    setSelectedImages([]);
    setIsSelectionMode(false);
  };
  
  const deleteSingleImage = () => {
    if (!selectedImage) return;
    
    const updatedImages = images.filter(image => image.id !== selectedImage.id);
    setImages(updatedImages);
    localStorage.setItem('images', JSON.stringify(updatedImages));
    
    toast.success('Immagine eliminata');
    console.log('Deleted image:', selectedImage.id);
    setModalOpen(false);
  };
  
  const updateImage = (imageData: Partial<ImageType>) => {
    if (!selectedImage) return;
    
    const updatedImages = images.map(image => {
      if (image.id === selectedImage.id) {
        return { ...image, ...imageData };
      }
      return image;
    });
    
    setImages(updatedImages);
    localStorage.setItem('images', JSON.stringify(updatedImages));
    
    toast.success('Immagine aggiornata');
    console.log('Updated image:', selectedImage.id, imageData);
    setModalOpen(false);
  };
  
  const handleImageUpload = (files: File[], imageData: Partial<ImageType>) => {
    const newImages: ImageType[] = [];
    
    files.forEach((file, index) => {
      const url = URL.createObjectURL(file);
      
      const newImage: ImageType = {
        id: `img-${Date.now()}-${index}`,
        name: imageData.name || file.name,
        url,
        thumbnailUrl: url,
        date: imageData.date || new Date(),
        type: imageData.type || 'landscape',
        location: imageData.location,
        memoryId: imageData.memoryId,
        userId: user?.id || '',
        uploaderName: user?.name || '',
        coupleId: couple?.id || '',
        createdAt: new Date()
      };
      
      newImages.push(newImage);
    });
    
    const updatedImages = [...newImages, ...images];
    setImages(updatedImages);
    localStorage.setItem('images', JSON.stringify(updatedImages));
    
    toast.success(`${files.length} immagini caricate`);
    console.log('Uploaded images:', newImages);
  };
  
  const selectAllImages = () => {
    if (sortedImages.length === selectedImages.length) {
      setSelectedImages([]);
    } else {
      setSelectedImages(sortedImages.map(img => img.id));
    }
  };
  
  const toggleFavorite = (imageId: string) => {
    const updatedImages = images.map(image => 
      image.id === imageId 
        ? { ...image, isFavorite: !image.isFavorite }
        : image
    );
    
    setImages(updatedImages);
    localStorage.setItem('images', JSON.stringify(updatedImages));
    
    toast.success('Preferiti aggiornati');
    console.log(`Toggled favorite for image: ${imageId}`);
  };

  return (
    <div className="container mx-auto px-4 py-6 animate-fade-in">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-4xl font-bold">La tua Galleria</h1>
          <p className="text-muted-foreground mt-1">
            Sfoglia e gestisci i tuoi ricordi fotografici
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button 
            variant={isSelectionMode ? "default" : "outline"} 
            onClick={toggleSelectionMode}
          >
            {isSelectionMode ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Selezione ({selectedImages.length})
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                Seleziona
              </>
            )}
          </Button>
          
          <Button onClick={() => setUploadModalOpen(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Carica
          </Button>
        </div>
      </div>

      {isSelectionMode && (
        <div className="mb-4 p-3 bg-muted rounded-lg flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center">
            <span className="text-sm mr-2">
              {selectedImages.length} immagini selezionate
            </span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={selectAllImages}
            >
              {selectedImages.length === sortedImages.length ? 'Deseleziona tutte' : 'Seleziona tutte'}
            </Button>
          </div>
          
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={deleteSelectedImages}
            disabled={selectedImages.length === 0}
          >
            <Trash className="mr-2 h-4 w-4" />
            Elimina selezionate
          </Button>
        </div>
      )}

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
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuCheckboxItem
                  checked={showFavorites}
                  onCheckedChange={setShowFavorites}
                >
                  Solo Preferiti
                  <Heart className="ml-2 h-4 w-4 text-red-500" fill={showFavorites ? "#ef4444" : "none"} />
                </DropdownMenuCheckboxItem>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem 
                  onClick={() => setSelectedType('all')}
                  className={selectedType === 'all' ? 'bg-accent text-accent-foreground' : ''}
                >
                  Tutti i tipi
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setSelectedType('landscape')}
                  className={selectedType === 'landscape' ? 'bg-accent text-accent-foreground' : ''}
                >
                  Solo Paesaggi
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setSelectedType('singlePerson')}
                  className={selectedType === 'singlePerson' ? 'bg-accent text-accent-foreground' : ''}
                >
                  Solo Persone
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setSelectedType('couple')}
                  className={selectedType === 'couple' ? 'bg-accent text-accent-foreground' : ''}
                >
                  Solo Coppia
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem 
                  onClick={() => setSelectedUser('all')}
                  className={selectedUser === 'all' ? 'bg-accent text-accent-foreground' : ''}
                >
                  Tutti gli utenti
                </DropdownMenuItem>
                
                {uploaders.map(uploader => (
                  <DropdownMenuItem 
                    key={uploader.id}
                    onClick={() => setSelectedUser(uploader.id)}
                    className={selectedUser === uploader.id ? 'bg-accent text-accent-foreground' : ''}
                  >
                    Solo {uploader.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2 min-w-[120px]">
                  {sortBy === 'newest' ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                  {sortBy === 'newest' ? 'Più recenti' : 'Più vecchie'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setSortBy('newest')}>
                  Data (più recenti)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('oldest')}>
                  Data (più vecchie)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <Grid className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setGridSize('small')}>
                  <Grid2X2 className="mr-2 h-4 w-4" />
                  Griglia piccola
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setGridSize('medium')}>
                  <Grid className="mr-2 h-4 w-4" />
                  Griglia media
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setGridSize('large')}>
                  <Grid className="mr-2 h-4 w-4" />
                  Griglia grande
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        {/* Active Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {selectedType !== 'all' && (
            <Badge 
              variant="secondary" 
              className="cursor-pointer"
              onClick={() => setSelectedType('all')}
            >
              {selectedType === 'landscape' ? 'Paesaggio' : 
               selectedType === 'singlePerson' ? 'Persona' : 'Coppia'}
              <span className="ml-1">×</span>
            </Badge>
          )}
          
          {selectedUser !== 'all' && (
            <Badge 
              variant="secondary" 
              className="cursor-pointer"
              onClick={() => setSelectedUser('all')}
            >
              {uploaders.find(u => u.id === selectedUser)?.name || 'Utente'}
              <span className="ml-1">×</span>
            </Badge>
          )}
          
          {showFavorites && (
            <Badge 
              variant="secondary" 
              className="cursor-pointer bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400"
              onClick={() => setShowFavorites(false)}
            >
              <Heart className="h-3 w-3 mr-1" fill="#ef4444" />
              Preferiti
              <span className="ml-1">×</span>
            </Badge>
          )}
        </div>
      </div>

      <Tabs defaultValue="grid" className="space-y-6">
        <TabsList className="mb-6">
          <TabsTrigger value="grid">Griglia</TabsTrigger>
          <TabsTrigger value="month">Per mese</TabsTrigger>
        </TabsList>
        
        <TabsContent value="grid" className="space-y-6 animate-fade-in">
          {sortedImages.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-muted/50 rounded-lg p-8 max-w-md mx-auto">
                <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-medium mb-2">Nessuna immagine trovata</h3>
                <p className="text-muted-foreground mb-6">
                  {(searchTerm || selectedType !== 'all' || selectedUser !== 'all' || showFavorites) 
                    ? 'Prova a modificare i filtri di ricerca.' 
                    : 'Carica la tua prima immagine per iniziare.'}
                </p>
                <Button onClick={() => setUploadModalOpen(true)}>
                  <Upload className="mr-2 h-4 w-4" />
                  Carica immagini
                </Button>
              </div>
            </div>
          ) : (
            <div>
              <div className={`grid ${
                gridSize === 'small' ? 'grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8' :
                gridSize === 'medium' ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6' :
                'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
              } gap-3 md:gap-4`}>
                {sortedImages.map((image) => (
                  <div 
                    key={image.id} 
                    className={`relative rounded-lg overflow-hidden group cursor-pointer ${
                      isSelectionMode && selectedImages.includes(image.id) ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => handleImageClick(image)}
                  >
                    <div className={`${
                      gridSize === 'small' ? 'h-32 sm:h-40' :
                      gridSize === 'medium' ? 'h-48 sm:h-52' :
                      'h-64 sm:h-72'
                    }`}>
                      <img 
                        src={image.url} 
                        alt={image.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                      />
                    </div>
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-between p-3">
                      <div className="self-end">
                        {image.isFavorite && (
                          <div className="bg-red-500 text-white rounded-full p-1.5">
                            <Heart className="h-4 w-4" fill="white" />
                          </div>
                        )}
                      </div>
                      <div className="text-white">
                        <div className="text-sm font-medium truncate">{image.name}</div>
                        <div className="text-xs flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {format(image.date, 'dd/MM/yyyy')}
                        </div>
                        {image.type && (
                          <Badge variant="outline" className="mt-1 text-xs border-white/50 text-white">
                            {image.type === 'landscape' ? 'Paesaggio' : 
                             image.type === 'singlePerson' ? 'Persona' : 'Coppia'}
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    {isSelectionMode && (
                      <div className="absolute top-2 right-2 z-10">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                          selectedImages.includes(image.id) 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-background/80 text-foreground border'
                        }`}>
                          {selectedImages.includes(image.id) && <Check className="h-4 w-4" />}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="text-center pt-6 text-sm text-muted-foreground">
                {sortedImages.length} immagini
              </div>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="month" className="space-y-10 animate-fade-in">
          {Object.keys(groupedImages).length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-muted/50 rounded-lg p-8 max-w-md mx-auto">
                <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-medium mb-2">Nessuna immagine trovata</h3>
                <p className="text-muted-foreground mb-6">
                  Carica la tua prima immagine per iniziare.
                </p>
                <Button onClick={() => setUploadModalOpen(true)}>
                  <Upload className="mr-2 h-4 w-4" />
                  Carica immagini
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-10">
              {Object.entries(groupedImages).map(([month, monthImages]) => (
                <div key={month} className="space-y-4">
                  <div className="flex items-center gap-2 border-b pb-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    <h2 className="text-2xl font-bold capitalize">{month}</h2>
                    <Badge variant="outline">{monthImages.length} immagini</Badge>
                  </div>
                  
                  <div className={`grid ${
                    gridSize === 'small' ? 'grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8' :
                    gridSize === 'medium' ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6' :
                    'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
                  } gap-3 md:gap-4`}>
                    {monthImages.map((image) => (
                      <div 
                        key={image.id} 
                        className={`relative rounded-lg overflow-hidden group cursor-pointer ${
                          isSelectionMode && selectedImages.includes(image.id) ? 'ring-2 ring-primary' : ''
                        }`}
                        onClick={() => handleImageClick(image)}
                      >
                        <div className={`${
                          gridSize === 'small' ? 'h-32 sm:h-40' :
                          gridSize === 'medium' ? 'h-48 sm:h-52' :
                          'h-64 sm:h-72'
                        }`}>
                          <img 
                            src={image.url} 
                            alt={image.name}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            loading="lazy"
                          />
                        </div>
                        
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-between p-3">
                          <div className="self-end">
                            {image.isFavorite && (
                              <div className="bg-red-500 text-white rounded-full p-1.5">
                                <Heart className="h-4 w-4" fill="white" />
                              </div>
                            )}
                          </div>
                          <div className="text-white">
                            <div className="text-sm font-medium truncate">{image.name}</div>
                            <div className="text-xs flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              {format(image.date, 'dd/MM/yyyy')}
                            </div>
                            {image.type && (
                              <Badge variant="outline" className="mt-1 text-xs border-white/50 text-white">
                                {image.type === 'landscape' ? 'Paesaggio' : 
                                 image.type === 'singlePerson' ? 'Persona' : 'Coppia'}
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        {isSelectionMode && (
                          <div className="absolute top-2 right-2 z-10">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                              selectedImages.includes(image.id) 
                                ? 'bg-primary text-primary-foreground' 
                                : 'bg-background/80 text-foreground border'
                            }`}>
                              {selectedImages.includes(image.id) && <Check className="h-4 w-4" />}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {selectedImage && (
        <Dialog open={modalOpen} onOpenChange={(open) => !open && setSelectedImage(null)}>
          <DialogContent className="sm:max-w-4xl">
            <div className="space-y-4">
              <div className="relative aspect-video rounded-md overflow-hidden bg-black/5">
                <img 
                  src={selectedImage.url} 
                  alt={selectedImage.name} 
                  className="w-full h-full object-contain"
                />
                <button 
                  className={`absolute top-3 right-3 rounded-full p-2 ${selectedImage.isFavorite ? 'bg-red-500 text-white' : 'bg-white/80 text-gray-700'}`}
                  onClick={() => toggleFavorite(selectedImage.id)}
                >
                  <Heart className="h-5 w-5" fill={selectedImage.isFavorite ? "#fff" : "none"} />
                </button>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">{selectedImage.name}</h3>
                  
                  <div className="space-y-2">
                    <div className="flex items-center text-muted-foreground text-sm">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>{format(selectedImage.date, 'dd/MM/yyyy HH:mm')}</span>
                    </div>
                    
                    {selectedImage.location?.name && (
                      <div className="flex items-center text-muted-foreground text-sm">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span>{selectedImage.location.name}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center text-muted-foreground text-sm">
                      <User className="h-4 w-4 mr-1" />
                      <span>Caricata da: {selectedImage.uploaderName}</span>
                    </div>
                    
                    {selectedImage.type && (
                      <div className="flex items-center gap-1 mt-1">
                        <Badge>
                          {selectedImage.type === 'landscape' ? 'Paesaggio' : 
                           selectedImage.type === 'singlePerson' ? 'Persona' : 'Coppia'}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-col gap-3">
                  <div className="bg-muted/50 rounded-lg p-4">
                    <h4 className="font-medium mb-2">Azioni</h4>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <Button 
                        variant="outline" 
                        onClick={() => window.open(selectedImage.url, '_blank')}
                        className="w-full justify-center"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Scarica
                      </Button>
                      
                      <Button 
                        variant="outline"
                        onClick={() => toggleFavorite(selectedImage.id)}
                        className={`w-full justify-center ${selectedImage.isFavorite ? 'bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400' : ''}`}
                      >
                        <Heart className="h-4 w-4 mr-2" fill={selectedImage.isFavorite ? "#ef4444" : "none"} />
                        {selectedImage.isFavorite ? 'Rimuovi' : 'Preferiti'}
                      </Button>
                      
                      <Button 
                        variant="destructive" 
                        onClick={deleteSingleImage}
                        className="w-full justify-center col-span-2"
                      >
                        <Trash className="h-4 w-4 mr-2" />
                        Elimina
                      </Button>
                    </div>
                  </div>
                  
                  {selectedImage.location && (
                    <div className="mt-4">
                      <h4 className="font-medium mb-2">Posizione</h4>
                      <div className="bg-muted h-36 rounded-md">
                        {/* Map placeholder */}
                        <div className="h-full flex items-center justify-center">
                          <MapPin className="h-8 w-8 text-muted-foreground" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      <ImageModal
        open={uploadModalOpen}
        onOpenChange={setUploadModalOpen}
        mode="upload"
        onUpload={handleImageUpload}
        memories={memories}
      />
    </div>
  );
};

export default GalleryPage;

