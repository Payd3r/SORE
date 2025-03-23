
import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Filter, X } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Creator {
  id: string;
  name: string;
}

interface FiltersModalProps {
  title?: string;
  description?: string;
  // Generic filters
  searchTerm?: string;
  onSearchChange?: (value: string) => void;
  
  // Ideas filters
  selectedStatus?: 'all' | 'completed' | 'pending';
  onStatusChange?: (value: 'all' | 'completed' | 'pending') => void;
  selectedType?: string;
  onTypeChange?: (value: string) => void;
  selectedCreator?: string;
  onCreatorChange?: (value: string) => void;
  creators?: Creator[];
  
  // Gallery filters
  selectedFavorite?: 'all' | 'favorites' | 'regular';
  onFavoriteChange?: (value: 'all' | 'favorites' | 'regular') => void;
  selectedMemory?: string;
  onMemoryChange?: (value: string) => void;
  
  // Reset filters
  onResetFilters?: () => void;

  // Types available
  typeOptions?: { value: string; label: string }[];
}

const FiltersModal: React.FC<FiltersModalProps> = ({
  title = "Filtri",
  description = "Applica filtri per affinare i risultati",
  searchTerm,
  onSearchChange,
  selectedStatus,
  onStatusChange,
  selectedType,
  onTypeChange,
  selectedCreator,
  onCreatorChange,
  creators,
  selectedFavorite,
  onFavoriteChange,
  selectedMemory,
  onMemoryChange,
  onResetFilters,
  typeOptions,
}) => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-1">
          <Filter className="h-4 w-4" />
          <span>Filtri</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[80vh] sm:h-auto sm:max-w-md rounded-t-xl overflow-hidden p-0">
        <SheetHeader className="p-6 pb-2">
          <div className="flex items-center justify-between">
            <SheetTitle>{title}</SheetTitle>
          </div>
          <SheetDescription>{description}</SheetDescription>
        </SheetHeader>
        
        <div className="px-6 py-4 overflow-y-auto max-h-[calc(80vh-180px)] sm:max-h-[calc(100vh-200px)] space-y-5">
          {/* Search filter */}
          {onSearchChange && (
            <div className="space-y-2">
              <Label htmlFor="search" className="text-sm font-medium">Cerca</Label>
              <Input
                id="search"
                placeholder="Cerca..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full"
              />
            </div>
          )}
          
          {/* Status filter for ideas */}
          {onStatusChange && (
            <div className="space-y-3">
              <Label className="text-sm font-medium">Stato</Label>
              <RadioGroup 
                value={selectedStatus} 
                onValueChange={(value: 'all' | 'completed' | 'pending') => onStatusChange(value)}
                className="flex flex-col space-y-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="all" id="all-status" />
                  <Label htmlFor="all-status" className="font-normal cursor-pointer">Tutti</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="pending" id="pending" />
                  <Label htmlFor="pending" className="font-normal cursor-pointer">Da completare</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="completed" id="completed" />
                  <Label htmlFor="completed" className="font-normal cursor-pointer">Completati</Label>
                </div>
              </RadioGroup>
            </div>
          )}
          
          {/* Type filter for ideas or gallery */}
          {onTypeChange && typeOptions && (
            <div className="space-y-3">
              <Label className="text-sm font-medium">Tipo</Label>
              <Select value={selectedType} onValueChange={onTypeChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleziona un tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tutti</SelectItem>
                  {typeOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          {/* Creator filter for ideas */}
          {onCreatorChange && creators && creators.length > 1 && (
            <div className="space-y-3">
              <Label className="text-sm font-medium">Creatore</Label>
              <Select value={selectedCreator} onValueChange={onCreatorChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleziona un creatore" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tutti</SelectItem>
                  {creators.map(creator => (
                    <SelectItem key={creator.id} value={creator.id}>
                      {creator.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          {/* Favorite filter for gallery */}
          {onFavoriteChange && (
            <div className="space-y-3">
              <Label className="text-sm font-medium">Preferiti</Label>
              <RadioGroup 
                value={selectedFavorite} 
                onValueChange={(value: 'all' | 'favorites' | 'regular') => onFavoriteChange(value)}
                className="flex flex-col space-y-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="all" id="all-favorites" />
                  <Label htmlFor="all-favorites" className="font-normal cursor-pointer">Tutte le foto</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="favorites" id="favorites" />
                  <Label htmlFor="favorites" className="font-normal cursor-pointer">Solo preferiti</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="regular" id="regular" />
                  <Label htmlFor="regular" className="font-normal cursor-pointer">No preferiti</Label>
                </div>
              </RadioGroup>
            </div>
          )}
          
          {/* Memory filter for gallery */}
          {onMemoryChange && (
            <div className="space-y-3">
              <Label className="text-sm font-medium">Ricordo</Label>
              <Select value={selectedMemory} onValueChange={onMemoryChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleziona un ricordo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tutti i ricordi</SelectItem>
                  {/* Memory items would go here */}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        
        <SheetFooter className="p-6 pt-2 border-t flex-row justify-between">
          {onResetFilters && (
            <Button variant="ghost" onClick={onResetFilters}>
              Resetta filtri
            </Button>
          )}
          <SheetTrigger asChild>
            <Button>Applica filtri</Button>
          </SheetTrigger>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default FiltersModal;
