
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
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Memory, MemoryType, EventTag, Image } from "@/types";
import { useAuth } from '@/context/auth-context';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { 
  CalendarIcon, 
  MapPin, 
  Music, 
  Tag, 
  ImageIcon,
  Plus,
  X
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from 'sonner';

interface MemoryFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (memory: Partial<Memory>) => void;
  memory?: Memory;
  mode: 'create' | 'edit';
}

const MemoryFormModal: React.FC<MemoryFormModalProps> = ({
  open,
  onOpenChange,
  onSave,
  memory,
  mode
}) => {
  const { user, couple } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<MemoryType>('simple');
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [song, setSong] = useState('');
  const [location, setLocation] = useState('');
  const [eventTag, setEventTag] = useState<EventTag | undefined>(undefined);
  const [selectedImageIds, setSelectedImageIds] = useState<string[]>([]);
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);
  
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
      setSelectedImageIds(memory.images.map(img => img.id));
    } else {
      setTitle('');
      setDescription('');
      setType('simple');
      setStartDate(new Date());
      setEndDate(undefined);
      setSong('');
      setLocation('');
      setEventTag(undefined);
      setSelectedImageIds([]);
    }
  }, [memory, mode, open]);

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
      memoryData.images = [];
    }
    
    // Instead of directly assigning image IDs, we'll leave this for the backend
    // to handle. For now, we just store the IDs.
    memoryData.images = selectedImageIds.length > 0 ? [] as Image[] : [];
    
    onSave(memoryData);
    onOpenChange(false);
    toast.success(mode === 'create' ? 'Ricordo creato con successo!' : 'Ricordo aggiornato con successo!');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden bg-background border-none shadow-lg rounded-xl">
        <DialogHeader className="sticky top-0 z-10 bg-background p-4 border-b">
          <DialogTitle className="text-xl font-semibold">
            {mode === 'create' ? 'Crea nuovo ricordo' : 'Modifica ricordo'}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {mode === 'create' 
              ? 'Aggiungi un nuovo ricordo da conservare insieme'
              : 'Modifica i dettagli del ricordo'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium">Titolo *</Label>
            <Input
              id="title"
              placeholder="Titolo del ricordo"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">Descrizione</Label>
            <Textarea
              id="description"
              placeholder="Descrivi questo ricordo..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full resize-none"
            />
          </div>
          
          <div className="space-y-3">
            <Label className="text-sm font-medium">Tipo di ricordo *</Label>
            <RadioGroup value={type} onValueChange={(value: MemoryType) => setType(value)} className="flex flex-wrap gap-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="simple" id="simple" className="text-primary" />
                <Label htmlFor="simple" className="font-normal cursor-pointer">Ricordo semplice</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="event" id="event" className="text-primary" />
                <Label htmlFor="event" className="font-normal cursor-pointer">Evento</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="travel" id="travel" className="text-primary" />
                <Label htmlFor="travel" className="font-normal cursor-pointer">Viaggio</Label>
              </div>
            </RadioGroup>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Data inizio *</Label>
              <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="justify-start text-left font-normal w-full"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 opacity-70" />
                    {startDate ? (
                      format(startDate, 'dd MMMM yyyy', { locale: it })
                    ) : (
                      <span>Seleziona una data</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
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
                <Label className="text-sm font-medium">Data fine {type === 'travel' ? '(opzionale)' : ''}</Label>
                <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="justify-start text-left font-normal w-full"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4 opacity-70" />
                      {endDate ? (
                        format(endDate, 'dd MMMM yyyy', { locale: it })
                      ) : (
                        <span>Seleziona una data</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
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
          
          {type === 'event' && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Tipo di evento</Label>
              <Select 
                value={eventTag || ''} 
                onValueChange={(value) => setEventTag(value as EventTag)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleziona il tipo di evento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="birthday">Compleanno</SelectItem>
                  <SelectItem value="anniversary">Anniversario</SelectItem>
                  <SelectItem value="gift">Regalo</SelectItem>
                  <SelectItem value="holiday">Festività</SelectItem>
                  <SelectItem value="other">Altro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="location" className="text-sm font-medium">Luogo</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
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
            <Label htmlFor="song" className="text-sm font-medium">Canzone (opzionale)</Label>
            <div className="relative">
              <Music className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
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
            <div className="flex justify-between items-center">
              <Label className="text-sm font-medium">Immagini</Label>
              <Button variant="outline" size="sm" className="h-8 gap-1">
                <Plus className="h-3.5 w-3.5" />
                <span>Carica immagini</span>
              </Button>
            </div>
            <div className="border rounded-lg p-4 bg-muted/20">
              {selectedImageIds.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                  <ImageIcon className="h-12 w-12 mb-2 opacity-40" />
                  <p className="text-sm font-medium">Nessuna immagine selezionata</p>
                  <p className="text-xs mt-1">Aggiungi delle immagini al tuo ricordo</p>
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-2">
                  {selectedImageIds.map((id, idx) => (
                    <div key={id} className="relative group">
                      <div className="aspect-square bg-muted rounded-md flex items-center justify-center overflow-hidden">
                        <ImageIcon className="h-6 w-6 text-muted-foreground/50" />
                      </div>
                      <button 
                        className="absolute -top-1 -right-1 bg-background border rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => setSelectedImageIds(prev => prev.filter(i => i !== id))}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        
        <DialogFooter className="sticky bottom-0 z-10 bg-background px-6 py-4 border-t flex flex-wrap items-center justify-between sm:justify-between gap-2">
          <div className="text-sm text-muted-foreground">
            * Campo obbligatorio
          </div>
          <div className="flex items-center space-x-2 ml-auto">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Annulla
            </Button>
            <Button onClick={handleSave} disabled={!title.trim()}>
              {mode === 'create' ? 'Crea' : 'Salva'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MemoryFormModal;
