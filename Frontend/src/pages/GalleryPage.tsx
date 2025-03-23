
import React, { useState, useEffect } from 'react';
import { imagesApi } from '@/services/api';
import { Image as ImageType } from '@/types';
import { useAuth } from '@/context/auth-context';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, ImagePlus, Search, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { Card, CardContent } from "@/components/ui/card"
import ImageGrid from '@/components/gallery/ImageGrid';
import ImageUploadModal from '@/components/modals/ImageUploadModal';
import { useToast } from "@/components/ui/use-toast";

const GalleryPage: React.FC = () => {
  const { couple } = useAuth();
  const [images, setImages] = useState<ImageType[]>([]);
  const [filter, setFilter] = useState('');
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [isImageUploadModalOpen, setIsImageUploadModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  useEffect(() => {
    if (couple) {
      fetchImages(couple.id);
    }
  }, [couple, filter, date]);
  
  const fetchImages = async (coupleId: string) => {
    try {
      setLoading(true);
      const filters: { type?: string; startDate?: Date; endDate?: Date } = {};
      if (filter) filters.type = filter;
      if (date) {
        filters.startDate = date;
        filters.endDate = date;
      }
      
      const fetchedImages = await imagesApi.getImages(coupleId, filters);
      setImages(fetchedImages);
    } catch (error: any) {
      console.error('Failed to fetch images:', error);
      toast({
        title: "Errore",
        description: "Impossibile caricare le immagini",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleImageUpload = async (files: File[], imageData: Partial<ImageType>) => {
    if (!couple) return;
    
    try {
      const formData = new FormData();
      files.forEach(file => formData.append('images', file));
      
      // Append text data as strings
      formData.append('name', imageData.name || '');
      formData.append('type', imageData.type || 'landscape');
      formData.append('coupleId', couple.id);
      formData.append('date', imageData.date?.toISOString() || new Date().toISOString());
      
      if (imageData.memoryId) {
        formData.append('memoryId', imageData.memoryId);
      }
      
      if (imageData.location?.name) {
        formData.append('locationName', imageData.location.name);
        formData.append('latitude', imageData.location.latitude?.toString() || '');
        formData.append('longitude', imageData.location.longitude?.toString() || '');
      }
      
      await imagesApi.uploadImage(formData);
      toast({
        title: "Successo",
        description: `${files.length} immagini caricate con successo`,
      });
      fetchImages(couple.id); // Refresh images
    } catch (error: any) {
      console.error('Image upload failed:', error);
      toast({
        title: "Errore",
        description: "Impossibile caricare le immagini. " + (error.response?.data?.message || error.message),
        variant: "destructive",
      });
    }
  };
  
  const clearFilter = () => {
    setFilter('');
    setDate(undefined);
  };
  
  return (
    <div className="container mx-auto py-10">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Galleria</h1>
        <Button onClick={() => setIsImageUploadModalOpen(true)}>
          <ImagePlus className="mr-2 h-4 w-4" />
          Aggiungi Immagini
        </Button>
      </div>
      
      <Card className="mb-6">
        <CardContent className="p-4 flex flex-col md:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Cerca per tipo (landscape, singlePerson, couple)"
              className="pl-10"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={
                  "justify-start text-left font-normal w-full md:w-[280px] pl-2" +
                  (date ? " text-foreground" : " text-muted-foreground")
                }
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? (
                  format(date, "dd MMMM yyyy", { locale: it })
                ) : (
                  <span>Scegli una data</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          
          {(filter || date) && (
            <Button variant="ghost" size="sm" onClick={clearFilter} className="mt-2 md:mt-0">
              Cancella filtri
            </Button>
          )}
        </CardContent>
      </Card>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-lg">Caricamento immagini...</span>
        </div>
      ) : images.length > 0 ? (
        <ImageGrid images={images} />
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">Nessuna immagine trovata</p>
          {(filter || date) && (
            <p className="text-sm text-muted-foreground mt-1">Prova a modificare i filtri di ricerca</p>
          )}
          <Button 
            variant="outline" 
            onClick={() => setIsImageUploadModalOpen(true)}
            className="mt-4"
          >
            <ImagePlus className="mr-2 h-4 w-4" />
            Carica la tua prima immagine
          </Button>
        </div>
      )}
      
      <ImageUploadModal
        open={isImageUploadModalOpen}
        onOpenChange={setIsImageUploadModalOpen}
        onUpload={handleImageUpload}
      />
    </div>
  );
};

export default GalleryPage;
