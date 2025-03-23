
// Define all types for our application

export type MemoryType = 'travel' | 'event' | 'simple';
export type EventTag = 'birthday' | 'gift' | 'anniversary' | 'holiday' | 'other';
export type IdeaType = 'travel' | 'restaurant' | 'general' | 'challenge';
export type ImageType = 'landscape' | 'singlePerson' | 'couple';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  uploadCount?: number;
  createdAt: Date;
  coupleId?: string;
}

export interface Couple {
  id: string;
  name: string;
  description?: string;
  startDate: Date;
  anniversaryDate?: Date;
  avatar?: string;
  createdAt: Date;
  members: User[];
}

export interface Memory {
  id: string;
  type: MemoryType;
  title: string;
  description?: string;
  startDate: Date;
  endDate?: Date;
  song?: string;
  location?: GeoLocation;
  eventTag?: EventTag;
  images: Image[];
  userId: string;
  creatorName: string;
  coupleId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Image {
  id: string;
  name: string;
  url: string;
  thumbnailUrl: string;
  date: Date;
  type: ImageType;
  location?: GeoLocation;
  memoryId?: string;
  userId: string;
  uploaderName: string;
  coupleId: string;
  createdAt: Date;
  isFavorite?: boolean;
}

export interface Idea {
  id: string;
  type: IdeaType;
  title: string;
  description: string;
  createdAt: Date;
  completed: boolean;
  completedAt?: Date;
  completedById?: string;
  completedByName?: string;
  userId: string;
  creatorName: string;
  coupleId: string;
}

export interface GeoLocation {
  latitude: number;
  longitude: number;
  name?: string;
}

export interface UserStats {
  userId: string;
  name: string;
  memoriesCreated: number;
  ideasCreated: number;
  ideasCompleted: number;
  imagesUploaded: number;
  locationsVisited: number;
}

export interface Stats {
  totalMemories: number;
  memoriesByType: Record<MemoryType, number>;
  memoriesByUser: Record<string, number>;
  totalImages: number;
  imagesByType: Record<ImageType, number>;
  imagesByUser: Record<string, number>;
  totalIdeas: number;
  completedIdeas: number;
  ideasByType: Record<IdeaType, number>;
  ideasCreatedByUser: Record<string, number>;
  ideasCompletedByUser: Record<string, number>;
  locationsVisited: number;
  userStats: UserStats[];
}
