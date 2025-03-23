
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Image as ImageType, ImageType as ImageCategory, Memory } from "@/types";
import { useAuth } from '@/context/auth-context';
import { format } from 'date-fns';
import { 
  Calendar, 
  MapPin, 
  Image as ImageIcon,
  Trash,
  Download,
  Link2,
  Map
} from 'lucide-react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface ImageModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete?: () => void;
  onEdit?: (data: Partial<ImageType>) => void;
  image?: ImageType;
  mode: 'view' | 'upload';
  onUpload?: (files: File[], data: Partial<ImageType>) => void;
  memories?: Memory[];
}

const ImageModal: React.FC<ImageModalProps> = ({
  open,
  onOpenChange,
  onDelete,
  onEdit,
  image,
  mode,
  onUpload,
  memories
}) => {
  const { user, couple } = useAuth();
  const [files, setFiles] = useState<File[]>([]);
  const [name, setName] = useState('');
  const [type, setType] = useState<ImageCategory>('landscape');
  const [location, setLocation] = useState('');
  const [memoryId, setMemoryId] = useState<string | undefined>(undefined);
  const [mapInstance, setMapInstance] = useState<mapboxgl.Map | null>(null);
  const mapContainer = React.useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (image) {
      setName(image.name);
      setType(image.type || 'landscape');
      setLocation(image.location?.name || '');
      setMemoryId(image.memoryId);
    } else {
      setName('');
      setType('landscape');
      setLocation('');
      setMemoryId(undefined);
    }
    
    return () => {
      if (mapInstance) {
        mapInstance.remove();
        setMapInstance(null);
      }
    };
  }, [image, open]);
  
  // Initialize map when the modal is open and image has location
  useEffect(() => {
    if (open && mode === 'view' && image?.location && mapContainer.current && !mapInstance) {
      const token = localStorage.getItem('mapbox_token') || 'pk.eyJ1IjoiZGVtby11c2VyIiwiYSI6ImNscHFremoyZzAyZnUya3BnZDRmdjk4aTYifQ.iyznFn33gWGrr5YyLAGxQg';
      
      try {
        mapboxgl.accessToken = token;
        
        const map = new mapboxgl.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/streets-v11',
          center: [image.location.longitude, image.location.latitude],
          zoom: 12
        });
        
        // Add marker
        new mapboxgl.Marker()
          .setLngLat([image.location.longitude, image.location.latitude])
          .addTo(map);
        
        setMapInstance(map);
        
        return () => {
          map.remove();
          setMapInstance(null);
        };
      } catch (error) {
        console.error('Error initializing map:', error);
      }
    }
  }, [open, mode, image, mapInstance]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleUpload = () => {
    if (mode === 'upload' && onUpload && files.length > 0 && user && couple) {
      const imageData: Partial<ImageType> = {
        name: name || files[0].name,
        type,
        memoryId,
        userId: user.id,
        uploaderName: user.name,
        coupleId: couple.id,
        date: new Date()
      };
      
      if (location) {
        imageData.location = {
          latitude: 45.4642, // Example coordinates for Milano
          longitude: 9.1900,
          name: location
        };
      }
      
      console.log('Uploading image:', imageData);
      onUpload(files, imageData);
      onOpenChange(false);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      console.log('Image deleted');
      onDelete();
      onOpenChange(false);
    }
  };

  const handleSaveChanges = () => {
    if (onEdit && image) {
      const imageData: Partial<ImageType> = {
        name,
        type,
        memoryId
      };
      
      if (location) {
        imageData.location = {
          latitude: image.location?.latitude || 45.4642,
          longitude: image.location?.longitude || 9.1900,
          name: location
        };
      } else if (image.location) {
        imageData.location = undefined;
      }
      
      console.log('Updating image:', imageData);
      onEdit(imageData);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] backdrop-blur-sm bg-white/60 dark:bg-gray-950/60 border-none shadow-lg">
        <DialogHeader>
          <DialogTitle>
            {mode === 'upload' ? 'Carica nuove immagini' : 'Dettagli immagine'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'upload' 
              ? 'Carica nuove immagini da aggiungere alla galleria'
              : 'Visualizza i dettagli dell\'immagine'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4 max-h-[70vh] overflow-y-auto">
          {mode === 'upload' ? (
            <>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 flex flex-col items-center justify-center">
                  <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
                  <label className="cursor-pointer">
                    <span className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium">
                      Seleziona immagini
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                  <p className="text-sm text-muted-foreground mt-2">
                    {files.length > 0 
                      ? `${files.length} file selezionati` 
                      : 'Trascina qui i file o clicca per selezionarli'}
                  </p>
                </div>
                
                {files.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium mb-2">Anteprima</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {Array.from(files).slice(0, 6).map((file, index) => (
                        <div key={index} className="aspect-square rounded-md overflow-hidden">
                          <img 
                            src={URL.createObjectURL(file)} 
                            alt={file.name} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                      {files.length > 6 && (
                        <div className="aspect-square rounded-md bg-muted flex items-center justify-center">
                          <span className="text-sm font-medium">+{files.length - 6}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome (opzionale)</Label>
                  <Input
                    id="name"
                    placeholder="Nome dell'immagine"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Tipo di immagine</Label>
                  <RadioGroup value={type} onValueChange={(value: ImageCategory) => setType(value)}>
                    <div className="grid grid-cols-1 gap-2">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="landscape" id="landscape" />
                        <Label htmlFor="landscape">Paesaggio</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="singlePerson" id="singlePerson" />
                        <Label htmlFor="singlePerson">Persona singola</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="couple" id="couple" />
                        <Label htmlFor="couple">Coppia</Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="location">Luogo (opzionale)</Label>
                  <div className="flex items-center relative">
                    <MapPin className="h-4 w-4 absolute left-3 text-muted-foreground" />
                    <Input
                      id="location"
                      placeholder="Dove è stata scattata?"
                      className="pl-10"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="memory">Ricordo associato (opzionale)</Label>
                  <div className="flex items-center relative">
                    <Link2 className="h-4 w-4 absolute left-3 text-muted-foreground" />
                    <select
                      id="memory"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 pl-10 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={memoryId || ''}
                      onChange={(e) => setMemoryId(e.target.value || undefined)}
                    >
                      <option value="">Nessun ricordo associato</option>
                      {memories?.map((memory) => (
                        <option key={memory.id} value={memory.id}>
                          {memory.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </>
          ) : (
            image && (
              <>
                <div className="space-y-4">
                  <div className="rounded-md overflow-hidden max-h-[400px] flex items-center justify-center">
                    <img 
                      src={image.url} 
                      alt={image.name} 
                      className="w-full h-auto object-contain"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Button variant="outline" size="sm" className="flex items-center" onClick={() => window.open(image.url, '_blank')}>
                      <Download className="h-4 w-4 mr-2" />
                      Scarica
                    </Button>
                    
                    <Button variant="destructive" size="sm" className="flex items-center" onClick={handleDelete}>
                      <Trash className="h-4 w-4 mr-2" />
                      Elimina
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="imageName" className="text-sm font-medium">Nome</Label>
                    <Input
                      id="imageName"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Data</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(image.date), 'dd/MM/yyyy HH:mm')}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <ImageIcon className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Tipo</p>
                        <RadioGroup 
                          value={type} 
                          onValueChange={(value: ImageCategory) => setType(value)}
                          className="flex flex-row space-x-4 mt-1"
                        >
                          <div className="flex items-center space-x-1">
                            <RadioGroupItem value="landscape" id="landscape-view" />
                            <Label htmlFor="landscape-view">Paesaggio</Label>
                          </div>
                          <div className="flex items-center space-x-1">
                            <RadioGroupItem value="singlePerson" id="singlePerson-view" />
                            <Label htmlFor="singlePerson-view">Persona</Label>
                          </div>
                          <div className="flex items-center space-x-1">
                            <RadioGroupItem value="couple" id="couple-view" />
                            <Label htmlFor="couple-view">Coppia</Label>
                          </div>
                        </RadioGroup>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <Label htmlFor="location-view" className="text-sm font-medium">Luogo</Label>
                    <div className="flex items-center relative">
                      <MapPin className="h-4 w-4 absolute left-3 text-muted-foreground" />
                      <Input
                        id="location-view"
                        placeholder="Nessun luogo specificato"
                        className="pl-10"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  {image.location && (
                    <div className="space-y-1">
                      <Label className="text-sm font-medium flex items-center">
                        <Map className="h-4 w-4 mr-1" />
                        Mappa
                      </Label>
                      <div 
                        ref={mapContainer} 
                        className="h-32 rounded-md overflow-hidden"
                      ></div>
                    </div>
                  )}
                  
                  <div className="space-y-1">
                    <Label htmlFor="memory-view" className="text-sm font-medium">Ricordo associato</Label>
                    <div className="flex items-center relative">
                      <Link2 className="h-4 w-4 absolute left-3 text-muted-foreground" />
                      <select
                        id="memory-view"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 pl-10 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={memoryId || ''}
                        onChange={(e) => setMemoryId(e.target.value || undefined)}
                      >
                        <option value="">Nessun ricordo associato</option>
                        {memories?.map((memory) => (
                          <option key={memory.id} value={memory.id}>
                            {memory.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div className="text-sm text-muted-foreground mt-4">
                    Caricata da: {image.uploaderName || 'Utente sconosciuto'}
                  </div>
                  
                  <Button 
                    className="w-full mt-4" 
                    onClick={handleSaveChanges}
                  >
                    Salva modifiche
                  </Button>
                </div>
              </>
            )
          )}
        </div>
        
        {mode === 'upload' && (
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Annulla
            </Button>
            <Button onClick={handleUpload} disabled={files.length === 0}>
              Carica {files.length > 0 ? `(${files.length})` : ''}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ImageModal;
