// Import the necessary Dialog components
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Download } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, ImageIcon, X } from 'lucide-react';
import { Image as ImageType, Image } from '@/types';
import { mockImages } from './MemoriesPage';
import { AspectRatio } from "@/components/ui/aspect-ratio"

const GalleryPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterDate, setFilterDate] = useState<DateRange | undefined>({
    from: new Date(2020, 0, 1),
    to: new Date(),
  });
  const [filterLocation, setFilterLocation] = useState('');
  const [images, setImages] = useState<Image[]>([]);
  const [selectedImage, setSelectedImage] = useState<Image | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  useEffect(() => {
    // Apply filters to mockImages
    let filteredImages = mockImages;
    
    if (searchTerm) {
      filteredImages = filteredImages.filter(img =>
        img.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (filterType !== 'all') {
      filteredImages = filteredImages.filter(img => img.type === filterType);
    }
    
    if (filterDate?.from && filterDate?.to) {
      filteredImages = filteredImages.filter(img => {
        const imageDate = new Date(img.date);
        return imageDate >= filterDate.from! && imageDate <= filterDate.to!;
      });
    }
    
    if (filterLocation) {
      filteredImages = filteredImages.filter(img =>
        img.location?.name?.toLowerCase().includes(filterLocation.toLowerCase())
      );
    }
    
    setImages(filteredImages);
  }, [searchTerm, filterType, filterDate, filterLocation]);
  
  const handleImageClick = (image: Image) => {
    setSelectedImage(image);
    setIsDialogOpen(true);
  };
  
  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedImage(null);
  };

  // Fix the type issue by casting the setter function
  const handleFilterTypeChange = (value: string) => {
    setFilterType(value as 'all' | ImageType);
  };
  
  return (
    <div className="container mx-auto px-4 py-6 animate-fade-in">
      <div className="mb-6">
        <h1 className="text-4xl font-bold">Galleria</h1>
        <p className="text-muted-foreground mt-1">
          Esplora tutti i tuoi ricordi visivi
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Filters Section */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Filtri</CardTitle>
              <CardDescription>
                Applica filtri per trovare le immagini che stai cercando
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="search">Cerca</Label>
                <Input
                  type="text"
                  id="search"
                  placeholder="Cerca per nome"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="type">Tipo</Label>
                <Select onValueChange={handleFilterTypeChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Tutti" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tutti</SelectItem>
                    <SelectItem value="landscape">Paesaggio</SelectItem>
                    <SelectItem value="singlePerson">Persona Singola</SelectItem>
                    <SelectItem value="couple">Coppia</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Data</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !filterDate?.from ? "text-muted-foreground" : ""
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filterDate?.from ? (
                        filterDate.to ? (
                          `${format(filterDate.from, "dd/MM/yyyy")} - ${format(filterDate.to, "dd/MM/yyyy")}`
                        ) : (
                          format(filterDate.from, "dd/MM/yyyy")
                        )
                      ) : (
                        <span>Scegli una data</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="range"
                      defaultMonth={filterDate?.from}
                      selected={filterDate}
                      onSelect={setFilterDate}
                      disabled={{ before: new Date(2019, 0, 1) }}
                      numberOfMonths={2}
                      pagedNavigation
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div>
                <Label htmlFor="location">Luogo</Label>
                <Input
                  type="text"
                  id="location"
                  placeholder="Cerca per luogo"
                  value={filterLocation}
                  onChange={(e) => setFilterLocation(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Gallery Section */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Immagini</CardTitle>
              <CardDescription>
                {images.length} immagini trovate
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {images.map((image) => (
                <div 
                  key={image.id} 
                  className="relative cursor-pointer"
                  onClick={() => handleImageClick(image)}
                >
                  <AspectRatio ratio={1 / 1}>
                    <img
                      src={image.thumbnailUrl}
                      alt={image.name}
                      className="object-cover rounded-md aspect-video hover:opacity-75 transition-opacity duration-200"
                    />
                  </AspectRatio>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Image Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[70%] lg:max-w-[50%] xl:max-w-[40%]">
          <div className="absolute top-2 right-2 z-10 rounded-sm outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 data-[state=open]:bg-secondary">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCloseDialog}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {selectedImage && (
            <div className="flex flex-col">
              <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0 lg:text-4xl">
                {selectedImage.name}
              </h2>
              
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <ImageIcon className="h-4 w-4" />
                {selectedImage.type}
              </p>
              
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <CalendarIcon className="h-4 w-4" />
                {format(new Date(selectedImage.date), 'dd/MM/yyyy')}
              </p>
              
              <AspectRatio ratio={16 / 9}>
                <img
                  src={selectedImage.url}
                  alt={selectedImage.name}
                  className="object-cover rounded-md aspect-video mt-4"
                />
              </AspectRatio>
              
              <Button variant="link" className="mt-4 justify-start">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GalleryPage;
