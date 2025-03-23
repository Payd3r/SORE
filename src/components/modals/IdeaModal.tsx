
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
import { Check, Trash, Pencil } from 'lucide-react';

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
      setDescription(idea.description);
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
      description: description.trim(),
      type,
    };
    
    if (mode === 'create' && user && couple) {
      ideaData.userId = user.id;
      ideaData.creatorName = user.name;
      ideaData.coupleId = couple.id;
      ideaData.completed = false;
      ideaData.createdAt = new Date();
    }
    
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
    if (onComplete && user) {
      console.log(`Idea marked as ${completed ? 'completed' : 'incomplete'} by ${user.name}`);
      onComplete(completed);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      console.log('Idea deleted');
      onDelete();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] backdrop-blur-sm bg-white/60 dark:bg-gray-950/60 border-none shadow-lg">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Crea nuova idea' : mode === 'edit' ? 'Modifica idea' : 'Dettagli idea'}
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
                <Label htmlFor="title">Titolo</Label>
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
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="travel" id="travel" />
                      <Label htmlFor="travel">Viaggio</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="restaurant" id="restaurant" />
                      <Label htmlFor="restaurant">Ristorante</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="general" id="general" />
                      <Label htmlFor="general">Generica</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="challenge" id="challenge" />
                      <Label htmlFor="challenge">Sfida</Label>
                    </div>
                  </div>
                </RadioGroup>
              </div>
            </>
          ) : (
            <>
              <div>
                <h3 className="text-lg font-semibold">{title}</h3>
                <p className="text-sm text-muted-foreground mt-1">Tipo: {
                  type === 'travel' ? 'Viaggio' :
                  type === 'restaurant' ? 'Ristorante' :
                  type === 'general' ? 'Generica' : 'Sfida'
                }</p>
                
                {idea && (
                  <div className="text-sm text-muted-foreground mt-1">
                    Creata da: {idea.creatorName}
                  </div>
                )}

                {idea && idea.completed && idea.completedByName && (
                  <div className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded p-2 mt-2 text-sm flex items-center">
                    <Check className="h-4 w-4 mr-2" />
                    Completata da {idea.completedByName}
                    {idea.completedAt && ` il ${new Date(idea.completedAt).toLocaleDateString()}`}
                  </div>
                )}
              </div>
              
              <div className="border-t pt-4 mt-4">
                <p className="whitespace-pre-wrap">{description}</p>
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

export default IdeaModal;
