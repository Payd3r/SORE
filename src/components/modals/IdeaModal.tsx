
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Idea, IdeaType } from "@/types";
import { useAuth } from '@/context/auth-context';
import { Check, Trash, Pencil, Lightbulb, Save } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface IdeaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (idea: Partial<Idea>) => void;
  onDelete?: () => void;
  onComplete?: (completed: boolean) => void;
  idea?: Idea;
  mode: 'create' | 'view' | 'edit';
}

const IdeaModal: React.FC<IdeaModalProps> = ({
  open,
  onOpenChange,
  onSave,
  onDelete,
  onComplete,
  idea,
  mode
}) => {
  const { user, couple } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<IdeaType>('general');
  const [isEditing, setIsEditing] = useState(mode === 'edit' || mode === 'create');

  useEffect(() => {
    if (idea && mode !== 'create') {
      setTitle(idea.title);
      setDescription(idea.description || '');
      setType(idea.type);
    } else {
      setTitle('');
      setDescription('');
      setType('general');
    }
    
    setIsEditing(mode === 'edit' || mode === 'create');
  }, [idea, mode, open]);

  const handleSave = () => {
    if (!title.trim()) return;
    
    const ideaData: Partial<Idea> = {
      title: title.trim(),
      description: description.trim() || undefined,
      type,
    };
    
    if (mode === 'create' && user && couple) {
      ideaData.userId = user.id;
      ideaData.creatorName = user.name;
      ideaData.coupleId = couple.id;
      ideaData.completed = false;
      ideaData.createdAt = new Date();
    }
    
    console.log(`Idea ${mode === 'create' ? 'created' : 'updated'}:`, ideaData);
    onSave(ideaData);
    
    if (mode === 'view') {
      setIsEditing(false);
    } else {
      onOpenChange(false);
    }
  };

  const handleToggleEdit = () => {
    setIsEditing(!isEditing);
  };

  const handleComplete = (completed: boolean) => {
    if (onComplete && user && idea) {
      console.log(`Idea marked as ${completed ? 'completed' : 'incomplete'} by ${user.name}`);
      onComplete(completed);
    }
  };

  const handleDelete = () => {
    if (onDelete && idea) {
      console.log('Idea deleted:', idea.id);
      onDelete();
      onOpenChange(false);
    }
  };

  const getTypeLabel = (ideaType: IdeaType) => {
    switch(ideaType) {
      case 'travel': return 'Viaggio';
      case 'restaurant': return 'Ristorante';
      case 'challenge': return 'Sfida';
      default: return 'Generale';
    }
  };

  const getTypeBadgeColor = (ideaType: IdeaType) => {
    switch(ideaType) {
      case 'travel': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'restaurant': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
      case 'challenge': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      default: return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Lightbulb className="h-5 w-5 mr-2 text-primary" />
            {mode === 'create' ? 'Nuova idea' : mode === 'edit' ? 'Modifica idea' : 'Dettagli idea'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create' 
              ? 'Aggiungi una nuova idea da realizzare insieme'
              : 'Visualizza i dettagli dell\'idea'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {isEditing ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="title">Titolo*</Label>
                <Input
                  id="title"
                  placeholder="Titolo dell'idea"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Descrizione</Label>
                <Textarea
                  id="description"
                  placeholder="Descrivi l'idea..."
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Tipo di idea</Label>
                <RadioGroup value={type} onValueChange={(value: IdeaType) => setType(value)}>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center space-x-2 p-2 rounded-md hover:bg-muted/50">
                      <RadioGroupItem value="travel" id="travel" />
                      <Label htmlFor="travel" className="cursor-pointer">Viaggio</Label>
                    </div>
                    <div className="flex items-center space-x-2 p-2 rounded-md hover:bg-muted/50">
                      <RadioGroupItem value="restaurant" id="restaurant" />
                      <Label htmlFor="restaurant" className="cursor-pointer">Ristorante</Label>
                    </div>
                    <div className="flex items-center space-x-2 p-2 rounded-md hover:bg-muted/50">
                      <RadioGroupItem value="general" id="general" />
                      <Label htmlFor="general" className="cursor-pointer">Generica</Label>
                    </div>
                    <div className="flex items-center space-x-2 p-2 rounded-md hover:bg-muted/50">
                      <RadioGroupItem value="challenge" id="challenge" />
                      <Label htmlFor="challenge" className="cursor-pointer">Sfida</Label>
                    </div>
                  </div>
                </RadioGroup>
              </div>
            </>
          ) : (
            <>
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <Badge className={`${getTypeBadgeColor(type)}`}>
                    {getTypeLabel(type)}
                  </Badge>
                  
                  {idea && idea.completed && (
                    <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800">
                      <Check className="h-3 w-3 mr-1" />
                      Completata
                    </Badge>
                  )}
                </div>
                
                <h3 className="text-2xl font-semibold mb-1">{title}</h3>
                
                {idea && (
                  <div className="text-sm text-muted-foreground flex items-center">
                    <span>Creata da: {idea.creatorName}</span>
                    {idea.createdAt && (
                      <span className="ml-2 text-xs">
                        {new Date(idea.createdAt).toLocaleDateString('it-IT', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </span>
                    )}
                  </div>
                )}

                {idea && idea.completed && idea.completedByName && (
                  <div className="mt-4 p-3 rounded-md bg-green-50 dark:bg-green-900/10 text-sm border border-green-100 dark:border-green-900/30">
                    <div className="flex items-center text-green-800 dark:text-green-300 font-medium">
                      <Check className="h-4 w-4 mr-2" />
                      Completata da {idea.completedByName}
                    </div>
                    {idea.completedAt && (
                      <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                        {new Date(idea.completedAt).toLocaleDateString('it-IT', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <div className="rounded-md bg-muted/50 p-4">
                <p className="whitespace-pre-wrap">{description || "Nessuna descrizione disponibile."}</p>
              </div>
            </>
          )}
        </div>
        
        <DialogFooter className="flex items-center justify-between sm:justify-between gap-2">
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
                  
                  {idea && onComplete && (
                    <Button
                      variant={idea.completed ? "outline" : "default"}
                      size="sm"
                      onClick={() => handleComplete(!idea.completed)}
                      className="flex items-center"
                    >
                      <Check className="h-4 w-4 mr-2" />
                      {idea.completed ? 'Annulla completamento' : 'Completa'}
                    </Button>
                  )}
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

export default IdeaModal;
