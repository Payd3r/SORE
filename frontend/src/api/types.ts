export interface UserInfo {
  id: number;
  name: string;
  email: string;
  couple_id: number | null;
  theme_preference: 'light' | 'dark' | 'system';
  profile_picture_url: string | null;
  created_at: string;
}

export interface CoupleInfo {
  id: number;
  name: string;
  anniversary_date: string;
  num_foto: number;
  num_idee: number;
  num_ricordi: number;
  membri: {
    id: number;
    name: string;
    email: string;
  }[];
}

export interface ApiResponse<T> {
  data: T;
}

export type MemoryType = 'VIAGGIO' | 'EVENTO' | 'SEMPLICE';

export interface Image {
  id: number;
  thumb_big_path: string;
  webp_path: string | null;
  created_at?: string;
  type?: 'COPPIA' | 'PAESAGGIO' | 'SINGOLO' | 'CIBO';
}

export interface Memory {
  id: number;
  title: string;
  type: MemoryType;
  start_date: string | null;
  end_date?: string | null;
  song?: string | null;
  location?: string | null;
  created_at: string;
  updated_at: string;
  images?: Image[];
} 