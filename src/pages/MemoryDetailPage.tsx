
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Memory, MemoryType, EventTag, GeoLocation } from '@/types';
import { 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  Music2, 
  Share2, 
  BookMarked,
  Edit,
  Trash,
  ChevronLeft,
  ChevronRight,
  Image,
  User,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { MemoryMap } from '@/components/memories/MemoryMap';
import { MemoryTimeline } from '@/components/memories/MemoryTimeline';
import { MemoryGallery } from '@/components/memories/MemoryGallery';
import MemoryFormModal from '@/components/modals/MemoryFormModal';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/components/ui/use-toast';

// This would be fetched from a real API
// Mock data to match the one from MemoriesPage
import { mockMemories } from './MemoriesPage';

const MemoryDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [memory, setMemory] = useState<Memory | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const { toast } = useToast();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    // Simulate API call to fetch memory details
    const fetchMemory = async () => {
      setLoading(true);
      try {
        // In a real app, this would be an API call
        const foundMemory = mockMemories.find(m => m.id === id);
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        if (foundMemory) {
          setMemory(foundMemory);
          setCurrentImageIndex(0);
        }
      } catch (error) {
        console.error("Error fetching memory:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchMemory();
    }
  }, [id]);

  // Handle image carousel
  const nextImage = () => {
    if (memory && memory.images.length > 0) {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === memory.images.length - 1 ? 0 : prevIndex + 1
      );
    }
  };

  const prevImage = () => {
    if (memory && memory.images.length > 0) {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === 0 ? memory.images.length - 1 : prevIndex - 1
      );
    }
  };

  // Handle edit memory
  const handleEditMemory = (updatedMemory: Partial<Memory>) => {
    if (memory) {
      console.log("Memory updated:", updatedMemory);
      
      // In a real app, this would be an API call
      const updated = { ...memory, ...updatedMemory, updatedAt: new Date() };
      setMemory(updated);
      
      toast({
        title: "Ricordo aggiornato",
        description: "Il ricordo è stato aggiornato con successo.",
      });
      
      setEditModalOpen(false);
    }
  };

  // Handle delete memory
  const handleDeleteMemory = () => {
    if (!memory) return;
    
    console.log("Memory deleted:", memory.id);
    
    // In a real app, this would be an API call
    toast({
      title: "Ricordo eliminato",
      description: "Il ricordo è stato eliminato con successo.",
      variant: "destructive",
    });
    
    // Redirect back to memories page
    window.location.href = "/memories";
  };

  // Memory type styles 
  const typeStyles: Record<MemoryType, { color: string, icon: React.ReactNode, label: string, bgColor: string }> = {
    'travel': { 
      color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300',
      bgColor: 'bg-blue-50 dark:bg-blue-900/10',
      icon: <BookMarked className="h-5 w-5" />,
      label: 'Viaggio'
    },
    'event': { 
      color: 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-300',
      bgColor: 'bg-pink-50 dark:bg-pink-900/10',
      icon: <Calendar className="h-5 w-5" />,
      label: 'Evento'
    },
    'simple': { 
      color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-300',
      bgColor: 'bg-green-50 dark:bg-green-900/10',
      icon: <MapPin className="h-5 w-5" />,
      label: 'Ricordo'
    }
  };

  // Tag styles
  const tagStyles: Record<EventTag, { color: string, label: string }> = {
    'birthday': { 
      color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-300',
      label: 'Compleanno'
    },
    'gift': { 
      color: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-300',
      label: 'Regalo'
    },
    'anniversary': { 
      color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-300',
      label: 'Anniversario'
    },
    'holiday': { 
      color: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-300',
      label: 'Vacanza'
    },
    'other': { 
      color: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
      label: 'Altro'
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-2 sm:px-4 py-6 flex items-center justify-center min-h-[50vh]">
        <div className="animate-pulse space-y-6 w-full max-w-3xl">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-72 bg-muted rounded"></div>
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="h-48 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (!memory) {
    return (
      <div className="container mx-auto px-2 sm:px-4 py-6 text-center min-h-[50vh] flex flex-col items-center justify-center">
        <BookMarked className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">Ricordo non trovato</h2>
        <p className="text-muted-foreground mb-6">
          Il ricordo che stai cercando non esiste o è stato rimosso.
        </p>
        <Button asChild>
          <Link to="/memories">Torna ai ricordi</Link>
        </Button>
      </div>
    );
  }

  // Extract locations for map
  const locations: GeoLocation[] = [];
  if (memory.location) {
    locations.push(memory.location);
  }
  
  // Extract unique locations from images
  memory.images.forEach(img => {
    if (img.location && !locations.some(loc => 
      loc.latitude === img.location?.latitude && 
      loc.longitude === img.location?.longitude
    )) {
      locations.push(img.location);
    }
  });

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6 animate-fade-in max-w-6xl">
      {/* Header with back button */}
      <div className="mb-4 sm:mb-6 flex flex-col space-y-4">
        <Button variant="ghost" size="sm" asChild className="self-start">
          <Link to="/memories" className="flex items-center">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Torna ai ricordi
          </Link>
        </Button>
        
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <Badge className={typeStyles[memory.type].color}>
                <span className="flex items-center">
                  {typeStyles[memory.type].icon}
                  <span className="ml-1">{typeStyles[memory.type].label}</span>
                </span>
              </Badge>
              
              {memory.eventTag && (
                <Badge className={tagStyles[memory.eventTag].color}>
                  {tagStyles[memory.eventTag].label}
                </Badge>
              )}
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold">{memory.title}</h1>
            
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3 text-muted-foreground text-sm">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                <span>
                  {format(memory.startDate, 'dd/MM/yyyy')}
                  {memory.endDate && ` - ${format(memory.endDate, 'dd/MM/yyyy')}`}
                </span>
              </div>
              
              {memory.location?.name && (
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{memory.location.name}</span>
                </div>
              )}
              
              {memory.song && (
                <div className="flex items-center">
                  <Music2 className="h-4 w-4 mr-1" />
                  <span>{memory.song}</span>
                </div>
              )}
              
              {memory.creatorName && (
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-1" />
                  <span>Creato da {memory.creatorName}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="outline"
              onClick={() => setEditModalOpen(true)}
            >
              <Edit className="mr-2 h-4 w-4" />
              Modifica
            </Button>
            <Button 
              variant="destructive"
              onClick={() => setDeleteDialogOpen(true)}
            >
              <Trash className="mr-2 h-4 w-4" />
              Elimina
            </Button>
          </div>
        </div>
      </div>

      {/* Featured images carousel */}
      <div className="mb-8 rounded-xl overflow-hidden shadow-md relative">
        {memory.images.length > 0 ? (
          <div className="aspect-video relative group">
            <img 
              src={memory.images[currentImageIndex].url} 
              alt={memory.images[currentImageIndex].name}
              className="w-full h-full object-cover"
              style={{ objectPosition: 'center' }}
            />
            <div className="absolute inset-0 flex flex-col justify-end p-6 bg-gradient-to-t from-black/70 via-black/30 to-transparent">
              <div className="text-white">
                <div className="text-lg font-medium">{memory.images[currentImageIndex].name}</div>
                <div className="text-sm opacity-90 flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {format(memory.images[currentImageIndex].date, 'dd/MM/yyyy HH:mm')}
                </div>
                <div className="mt-1 text-sm opacity-90">
                  {currentImageIndex + 1} di {memory.images.length}
                </div>
              </div>
            </div>
            
            {/* Carousel navigation buttons */}
            {memory.images.length > 1 && (
              <>
                <button 
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button 
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Next image"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
                
                {/* Image indicators */}
                <div className="absolute bottom-4 right-4 flex gap-1">
                  {memory.images.slice(0, Math.min(5, memory.images.length)).map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`w-2 h-2 rounded-full ${
                        idx === currentImageIndex ? 'bg-white' : 'bg-white/50'
                      }`}
                      aria-label={`Go to image ${idx + 1}`}
                    />
                  ))}
                  {memory.images.length > 5 && (
                    <span className="text-xs text-white">+{memory.images.length - 5}</span>
                  )}
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="aspect-video bg-muted flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <Image className="h-12 w-12 mx-auto mb-2" />
              <p>Nessuna immagine disponibile</p>
            </div>
          </div>
        )}
      </div>

      {/* Tabs for different views */}
      <div className="bg-card shadow-sm rounded-xl overflow-hidden mb-10">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full grid grid-cols-3 rounded-none bg-muted/50">
            <TabsTrigger value="overview" className="data-[state=active]:bg-background">Panoramica</TabsTrigger>
            <TabsTrigger value="timeline" className="data-[state=active]:bg-background">Cronologia</TabsTrigger>
            <TabsTrigger value="gallery" className="data-[state=active]:bg-background">Galleria</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="p-6 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className={`rounded-xl p-6 ${typeStyles[memory.type].bgColor}`}>
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  {typeStyles[memory.type].icon}
                  <span className="ml-2">Dettagli del ricordo</span>
                </h3>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-[120px_1fr] gap-2">
                    <div className="text-muted-foreground">Tipo:</div>
                    <div className="font-medium">{typeStyles[memory.type].label}</div>
                    
                    <div className="text-muted-foreground">Data:</div>
                    <div>
                      {format(memory.startDate, 'dd/MM/yyyy')}
                      {memory.endDate && ` - ${format(memory.endDate, 'dd/MM/yyyy')}`}
                    </div>
                    
                    {memory.eventTag && (
                      <>
                        <div className="text-muted-foreground">Occasione:</div>
                        <div>{tagStyles[memory.eventTag].label}</div>
                      </>
                    )}
                    
                    {memory.location?.name && (
                      <>
                        <div className="text-muted-foreground">Luogo:</div>
                        <div>{memory.location.name}</div>
                      </>
                    )}
                    
                    {memory.song && (
                      <>
                        <div className="text-muted-foreground">Canzone:</div>
                        <div>{memory.song}</div>
                      </>
                    )}
                    
                    <div className="text-muted-foreground">Creato da:</div>
                    <div>{memory.creatorName || 'Utente'}</div>
                    
                    <div className="text-muted-foreground">Creato il:</div>
                    <div>{format(memory.createdAt, 'dd/MM/yyyy')}</div>
                    
                    <div className="text-muted-foreground">Immagini:</div>
                    <div>{memory.images.length}</div>
                  </div>
                  
                  {memory.description && (
                    <div>
                      <h4 className="text-muted-foreground mb-1">Descrizione:</h4>
                      <p>{memory.description}</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <Image className="h-5 w-5 mr-2" />
                  Galleria fotografica
                </h3>
                
                <div className="grid grid-cols-3 gap-2">
                  {memory.images.slice(0, 6).map((image, index) => (
                    <div 
                      key={image.id} 
                      className="relative aspect-square rounded-md overflow-hidden cursor-pointer image-hover-zoom"
                      onClick={() => setActiveTab('gallery')}
                    >
                      <img 
                        src={image.thumbnailUrl} 
                        alt={`Immagine ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      {index === 5 && memory.images.length > 6 && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-medium">
                          +{memory.images.length - 6}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                
                <Button 
                  variant="outline" 
                  className="w-full mt-4" 
                  onClick={() => setActiveTab('gallery')}
                >
                  Visualizza tutte le immagini
                </Button>
                
                {locations.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-xl font-semibold mb-4 flex items-center">
                      <MapPin className="h-5 w-5 mr-2" />
                      Mappa dei luoghi
                    </h3>
                    <div className="h-48 rounded-md overflow-hidden">
                      <MemoryMap 
                        locations={locations} 
                        images={memory.images} 
                        title={memory.title} 
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="timeline" className="p-6 animate-fade-in">
            <MemoryTimeline images={memory.images} />
          </TabsContent>

          <TabsContent value="gallery" className="p-6 animate-fade-in">
            <MemoryGallery images={memory.images} title={memory.title} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Memory edit modal */}
      <MemoryFormModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        onSave={handleEditMemory}
        memory={memory}
        mode="edit"
      />

      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Elimina ricordo</AlertDialogTitle>
            <AlertDialogDescription>
              Sei sicuro di voler eliminare questo ricordo? Questa azione non può essere annullata.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteMemory} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Elimina
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MemoryDetailPage;
