import { Game, SkillLevel, GameStatus } from '@/types/game';

export const MOCK_GAMES: Record<string, Game> = {
  '1': {
    id: '1',
    title: 'Evening Game at Givens',
    description: 'Join us for a fun evening game at Givens Court',
    startTime: new Date().toISOString(),
    endTime: new Date(Date.now() + 3600000).toISOString(),
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
    maxPlayers: 15,
    price: 10,
    status: GameStatus.Upcoming,
    host: {
      id: 'host-1',
      name: 'John Smith',
      email: 'john@example.com',
      skillLevel: SkillLevel.Advanced
    },
    players: [
      {
        id: 'player-1',
        name: 'Sarah Johnson',
        email: 'sarah@example.com',
        skillLevel: SkillLevel.Intermediate
      },
      {
        id: 'player-2',
        name: 'Mike Wilson',
        email: 'mike@example.com',
        skillLevel: SkillLevel.Intermediate
      },
      {
        id: 'player-3',
        name: 'Emily Brown',
        email: 'emily@example.com',
        skillLevel: SkillLevel.Advanced
      }
    ],
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString()
  },
  '2': {
    id: '2',
    title: 'Morning Game at Dove Springs',
    description: 'Early morning game at Dove Springs Recreation Center',
    startTime: new Date(Date.now() + 86400000).toISOString(),
    endTime: new Date(Date.now() + 90000000).toISOString(),
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
    maxPlayers: 15,
    price: 12,
    status: GameStatus.Upcoming,
    host: {
      id: 'host-2',
      name: 'Jane Doe',
      email: 'jane@example.com',
      skillLevel: SkillLevel.Advanced
    },
    players: [
      {
        id: 'player-4',
        name: 'Tom Brown',
        email: 'tom@example.com',
        skillLevel: SkillLevel.Advanced
      },
      {
        id: 'player-5',
        name: 'Lisa Chen',
        email: 'lisa@example.com',
        skillLevel: SkillLevel.Advanced
      },
      {
        id: 'player-6',
        name: 'David Park',
        email: 'david@example.com',
        skillLevel: SkillLevel.Advanced
      }
    ],
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    updatedAt: new Date(Date.now() - 172800000).toISOString()
  },
  '3': {
    id: '3',
    title: 'Afternoon Game at Hancock',
    description: 'Join us for a competitive afternoon game at Hancock Recreation Center',
    startTime: new Date(new Date().setHours(17, 0, 0, 0)).toISOString(), // 5 PM today
    endTime: new Date(new Date().setHours(19, 0, 0, 0)).toISOString(), // 7 PM today
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
    maxPlayers: 15,
    price: 10,
    status: GameStatus.Upcoming,
    host: {
      id: 'host-3',
      name: 'Alex Thompson',
      email: 'alex@example.com',
      skillLevel: SkillLevel.Advanced
    },
    players: [
      {
        id: 'player-7',
        name: 'Chris Martinez',
        email: 'chris@example.com',
        skillLevel: SkillLevel.Advanced
      },
      {
        id: 'player-8',
        name: 'Pat Lee',
        email: 'pat@example.com',
        skillLevel: SkillLevel.Advanced
      }
    ],
    createdAt: new Date(Date.now() - 43200000).toISOString(), // 12 hours ago
    updatedAt: new Date(Date.now() - 43200000).toISOString()
  }
}; 