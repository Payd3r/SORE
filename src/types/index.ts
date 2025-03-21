
// Define all types for our application

export type MemoryType = 'travel' | 'event' | 'simple';
export type EventTag = 'birthday' | 'gift' | 'anniversary' | 'holiday' | 'other';
export type IdeaType = 'travel' | 'restaurant' | 'general' | 'challenge';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt: Date;
}

export interface Memory {
  id: string;
  type: MemoryType;
  title: string;
  startDate: Date;
  endDate?: Date;
  song?: string;
  location?: GeoLocation;
  eventTag?: EventTag;
  images: Image[];
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Image {
  id: string;
  name: string;
  url: string;
  thumbnailUrl: string;
  date: Date;
  location?: GeoLocation;
  memoryId?: string;
  userId: string;
  createdAt: Date;
}

export interface Idea {
  id: string;
  type: IdeaType;
  title: string;
  description: string;
  createdAt: Date;
  completed: boolean;
  completedAt?: Date;
  userId: string;
}

export interface GeoLocation {
  latitude: number;
  longitude: number;
  name?: string;
}

export interface Stats {
  totalMemories: number;
  memoriesByType: Record<MemoryType, number>;
  totalImages: number;
  totalIdeas: number;
  completedIdeas: number;
  ideasByType: Record<IdeaType, number>;
  locationsVisited: number;
}
