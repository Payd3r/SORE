import React, { useState, useMemo, useEffect } from 'react';
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
  Grid,
  User,
  Trash,
  Check
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
import { Image as ImageType, ImageType as ImageCategory, Memory } from '@/types';
import { format } from 'date-fns';
import { useAuth } from '@/context/auth-context';
import { toast } from 'sonner';
import ImageModal from '@/components/modals/ImageModal';

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
      return matchesSearch && matchesType && matchesUser;
    });
  }, [images, searchTerm, selectedType, selectedUser]);
  
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

  const renderImageGrid = () => {
    const columns = gridSize === 'small' ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6' :
                   gridSize === 'medium' ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4' :
                   'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
    
    const height = gridSize === 'small' ? 'h-40' :
                 gridSize === 'medium' ? 'h-56' :
                 'h-80';
    
    return (
      <div className={`grid ${columns} gap-3 md:gap-4`}>
        {sortedImages.map((image) => (
          <div 
            key={image.id} 
            className={`${height} rounded-lg overflow-hidden relative cursor-pointer group card-hover ${
              isSelectionMode && selectedImages.includes(image.id) ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => handleImageClick(image)}
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
                <div className="flex justify-between items-center">
                  <p className="text-xs opacity-80">{format(new Date(image.date), 'dd/MM/yyyy')}</p>
                  <p className="text-xs opacity-80">{image.uploaderName}</p>
                </div>
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
            <div className="absolute top-2 left-2 flex flex-col gap-1">
              {image.type && (
                <Badge variant="secondary" className="bg-black/50 text-white border-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {image.type === 'landscape' ? 'Paesaggio' : 
                   image.type === 'singlePerson' ? 'Persona' : 'Coppia'}
                </Badge>
              )}
              {image.location && (
                <Badge variant="secondary" className="bg-black/50 text-white border-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <MapPin className="h-3 w-3 mr-1" />
                </Badge>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };
  
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
                  className={`h-48 rounded-lg overflow-hidden relative cursor-pointer group card-hover ${
                    isSelectionMode && selectedImages.includes(image.id) ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => handleImageClick(image)}
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
                      <div className="flex justify-between items-center">
                        <p className="text-xs opacity-80">{format(new Date(image.date), 'dd/MM/yyyy')}</p>
                        <p className="text-xs opacity-80">{image.uploaderName}</p>
                      </div>
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
                  <div className="absolute top-2 left-2 flex flex-col gap-1">
                    {image.type && (
                      <Badge variant="secondary" className="bg-black/50 text-white border-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        {image.type === 'landscape' ? 'Paesaggio' : 
                         image.type === 'singlePerson' ? 'Persona singola' : 'Coppia'}
                      </Badge>
                    )}
                    {image.location && (
                      <Badge variant="secondary" className="bg-black/50 text-white border-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <MapPin className="h-3 w-3 mr-1" />
                      </Badge>
                    )}
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
            Esplora i ricordi fotografici della coppia
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {isSelectionMode ? (
            <>
              <Button variant="outline" onClick={toggleSelectionMode}>
                Annulla
              </Button>
              <Button 
                variant="destructive" 
                onClick={deleteSelectedImages}
                disabled={selectedImages.length === 0}
                className="flex items-center"
              >
                <Trash className="mr-2 h-4 w-4" />
                Elimina ({selectedImages.length})
              </Button>
              <Button
                variant="outline"
                onClick={selectAllImages}
              >
                {selectedImages.length === sortedImages.length ? 'Deseleziona tutto' : 'Seleziona tutto'}
              </Button>
            </>
          ) : (
            <>
              <Button 
                variant="outline" 
                onClick={toggleSelectionMode}
                className="flex items-center"
              >
                <Check className="mr-2 h-4 w-4" />
                Seleziona
              </Button>
              <Button 
                onClick={() => setUploadModalOpen(true)}
                className="flex items-center"
              >
                <Upload className="mr-2 h-4 w-4" />
                Carica Immagini
              </Button>
            </>
          )}
        </div>
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
          
          <div className="flex flex-wrap gap-2">
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
                <DropdownMenuItem onClick={() => setSelectedType('landscape')}>
                  Paesaggio
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedType('singlePerson')}>
                  Persona singola
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedType('couple')}>
                  Coppia
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            {uploaders.length > 1 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    Fotografo
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setSelectedUser('all')}>
                    Tutti
                  </DropdownMenuItem>
                  {uploaders.map(uploader => (
                    <DropdownMenuItem 
                      key={uploader.id} 
                      onClick={() => setSelectedUser(uploader.id)}
                    >
                      {uploader.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            
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
        
        {(selectedType !== 'all' || selectedUser !== 'all') && (
          <div className="flex items-center flex-wrap gap-2">
            <span className="text-sm text-muted-foreground">Filtri attivi:</span>
            {selectedType !== 'all' && (
              <Badge 
                variant="secondary" 
                className="cursor-pointer"
                onClick={() => setSelectedType('all')}
              >
                {selectedType === 'landscape' ? 'Paesaggio' : 
                 selectedType === 'singlePerson' ? 'Persona singola' : 'Coppia'}
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
                {searchTerm || selectedType !== 'all' || selectedUser !== 'all'
                  ? 'Prova a modificare i filtri o a cercare altro.' 
                  : 'Inizia a caricare le immagini dei momenti speciali della coppia.'}
              </p>
              <Button onClick={() => setUploadModalOpen(true)}>
                <Upload className="mr-2 h-4 w-4" />
                Carica Immagini
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
                {searchTerm || selectedType !== 'all' || selectedUser !== 'all'
                  ? 'Prova a modificare i filtri o a cercare altro.' 
                  : 'Inizia a caricare le immagini dei momenti speciali.'}
              </p>
              <Button onClick={() => setUploadModalOpen(true)}>
                <Upload className="mr-2 h-4 w-4" />
                Carica Immagini
              </Button>
            </div>
          ) : renderTimelineView()}
        </TabsContent>
      </Tabs>
      
      <ImageModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        image={selectedImage || undefined}
        mode="view"
        onDelete={deleteSingleImage}
        onEdit={updateImage}
        memories={memories}
      />
      
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
