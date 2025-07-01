import type { SkillLevel } from "@/types/skillLevel";

// Types for Fixed Games based on the SQL schema
export type DayOfWeek =
  | 'Sunday'
  | 'Monday'
  | 'Tuesday'
  | 'Wednesday'
  | 'Thursday'
  | 'Friday'
  | 'Saturday';

export type FixedGameStatus = 'active' | 'inactive';

export interface FixedGame {
  id: string;
  title: string;
  description?: string;
  day_of_week: DayOfWeek;
  start_time: string; // 'HH:MM:SS' format
  duration_minutes: number;
  location_id: string;
  location?: any; // Add location for joined data
  host: any; // JSON object, can be typed further if needed
  max_players: number;
  skill_level: SkillLevel;
  price: number;
  image_url?: string;
  status: FixedGameStatus;
  created_at: string;
  updated_at: string;
}

export type FixedGameInput = Omit<FixedGame, 'id' | 'created_at' | 'updated_at'>;
