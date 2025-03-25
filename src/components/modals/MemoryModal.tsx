
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
  Tag, 
  Image as ImageIcon,
  Trash,
  Pencil,
  Save
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface MemoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (memory: Partial<Memory>) => void;
  onDelete?: () => void;
  memory?: Memory;
  mode: 'create' | 'view' | 'edit';
}

const MemoryModal: React.FC<MemoryModalProps> = ({
  open,
  onOpenChange,
  onSave,
  onDelete,
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
  const [isEditing, setIsEditing] = useState(mode === 'edit' || mode === 'create');
  
  useEffect(() => {
    if (memory && mode !== 'create') {
      setTitle(memory.title);
      setDescription(memory.description || '');
      setType(memory.type);
      setStartDate(new Date(memory.startDate));
      setEndDate(memory.endDate ? new Date(memory.endDate) : undefined);
      setSong(memory.song || '');
      setLocation(memory.location?.name || '');
      setEventTag(memory.eventTag);
    } else {
      setTitle('');
      setDescription('');
      setType('simple');
      setStartDate(new Date());
      setEndDate(undefined);
      setSong('');
      setLocation('');
      setEventTag(undefined);
    }
    
    setIsEditing(mode === 'edit' || mode === 'create');
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
      memoryData.images = [];
    }
    
    onSave(memoryData);
    
    if (mode === 'view') {
      setIsEditing(false);
    } else {
      onOpenChange(false);
    }
  };

  const handleToggleEdit = () => {
    setIsEditing(!isEditing);
  };

  const handleDelete = () => {
    if (onDelete) {
      console.log('Memory deleted');
      onDelete();
      onOpenChange(false);
    }
  };

  const getTypeLabel = (memoryType: MemoryType) => {
    switch(memoryType) {
      case 'travel': return 'Viaggio';
      case 'event': return 'Evento';
      default: return 'Ricordo';
    }
  };

  const getTypeBadgeColor = (memoryType: MemoryType) => {
    switch(memoryType) {
      case 'travel': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'event': return 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300';
      default: return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
    }
  };

  const getEventTagLabel = (tag?: EventTag) => {
    if (!tag) return '';
    
    switch(tag) {
      case 'birthday': return 'Compleanno';
      case 'anniversary': return 'Anniversario';
      case 'gift': return 'Regalo';
      case 'holiday': return 'Festività';
      default: return 'Altro';
    }
  };

  const getEventTagBadgeColor = (tag?: EventTag) => {
    if (!tag) return '';
    
    switch(tag) {
      case 'birthday': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      case 'anniversary': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'gift': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'holiday': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {mode === 'create' ? 'Crea nuovo ricordo' : mode === 'edit' ? 'Modifica ricordo' : 'Dettagli ricordo'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create' 
              ? 'Aggiungi un nuovo ricordo da conservare insieme'
              : 'Visualizza i dettagli del ricordo'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4 max-h-[60vh] overflow-y-auto">
          {isEditing ? (
            <>
              <div className="space-y-3">
                <Label htmlFor="title" className="text-base">Titolo</Label>
                <Input
                  id="title"
                  placeholder="Titolo del ricordo"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="text-base"
                />
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="description" className="text-base">Descrizione</Label>
                <Textarea
                  id="description"
                  placeholder="Descrivi questo ricordo..."
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="text-base resize-none"
                />
              </div>
              
              <div className="space-y-3">
                <Label className="text-base">Tipo di ricordo</Label>
                <RadioGroup value={type} onValueChange={(value: MemoryType) => setType(value)}>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="flex items-center space-x-2 p-3 rounded-md hover:bg-muted/50 border">
                      <RadioGroupItem value="simple" id="simple" />
                      <Label htmlFor="simple" className="cursor-pointer">Ricordo</Label>
                    </div>
                    <div className="flex items-center space-x-2 p-3 rounded-md hover:bg-muted/50 border">
                      <RadioGroupItem value="event" id="event" />
                      <Label htmlFor="event" className="cursor-pointer">Evento</Label>
                    </div>
                    <div className="flex items-center space-x-2 p-3 rounded-md hover:bg-muted/50 border">
                      <RadioGroupItem value="travel" id="travel" />
                      <Label htmlFor="travel" className="cursor-pointer">Viaggio</Label>
                    </div>
                  </div>
                </RadioGroup>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <Label className="text-base">Data inizio</Label>
                  <Popover>
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
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={(date) => date && setStartDate(date)}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                {(type === 'travel' || type === 'event') && (
                  <div className="space-y-3">
                    <Label className="text-base">Data fine {type === 'travel' ? '(opzionale)' : ''}</Label>
                    <Popover>
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
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={endDate}
                          onSelect={(date) => setEndDate(date)}
                          disabled={(date) => date < startDate}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                )}
              </div>
              
              {type === 'event' && (
                <div className="space-y-3">
                  <Label className="text-base">Tipo di evento</Label>
                  <RadioGroup value={eventTag || ''} onValueChange={(value: EventTag) => setEventTag(value)}>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      <div className="flex items-center space-x-2 p-3 rounded-md hover:bg-muted/50 border">
                        <RadioGroupItem value="birthday" id="birthday" />
                        <Label htmlFor="birthday" className="cursor-pointer">Compleanno</Label>
                      </div>
                      <div className="flex items-center space-x-2 p-3 rounded-md hover:bg-muted/50 border">
                        <RadioGroupItem value="anniversary" id="anniversary" />
                        <Label htmlFor="anniversary" className="cursor-pointer">Anniversario</Label>
                      </div>
                      <div className="flex items-center space-x-2 p-3 rounded-md hover:bg-muted/50 border">
                        <RadioGroupItem value="gift" id="gift" />
                        <Label htmlFor="gift" className="cursor-pointer">Regalo</Label>
                      </div>
                      <div className="flex items-center space-x-2 p-3 rounded-md hover:bg-muted/50 border">
                        <RadioGroupItem value="holiday" id="holiday" />
                        <Label htmlFor="holiday" className="cursor-pointer">Festività</Label>
                      </div>
                      <div className="flex items-center space-x-2 p-3 rounded-md hover:bg-muted/50 border">
                        <RadioGroupItem value="other" id="other" />
                        <Label htmlFor="other" className="cursor-pointer">Altro</Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>
              )}
              
              <div className="space-y-3">
                <Label htmlFor="location" className="text-base">Luogo</Label>
                <div className="flex items-center relative">
                  <MapPin className="h-4 w-4 absolute left-3 text-muted-foreground" />
                  <Input
                    id="location"
                    placeholder="Dove è successo?"
                    className="pl-10 text-base"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="song" className="text-base">Canzone (opzionale)</Label>
                <div className="flex items-center relative">
                  <Music className="h-4 w-4 absolute left-3 text-muted-foreground" />
                  <Input
                    id="song"
                    placeholder="Canzone che vi ricorda questo momento"
                    className="pl-10 text-base"
                    value={song}
                    onChange={(e) => setSong(e.target.value)}
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              <div>
                <div className="flex flex-wrap gap-2 mb-3">
                  <Badge className={`${getTypeBadgeColor(type)}`}>
                    {getTypeLabel(type)}
                  </Badge>
                  
                  {eventTag && (
                    <Badge className={`${getEventTagBadgeColor(eventTag)}`}>
                      <Tag className="h-3 w-3 mr-1" />
                      {getEventTagLabel(eventTag)}
                    </Badge>
                  )}
                </div>
                
                <h3 className="text-2xl font-semibold">{title}</h3>
                
                {memory?.creatorName && (
                  <div className="text-sm text-muted-foreground mt-1">
                    Creato da: {memory.creatorName}
                  </div>
                )}
                
                <div className="mt-4 rounded-lg bg-muted/30 p-4">
                  <p className="whitespace-pre-wrap">{description || "Nessuna descrizione disponibile."}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/20">
                  <div className="min-w-9 min-h-9 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-300">
                    <CalendarIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">Data {type === 'travel' ? 'inizio' : ''}</p>
                    <p className="text-muted-foreground">
                      {startDate ? format(startDate, 'dd MMMM yyyy', { locale: it }) : 'Non specificata'}
                    </p>
                  </div>
                </div>
                
                {endDate && (
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/20">
                    <div className="min-w-9 min-h-9 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-300">
                      <CalendarIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">Data fine</p>
                      <p className="text-muted-foreground">
                        {format(endDate, 'dd MMMM yyyy', { locale: it })}
                      </p>
                    </div>
                  </div>
                )}
              </div>
              
              {(location || memory?.location?.name) && (
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/20">
                  <div className="min-w-9 min-h-9 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600 dark:text-green-300">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">Luogo</p>
                    <p className="text-muted-foreground">
                      {location || memory?.location?.name}
                    </p>
                  </div>
                </div>
              )}
              
              {(song || memory?.song) && (
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/20">
                  <div className="min-w-9 min-h-9 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center text-purple-600 dark:text-purple-300">
                    <Music className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">Canzone</p>
                    <p className="text-muted-foreground">
                      {song || memory?.song}
                    </p>
                  </div>
                </div>
              )}
              
              {memory?.images && memory.images.length > 0 && (
                <div className="mt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <ImageIcon className="h-5 w-5 text-primary" />
                    <h4 className="font-medium">Immagini ({memory.images.length})</h4>
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {memory.images.slice(0, 8).map((image: Image) => (
                      <div key={image.id} className="aspect-square rounded-md overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                        <img 
                          src={image.thumbnailUrl} 
                          alt={image.name} 
                          className="w-full h-full object-cover hover:scale-105 transition-transform"
                        />
                      </div>
                    ))}
                    {memory.images.length > 8 && (
                      <div className="aspect-square rounded-md bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors">
                        <span className="text-base font-medium">+{memory.images.length - 8}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
        
        <DialogFooter className="flex flex-wrap items-center justify-between sm:justify-between gap-2">
          {mode !== 'create' && (
            <div className="flex items-center space-x-2">
              {!isEditing && (
                <>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleToggleEdit}
                    className="flex items-center"
                  >
                    <Pencil className="h-4 w-4 mr-2" />
                    Modifica
                  </Button>
                  
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={handleDelete}
                    className="flex items-center"
                  >
                    <Trash className="h-4 w-4 mr-2" />
                    Elimina
                  </Button>
                </>
              )}
            </div>
          )}
          
          {isEditing && (
            <div className="flex items-center space-x-2 ml-auto">
              {mode !== 'create' && (
                <Button 
                  variant="outline" 
                  onClick={() => {
                    if (mode === 'edit') {
                      setIsEditing(false);
                    } else {
                      onOpenChange(false);
                    }
                  }}
                >
                  Annulla
                </Button>
              )}
              <Button
                onClick={handleSave}
                disabled={!title.trim()}
                className="flex items-center"
              >
                <Save className="h-4 w-4 mr-2" />
                Salva
              </Button>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MemoryModal;
