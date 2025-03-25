import { RowDataPacket, ResultSetHeader as MySQLResultSetHeader } from 'mysql2';

export interface DbRow extends RowDataPacket {
  created_at: Date;
  updated_at: Date;
}

export interface User extends DbRow {
  id: number;
  email: string;
  password: string;
  password_hash: string;
  name: string;
  couple_id: number | null;
  theme_preference?: string;
  profile_picture_url?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Couple extends DbRow {
  id: number;
  created_at: Date;
  updated_at: Date;
}

export interface Memory extends DbRow {
  id: number;
  title: string;
  description: string;
  date: Date;
  location: string;
  couple_id: number;
  created_by_user_id: number;
  created_at: Date;
  updated_at: Date;
}

export interface Location extends DbRow {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  address: string;
  memory_id: number;
}

export enum ImageType {
  LANDSCAPE = 'paesaggio',
  SINGLE = 'singolo',
  COUPLE = 'coppia'
}

export interface Image extends DbRow {
  id: number;
  url: string;
  original_format: string;
  original_path: string;
  jpg_path: string;
  thumb_big_path: string;
  thumb_small_path: string;
  taken_at: Date;
  latitude?: number;
  longitude?: number;
  location_name?: string;
  location_address?: string;
  description?: string;
  memory_id?: number;
  couple_id: number;
  created_by_user_id: number;
  created_at: Date;
  type: ImageType;
  created_by_name?: string;
  memory_title?: string;
}

export interface Idea extends DbRow {
  id: number;
  title: string;
  description: string;
  category: string;
  due_date: Date | null;
  couple_id: number;
  created_by_user_id: number;
  created_by_name?: string;
  checked: boolean;
  date_checked: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface IdeaWithTasks extends RowDataPacket {
  id: number;
  title: string;
  description: string;
  category: string;
  due_date: Date | null;
  couple_id: number;
  created_by_user_id: number;
  created_by_name?: string;
  checked: boolean;
  date_checked: Date | null;
  created_at: Date;
  updated_at: Date;
  tasks?: string;
  total_tasks?: number;
  completed_tasks?: number;
}

export interface ProcessedIdea extends Omit<Idea, 'tasks'> {
  tasks: Array<{
    id: number;
    title: string;
    description: string;
    due_date: Date | null;
    checked: boolean;
    created_at: Date;
    updated_at: Date;
  }>;
  total_tasks: number;
  completed_tasks: number;
}

export type ResultSetHeader = MySQLResultSetHeader; 