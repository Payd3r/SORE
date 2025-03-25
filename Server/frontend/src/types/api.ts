export interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface User {
  id: number;
  name: string;
  email: string;
  coupleId: number;
  themePreference?: 'light' | 'dark';
  profilePicture?: string;
  biography?: string;
}

export interface Couple {
  id: number;
  name: string;
  anniversaryDate: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Memory {
  id: number;
  title: string;
  description: string;
  type: 'viaggio' | 'evento' | 'semplice';
  date: string;
  start_date?: string;
  end_date?: string;
  location?: string;
  song?: string;
  category?: string;
  images: Image[];
  created_by_name?: string;
  created_by_user_id: number;
  couple_id: number;
  created_at: string;
  updated_at: string;
}

export enum ImageType {
  LANDSCAPE = 'landscape',
  COUPLE = 'couple',
  PERSON = 'person',
  EVENT = 'event',
  SINGLE = 'single'
}

export interface Image {
  id: number;
  url: string;
  original_format: string;
  original_path: string;
  jpg_path: string;
  thumb_big_path: string;
  thumb_small_path: string;
  image_path: string;
  taken_at: string;
  latitude?: number;
  longitude?: number;
  location_name?: string;
  location_address?: string;
  description?: string;
  memory_id?: number;
  couple_id: number;
  created_by_user_id: number;
  created_at: string;
  type: ImageType;
  created_by_name?: string;
  memory_title?: string;
}

export interface Location {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  address?: string;
}

export interface Idea {
  id: number;
  title: string;
  description: string;
  category: string;
  due_date: string;
  couple_id: number;
  created_by_user_id: number;
  created_by_name: string;
  created_at: string;
  updated_at: string;
  checked: boolean;
  date_checked: string | null;
  total_tasks?: number;
  completed_tasks?: number;
  tasks?: Array<{
    id: number;
    title: string;
    description: string;
    due_date: string | null;
    checked: boolean;
    created_at: string;
    updated_at: string;
  }>;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface RegisterResponse {
  token: string;
  user: User;
}
