
// User and Couple types
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  uploadCount?: number;
}

export interface Couple {
  id: string;
  name: string;
  startDate: Date;
  anniversaryDate?: Date;
  members: User[];
  avatar?: string;
  description?: string;
}

// Memory types
export type MemoryType = 'travel' | 'event' | 'simple';
export type EventTag = 'birthday' | 'anniversary' | 'gift' | 'holiday' | 'other';

export interface GeoLocation {
  latitude: number;
  longitude: number;
  name?: string;
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
  updatedAt?: Date;
}

// Image types
export type ImageType = 'landscape' | 'singlePerson' | 'couple';

export interface Image {
  id: string;
  name: string;
  url: string;
  thumbnailUrl: string;
  date: Date;
  location?: GeoLocation;
  type?: ImageType;
  memoryId?: string;
  userId: string;
  uploaderName: string;
  coupleId: string;
  createdAt: Date;
  isFavorite?: boolean;
}

// Idea types
export type IdeaType = 'travel' | 'restaurant' | 'general' | 'challenge';
export type IdeaPriority = 'low' | 'medium' | 'high';

export interface Idea {
  id: string;
  title: string;
  description: string;
  type: IdeaType;
  priority?: IdeaPriority;
  dueDate?: Date;
  location?: GeoLocation;
  completed: boolean;
  completedAt?: Date;
  completedById?: string;
  completedByName?: string;
  userId: string;
  creatorName: string;
  coupleId: string;
  createdAt: Date;
}
