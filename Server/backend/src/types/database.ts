import { RowDataPacket, ResultSetHeader } from 'mysql2';

export interface Memory extends RowDataPacket {
  id: number;
  title: string;
  description: string | null;
  date: Date | null;
  location_id: number | null;
  created_at: Date;
  updated_at: Date;
}

export interface Image extends RowDataPacket {
  id: number;
  memory_id: number | null;
  original_path: string;
  thumbnail_path: string | null;
  description: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface Idea extends RowDataPacket {
  id: number;
  title: string;
  description: string | null;
  status: 'pending' | 'in_progress' | 'completed';
  created_at: Date;
  updated_at: Date;
}

export interface Location extends RowDataPacket {
  id: number;
  name: string;
  description: string | null;
  latitude: number | null;
  longitude: number | null;
  created_at: Date;
  updated_at: Date;
}

export type QueryResult<T> = [T[], ResultSetHeader]; 