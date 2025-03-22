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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Memory, MemoryType, EventTag, Image } from "@/types";
import { useAuth } from '@/context/auth-context';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { 
  CalendarIcon, 
  MapPin, 
  Music, 
  Image as ImageIcon,
  Camera,
  Plus,
  X
} from 'lucide-react';

interface MemoryFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (memory: Partial<Memory>, newImages?: File[]) => void;
  memory?: Memory;
  existingImages?: Image[];
  mode: 'create' | 'edit';
}

const MemoryFormModal: React.FC<MemoryFormModalProps> = ({
  open,
  onOpenChange,
  onSave,
  memory,
  existingImages = [],
  mode
}) => {
  const { user, couple } = useAuth();
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<MemoryType>('simple');
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [song, setSong] = useState('');
  const [location, setLocation] = useState('');
  const [eventTag, setEventTag] = useState<EventTag | undefined>(undefined);
  
  // Image handling
  const [files, setFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [selectedExistingImages, setSelectedExistingImages] = useState<string[]>([]);
  
  // UI state
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);
  
  // Initialize form with existing data
  useEffect(() => {
    if (memory && mode === 'edit') {
      setTitle(memory.title);
      setDescription(memory.description || '');
      setType(memory.type);
      setStartDate(new Date(memory.startDate));
      setEndDate(memory.endDate ? new Date(memory.endDate) : undefined);
      setSong(memory.song || '');
      setLocation(memory.location?.name || '');
      setEventTag(memory.eventTag);
      
      // Pre-select all existing images
      if (memory.images && memory.images.length > 0) {
        setSelectedExistingImages(memory.images.map(img => img.id));
      }
    } else {
      // Default values for create mode
      setTitle('');
      setDescription('');
      setType('simple');
      setStartDate(new Date());
      setEndDate(undefined);
      setSong('');
      setLocation('');
      setEventTag(undefined);
      setSelectedExistingImages([]);
    }
    
    // Reset file uploads when modal opens/closes
    setFiles([]);
    setPreviewUrls([]);
    
  }, [memory, mode, open]);
  
  // Generate preview URLs for selected files
  useEffect(() => {
    if (files.length > 0) {
      const newPreviewUrls = files.map(file => URL.createObjectURL(file));
      setPreviewUrls(newPreviewUrls);
      
      // Clean up URLs when component unmounts
      return () => {
        newPreviewUrls.forEach(url => URL.revokeObjectURL(url));
      };
    }
  }, [files]);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      setFiles(prevFiles => [...prevFiles, ...selectedFiles]);
    }
  };
  
  const removeFile = (index: number) => {
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
    URL.revokeObjectURL(previewUrls[index]);
    setPreviewUrls(prevUrls => prevUrls.filter((_, i) => i !== index));
  };
  
  const toggleExistingImage = (imageId: string) => {
    setSelectedExistingImages(prev => 
      prev.includes(imageId) 
        ? prev.filter(id => id !== imageId) 
        : [...prev, imageId]
    );
  };
  
  const handleSave = () => {
    if (!title.trim()) return;
    
    const memoryData: Partial<Memory> = {
      title: title.trim(),
      description: description.trim() || undefined,
      type,
      startDate,
      endDate,
      song: song.trim() || undefined,
    };
    
    if (location.trim()) {
      memoryData.location = {
        latitude: 45.4642, // Example coordinates for Milano
        longitude: 9.1900,
        name: location.trim()
      };
    }
    
    if (type === 'event' && eventTag) {
      memoryData.eventTag = eventTag;
    }
    
    if (mode === 'create' && user && couple) {
      memoryData.userId = user.id;
      memoryData.creatorName = user.name;
      memoryData.coupleId = couple.id;
      memoryData.createdAt = new Date();
      memoryData.updatedAt = new Date();
    }
    
    if (mode === 'edit' && memory) {
      // For edit mode, include selected existing images
      memoryData.imageIds = selectedExistingImages;
    }
    
    console.log(`Memory ${mode === 'create' ? 'created' : 'updated'}:`, memoryData);
    onSave(memoryData, files.length > 0 ? files : undefined);
    onOpenChange(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Crea nuovo ricordo' : 'Modifica ricordo'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create' 
              ? 'Aggiungi un nuovo ricordo da conservare insieme'
              : 'Modifica le informazioni del ricordo'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[60vh] overflow-y-auto py-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Titolo*</Label>
              <Input
                id="title"
                placeholder="Titolo del ricordo"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Descrizione</Label>
              <Textarea
                id="description"
                placeholder="Descrivi questo ricordo..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Tipo di ricordo*</Label>
              <RadioGroup value={type} onValueChange={(value: MemoryType) => setType(value)}>
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="simple" id="simple" />
                    <Label htmlFor="simple">Ricordo semplice</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="event" id="event" />
                    <Label htmlFor="event">Evento</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="travel" id="travel" />
                    <Label htmlFor="travel">Viaggio</Label>
                  </div>
                </div>
              </RadioGroup>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="startDate">Data inizio*</Label>
              <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? (
                      format(startDate, 'dd MMMM yyyy', { locale: it })
                    ) : (
                      <span>Seleziona una data</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={(date) => {
                      if (date) {
                        setStartDate(date);
                        setStartDateOpen(false);
                      }
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            {(type === 'travel' || type === 'event') && (
              <div className="space-y-2">
                <Label htmlFor="endDate">Data fine {type === 'travel' ? '(opzionale)' : ''}</Label>
                <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? (
                        format(endDate, 'dd MMMM yyyy', { locale: it })
                      ) : (
                        <span>Seleziona una data</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={(date) => {
                        setEndDate(date);
                        setEndDateOpen(false);
                      }}
                      disabled={(date) => date < startDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}
          </div>
          
          <div className="space-y-4">
            {type === 'event' && (
              <div className="space-y-2">
                <Label>Tipo di evento</Label>
                <RadioGroup value={eventTag || ''} onValueChange={(value: EventTag) => setEventTag(value)}>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="birthday" id="birthday" />
                      <Label htmlFor="birthday">Compleanno</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="anniversary" id="anniversary" />
                      <Label htmlFor="anniversary">Anniversario</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="gift" id="gift" />
                      <Label htmlFor="gift">Regalo</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="holiday" id="holiday" />
                      <Label htmlFor="holiday">Festività</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="other" id="other" />
                      <Label htmlFor="other">Altro</Label>
                    </div>
                  </div>
                </RadioGroup>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="location">Luogo</Label>
              <div className="flex items-center relative">
                <MapPin className="h-4 w-4 absolute left-3 text-muted-foreground" />
                <Input
                  id="location"
                  placeholder="Dove è successo?"
                  className="pl-10"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="song">Canzone (opzionale)</Label>
              <div className="flex items-center relative">
                <Music className="h-4 w-4 absolute left-3 text-muted-foreground" />
                <Input
                  id="song"
                  placeholder="Canzone che vi ricorda questo momento"
                  className="pl-10"
                  value={song}
                  onChange={(e) => setSong(e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Immagini</Label>
              <div className="border-2 border-dashed rounded-md p-4">
                <div className="flex flex-col items-center justify-center text-center">
                  <ImageIcon className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Carica nuove immagini o seleziona quelle esistenti
                  </p>
                  <Button size="sm">
                    <label className="cursor-pointer flex items-center">
                      <Camera className="h-4 w-4 mr-2" />
                      <span>Carica immagini</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                  </Button>
                </div>
              </div>
              
              {/* Show preview of selected files */}
              {previewUrls.length > 0 && (
                <div>
                  <Label className="text-sm">Nuove immagini ({previewUrls.length})</Label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {previewUrls.map((url, index) => (
                      <div key={index} className="relative group">
                        <img 
                          src={url} 
                          alt={`Preview ${index}`} 
                          className="w-full h-20 object-cover rounded-md" 
                        />
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-70 hover:opacity-100"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Existing images (only in edit mode) */}
              {mode === 'edit' && existingImages.length > 0 && (
                <div>
                  <Label className="text-sm">Immagini esistenti ({existingImages.length})</Label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {existingImages.map((img) => (
                      <div 
                        key={img.id} 
                        className={`relative cursor-pointer rounded-md overflow-hidden border-2 ${
                          selectedExistingImages.includes(img.id) 
                            ? 'border-primary' 
                            : 'border-transparent'
                        }`}
                        onClick={() => toggleExistingImage(img.id)}
                      >
                        <img 
                          src={img.thumbnailUrl} 
                          alt={img.name} 
                          className="w-full h-20 object-cover" 
                        />
                        {selectedExistingImages.includes(img.id) && (
                          <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                            <Plus className="h-6 w-6 text-primary" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annulla
          </Button>
          <Button onClick={handleSave} disabled={!title.trim()}>
            {mode === 'create' ? 'Crea ricordo' : 'Salva modifiche'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MemoryFormModal;
