import type { Location } from "./locations";

export const SkillLevel = {
  Beginner: "Beginner",
  Intermediate: "Intermediate",
  Advanced: "Advanced",
  Open: "Open",
} as const;

export type SkillLevel = (typeof SkillLevel)[keyof typeof SkillLevel];

export const GameStatus = {
  Upcoming: "upcoming",
  Completed: "completed",
  Cancelled: "cancelled",
} as const;

export type GameStatus = (typeof GameStatus)[keyof typeof GameStatus];

export interface User {
  id: string;
  name: string;
  email: string;
  skill_level: SkillLevel;
  phone_number?: string;
  rating?: number;
  profile_image?: string | null;
}

export const GAME_CONSTANTS = {
  MAX_PLAYERS: 8,
  MIN_PLAYERS: 2,
  DEFAULT_POLLING_INTERVAL: 5000, // 5 seconds
} as const;

export interface Game {
  id: string;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  location_id: string;
  host: User;
  players: User[];
  registered_count: number;
  max_players: number;
  skill_level: SkillLevel;
  price: number;
  image_url?: string;
  status: GameStatus;
  created_at: string;
  updated_at: string;
  fixed_game_id?: string;
  location?: Location;
}

export interface GameFilters {
  skillLevel?: SkillLevel;
  date?: string;
  location?: string;
  status?: GameStatus;
}
