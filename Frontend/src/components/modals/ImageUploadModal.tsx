
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
import { 
  Image as ImageIcon,
  MapPin,
  Upload,
  Link2,
  X
} from 'lucide-react';

interface ImageUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpload: (files: File[], data: Partial<ImageType>) => void;
  memories?: Memory[];
}

const ImageUploadModal: React.FC<ImageUploadModalProps> = ({
  open,
  onOpenChange,
  onUpload,
  memories = []
}) => {
  const { user, couple } = useAuth();
  const [files, setFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [name, setName] = useState('');
  const [type, setType] = useState<ImageCategory>('landscape');
  const [location, setLocation] = useState('');
  const [memoryId, setMemoryId] = useState<string | undefined>(undefined);
  
  // Reset form when modal opens/closes
  useEffect(() => {
    if (!open) {
      setFiles([]);
      setPreviewUrls([]);
      setName('');
      setType('landscape');
      setLocation('');
      setMemoryId(undefined);
    }
  }, [open]);
  
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
      
      // If this is the first file and no name is set, use the file name as default
      if (files.length === 0 && !name && selectedFiles[0]) {
        setName(selectedFiles[0].name.split('.')[0]);
      }
    }
  };
  
  const removeFile = (index: number) => {
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
    URL.revokeObjectURL(previewUrls[index]);
    setPreviewUrls(prevUrls => prevUrls.filter((_, i) => i !== index));
  };
  
  const handleUpload = () => {
    if (files.length === 0) return;
    
    const imageData: Partial<ImageType> = {
      name: name || files[0].name.split('.')[0],
      type,
      memoryId,
      userId: user?.id,
      uploaderName: user?.name,
      coupleId: couple?.id,
      date: new Date()
    };
    
    if (location) {
      imageData.location = {
        latitude: 45.4642, // Example coordinates for Milano
        longitude: 9.1900,
        name: location
      };
    }
    
    console.log('Uploading images:', imageData);
    onUpload(files, imageData);
    onOpenChange(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px]">
        <DialogHeader>
          <DialogTitle>Carica immagini</DialogTitle>
          <DialogDescription>
            Aggiungi nuove immagini alla galleria
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4 max-h-[70vh] overflow-y-auto">
          <div className="space-y-4">
            <div className="border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center">
              <ImageIcon className="h-10 w-10 text-muted-foreground mb-4" />
              <Label htmlFor="file-upload" className="cursor-pointer">
                <div className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium">
                  Seleziona immagini
                </div>
                <input
                  id="file-upload"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                />
              </Label>
              <p className="text-sm text-muted-foreground mt-2">
                {files.length > 0 
                  ? `${files.length} ${files.length === 1 ? 'file selezionato' : 'file selezionati'}` 
                  : 'Trascina qui i file o clicca per selezionarli'}
              </p>
            </div>
            
            {/* Show preview of selected files */}
            {previewUrls.length > 0 && (
              <div>
                <Label className="text-sm">Anteprima ({previewUrls.length})</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {previewUrls.map((url, index) => (
                    <div key={index} className="relative group">
                      <img 
                        src={url} 
                        alt={`Preview ${index}`} 
                        className="w-full h-32 object-cover rounded-md" 
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
                  {memories.map((memory) => (
                    <option key={memory.id} value={memory.id}>
                      {memory.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annulla
          </Button>
          <Button 
            onClick={handleUpload} 
            disabled={files.length === 0}
            className="flex items-center"
          >
            <Upload className="h-4 w-4 mr-2" />
            Carica {files.length > 0 ? `(${files.length})` : ''}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImageUploadModal;
