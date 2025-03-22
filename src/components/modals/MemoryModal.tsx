
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
  Pencil
} from 'lucide-react';

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
      setType(memory.type);
      setStartDate(new Date(memory.startDate));
      setEndDate(memory.endDate ? new Date(memory.endDate) : undefined);
      setSong(memory.song || '');
      setLocation(memory.location?.name || '');
      setEventTag(memory.eventTag);
    } else {
      setTitle('');
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] backdrop-blur-sm bg-white/60 dark:bg-gray-950/60 border-none shadow-lg">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Crea nuovo ricordo' : mode === 'edit' ? 'Modifica ricordo' : 'Dettagli ricordo'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create' 
              ? 'Aggiungi un nuovo ricordo da conservare insieme'
              : 'Visualizza i dettagli del ricordo'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
          {isEditing ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="title">Titolo</Label>
                <Input
                  id="title"
                  placeholder="Titolo del ricordo"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Tipo di ricordo</Label>
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
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Data inizio</Label>
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
                  <div className="space-y-2">
                    <Label>Data fine {type === 'travel' ? '(opzionale)' : ''}</Label>
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
            </>
          ) : (
            <>
              <div>
                <h3 className="text-xl font-semibold">{title}</h3>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-2 py-1 rounded-full flex items-center">
                    {type === 'simple' ? 'Ricordo semplice' : type === 'event' ? 'Evento' : 'Viaggio'}
                  </span>
                  
                  {eventTag && (
                    <span className="text-sm bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 px-2 py-1 rounded-full flex items-center">
                      <Tag className="h-3 w-3 mr-1" />
                      {eventTag === 'birthday' ? 'Compleanno' :
                       eventTag === 'anniversary' ? 'Anniversario' :
                       eventTag === 'gift' ? 'Regalo' :
                       eventTag === 'holiday' ? 'Festività' : 'Altro'}
                    </span>
                  )}
                </div>
                
                {memory?.creatorName && (
                  <div className="text-sm text-muted-foreground mt-2">
                    Creato da: {memory.creatorName}
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="flex items-center space-x-2">
                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Data {type === 'travel' ? 'inizio' : ''}</p>
                    <p className="text-sm text-muted-foreground">
                      {startDate ? format(startDate, 'dd MMMM yyyy', { locale: it }) : 'Non specificata'}
                    </p>
                  </div>
                </div>
                
                {endDate && (
                  <div className="flex items-center space-x-2">
                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Data fine</p>
                      <p className="text-sm text-muted-foreground">
                        {format(endDate, 'dd MMMM yyyy', { locale: it })}
                      </p>
                    </div>
                  </div>
                )}
              </div>
              
              {(location || memory?.location?.name) && (
                <div className="flex items-center space-x-2 mt-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Luogo</p>
                    <p className="text-sm text-muted-foreground">
                      {location || memory?.location?.name}
                    </p>
                  </div>
                </div>
              )}
              
              {(song || memory?.song) && (
                <div className="flex items-center space-x-2 mt-2">
                  <Music className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Canzone</p>
                    <p className="text-sm text-muted-foreground">
                      {song || memory?.song}
                    </p>
                  </div>
                </div>
              )}
              
              {memory?.images && memory.images.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2 flex items-center">
                    <ImageIcon className="h-4 w-4 mr-1" />
                    Immagini ({memory.images.length})
                  </h4>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {memory.images.slice(0, 8).map((image: Image) => (
                      <div key={image.id} className="aspect-square rounded-md overflow-hidden">
                        <img 
                          src={image.thumbnailUrl} 
                          alt={image.name} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                    {memory.images.length > 8 && (
                      <div className="aspect-square rounded-md bg-muted flex items-center justify-center">
                        <span className="text-sm font-medium">+{memory.images.length - 8}</span>
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
              <Button onClick={handleSave} disabled={!title.trim()}>
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
