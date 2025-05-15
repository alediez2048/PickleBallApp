import { Game, SkillLevel, GameStatus, GAME_CONSTANTS } from '@/types/games';

// Helper to create dates for specific days
const createDate = (daysFromNow: number, hours: number, minutes: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  date.setHours(hours, minutes, 0, 0);
  return date.toISOString();
};

export const MOCK_GAMES: Record<string, Game> = {
  '1': {
    id: '1',
    title: 'Evening Game at Givens',
    description: 'Join us for a fun evening game at Givens Court',
    startTime: createDate(0, 18, 30), // Today at 6:30 PM
    endTime: createDate(0, 20, 30), // Today at 8:30 PM
    location: {
      id: 'givens-1',
      name: 'Givens Court',
      address: '1100 Springdale Rd',
      city: 'Austin',
      state: 'TX',
      zipCode: '78721',
      coordinates: {
        latitude: 30.2729,
        longitude: -97.6841
      }
    },
    skillLevel: SkillLevel.Intermediate,
    maxPlayers: GAME_CONSTANTS.MAX_PLAYERS,
    registeredCount: 0,
    price: 10,
    status: GameStatus.Upcoming,
    host: {
      id: 'host-1',
      name: 'John Smith',
      email: 'john@example.com',
      skillLevel: SkillLevel.Advanced
    },
    players: [],
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString()
  },
  '2': {
    id: '2',
    title: 'Morning Game at Dove Springs',
    description: 'Early morning game at Dove Springs Recreation Center',
    startTime: createDate(1, 9, 0), // Tomorrow at 9:00 AM
    endTime: createDate(1, 11, 0), // Tomorrow at 11:00 AM
    location: {
      id: 'dove-1',
      name: 'Dove Springs',
      address: '5701 Ainez Drive',
      city: 'Austin',
      state: 'TX',
      zipCode: '78744',
      coordinates: {
        latitude: 30.1971,
        longitude: -97.7141
      }
    },
    skillLevel: SkillLevel.Advanced,
    maxPlayers: GAME_CONSTANTS.MAX_PLAYERS,
    registeredCount: 0,
    price: 12,
    status: GameStatus.Upcoming,
    host: {
      id: 'host-2',
      name: 'Jane Doe',
      email: 'jane@example.com',
      skillLevel: SkillLevel.Advanced
    },
    players: [],
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    updatedAt: new Date(Date.now() - 172800000).toISOString()
  },
  '3': {
    id: '3',
    title: 'Afternoon Game at Hancock',
    description: 'Join us for a competitive afternoon game at Hancock Recreation Center',
    startTime: createDate(0, 12, 0), // Today at 12:00 PM
    endTime: createDate(0, 14, 0), // Today at 2:00 PM
    location: {
      id: 'hancock-1',
      name: 'Hancock Park',
      address: '1300 Hancock',
      city: 'Austin',
      state: 'TX',
      zipCode: '78756',
      coordinates: {
        latitude: 30.3008,
        longitude: -97.7247
      }
    },
    skillLevel: SkillLevel.Advanced,
    maxPlayers: GAME_CONSTANTS.MAX_PLAYERS,
    registeredCount: 0,
    price: 10,
    status: GameStatus.Upcoming,
    host: {
      id: 'host-3',
      name: 'Alex Thompson',
      email: 'alex@example.com',
      skillLevel: SkillLevel.Advanced
    },
    players: [],
    createdAt: new Date(Date.now() - 43200000).toISOString(),
    updatedAt: new Date(Date.now() - 43200000).toISOString()
  },
  '4': {
    id: '4',
    title: 'Weekend Game at Mueller',
    description: 'Weekend fun at Mueller Park courts',
    startTime: createDate(2, 15, 0), // Day after tomorrow at 3:00 PM
    endTime: createDate(2, 17, 0), // Day after tomorrow at 5:00 PM
    location: {
      id: 'mueller-1',
      name: 'Mueller Park',
      address: '4550 Mueller Blvd',
      city: 'Austin',
      state: 'TX',
      zipCode: '78723',
      coordinates: {
        latitude: 30.2998,
        longitude: -97.7045
      }
    },
    skillLevel: SkillLevel.Beginner,
    maxPlayers: GAME_CONSTANTS.MAX_PLAYERS,
    registeredCount: 0,
    price: 8,
    status: GameStatus.Upcoming,
    host: {
      id: 'host-4',
      name: 'Michael Johnson',
      email: 'michael@example.com',
      skillLevel: SkillLevel.Intermediate
    },
    players: [],
    createdAt: new Date(Date.now() - 259200000).toISOString(),
    updatedAt: new Date(Date.now() - 259200000).toISOString()
  },
  '5': {
    id: '5',
    title: 'Evening Game at Zilker',
    description: 'Relaxed evening game at Zilker Park',
    startTime: createDate(3, 18, 0), // 3 days from now at 6:00 PM
    endTime: createDate(3, 20, 0), // 3 days from now at 8:00 PM
    location: {
      id: 'zilker-1',
      name: 'Zilker Park',
      address: '2100 Barton Springs Rd',
      city: 'Austin',
      state: 'TX',
      zipCode: '78746',
      coordinates: {
        latitude: 30.2669,
        longitude: -97.7728
      }
    },
    skillLevel: SkillLevel.Intermediate,
    maxPlayers: GAME_CONSTANTS.MAX_PLAYERS,
    registeredCount: 0,
    price: 10,
    status: GameStatus.Upcoming,
    host: {
      id: 'host-5',
      name: 'Emily Wilson',
      email: 'emily@example.com',
      skillLevel: SkillLevel.Intermediate
    },
    players: [],
    createdAt: new Date(Date.now() - 345600000).toISOString(),
    updatedAt: new Date(Date.now() - 345600000).toISOString()
  },
  '6': {
    id: '6',
    title: 'Morning Game at Givens',
    description: 'Early morning competitive game',
    startTime: createDate(1, 7, 30), // Tomorrow at 7:30 AM
    endTime: createDate(1, 9, 30), // Tomorrow at 9:30 AM
    location: {
      id: 'givens-1',
      name: 'Givens Court',
      address: '1100 Springdale Rd',
      city: 'Austin',
      state: 'TX',
      zipCode: '78721',
      coordinates: {
        latitude: 30.2729,
        longitude: -97.6841
      }
    },
    skillLevel: SkillLevel.Advanced,
    maxPlayers: GAME_CONSTANTS.MAX_PLAYERS,
    registeredCount: 0,
    price: 10,
    status: GameStatus.Upcoming,
    host: {
      id: 'host-1',
      name: 'John Smith',
      email: 'john@example.com',
      skillLevel: SkillLevel.Advanced
    },
    players: [],
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString()
  }
}; 