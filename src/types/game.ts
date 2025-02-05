export interface Game {
  id: string;
  title: string;
  date: Date;
  location: Location;
  maxPlayers: number;
  currentPlayers: number;
  skillLevel: SkillLevel;
  price: number;
  host: User;
  status: GameStatus;
}

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
}

export enum SkillLevel {
  Beginner = 'Beginner',
  Intermediate = 'Intermediate',
  Advanced = 'Advanced',
  Open = 'Open',
}

export enum GameStatus {
  Upcoming = 'Upcoming',
  InProgress = 'InProgress',
  Completed = 'Completed',
  Cancelled = 'Cancelled',
}

export interface User {
  id: string;
  name: string;
  email: string;
  skillLevel: SkillLevel;
  rating?: number;
} 