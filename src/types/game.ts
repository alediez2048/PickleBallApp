export const SkillLevel = {
  Beginner: 'Beginner',
  Intermediate: 'Intermediate',
  Advanced: 'Advanced',
  Open: 'Open',
} as const;

export type SkillLevel = typeof SkillLevel[keyof typeof SkillLevel];

export const GameStatus = {
  Upcoming: 'Upcoming',
  InProgress: 'InProgress',
  Completed: 'Completed',
  Cancelled: 'Cancelled',
} as const;

export type GameStatus = typeof GameStatus[keyof typeof GameStatus];

export interface Location {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  imageUrl?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  skillLevel: SkillLevel;
  rating?: number;
}

export interface Game {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  location: Location;
  host: User;
  players: User[];
  maxPlayers: number;
  skillLevel: SkillLevel;
  price: number;
  imageUrl?: string;
  status: GameStatus;
  createdAt: string;
  updatedAt: string;
}

export interface GameFilters {
  skillLevel?: SkillLevel;
  date?: string;
  location?: string;
  status?: GameStatus;
} 