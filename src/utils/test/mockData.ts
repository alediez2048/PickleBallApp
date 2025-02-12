import { Game, SkillLevel, GameStatus } from '@/types/game';

export const mockGame: Game = {
  id: '1',
  title: 'Game 1',
  description: 'Test game description',
  startTime: new Date().toISOString(),
  endTime: new Date(Date.now() + 3600000).toISOString(),
  location: {
    id: '1',
    name: 'Test Court',
    address: '123 Test St',
    city: 'Test City',
    state: 'CA',
    zipCode: '12345',
    coordinates: {
      latitude: 37.7749,
      longitude: -122.4194
    }
  },
  host: {
    id: '1',
    name: 'Test Host',
    email: 'host@test.com',
    skillLevel: SkillLevel.Intermediate
  },
  players: [],
  maxPlayers: 4,
  skillLevel: SkillLevel.Intermediate,
  price: 10,
  status: GameStatus.Scheduled,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
}; 