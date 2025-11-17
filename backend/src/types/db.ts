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
  name: string;
  anniversary_date: Date;
  num_foto: number;
  num_idee: number;
  num_ricordi: number;
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
  images?: Array<{
    id: number;
    thumb_big_path: string | null;
    created_at: Date;
    type: ImageType;
  }>;
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
  COUPLE = 'coppia',
  FOOD = 'cibo'
}

export interface Image extends DbRow {
  id: number;
  url: string;
  original_format: string;
  original_path: string;
  webp_path: string;
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
  hash_original?: string | null;
  hash_webp?: string | null;
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

export interface PushSubscription extends DbRow {
  id: number;
  user_id: number;
  endpoint: string;
  p256dh: string;
  auth: string;
  created_at: Date;
  updated_at: Date;
  last_notification_sent: Date | null;
}

export interface VapidKey extends DbRow {
  id: number;
  public_key: string;
  private_key: string;
  created_at: Date;
}

export interface Notification extends DbRow {
  id: number;
  user_id: number;
  title: string;
  body: string;
  icon: string | null;
  url: string | null;
  sent_at: Date;
  status: 'pending' | 'sent' | 'failed';
}

export type ResultSetHeader = MySQLResultSetHeader;

export type QueryResult<T> = [T[], ResultSetHeader]; 