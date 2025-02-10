import { validateGame, validateLocation, validateUser, validatePartialGame } from '../game';
import { SkillLevel, GameStatus } from '@/types/game';

describe('Game Schemas', () => {
  const validLocation = {
    id: '1',
    name: 'Test Court',
    address: '123 Test St',
    city: 'Test City',
    state: 'CA',
    zipCode: '12345',
    coordinates: {
      latitude: 37.7749,
      longitude: -122.4194,
    },
  };

  const validUser = {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    skillLevel: SkillLevel.Intermediate,
    rating: 4.5,
  };

  const validGame = {
    id: '1',
    title: 'Test Game',
    date: new Date(),
    location: validLocation,
    maxPlayers: 4,
    currentPlayers: 2,
    skillLevel: SkillLevel.Intermediate,
    price: 10,
    host: validUser,
    status: GameStatus.Upcoming,
  };

  describe('Location Schema', () => {
    it('should validate a valid location', () => {
      const result = validateLocation(validLocation);
      expect(result.success).toBe(true);
    });

    it('should reject invalid coordinates', () => {
      const invalidLocation = {
        ...validLocation,
        coordinates: {
          latitude: 100,
          longitude: -200,
        },
      };
      const result = validateLocation(invalidLocation);
      expect(result.success).toBe(false);
    });

    it('should reject invalid zip code', () => {
      const invalidLocation = {
        ...validLocation,
        zipCode: '1234',
      };
      const result = validateLocation(invalidLocation);
      expect(result.success).toBe(false);
    });
  });

  describe('User Schema', () => {
    it('should validate a valid user', () => {
      const result = validateUser(validUser);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const invalidUser = {
        ...validUser,
        email: 'not-an-email',
      };
      const result = validateUser(invalidUser);
      expect(result.success).toBe(false);
    });

    it('should allow missing rating', () => {
      const userWithoutRating = {
        id: validUser.id,
        name: validUser.name,
        email: validUser.email,
        skillLevel: validUser.skillLevel,
      };
      const result = validateUser(userWithoutRating);
      expect(result.success).toBe(true);
    });
  });

  describe('Game Schema', () => {
    it('should validate a valid game', () => {
      const result = validateGame(validGame);
      expect(result.success).toBe(true);
    });

    it('should reject when currentPlayers exceeds maxPlayers', () => {
      const invalidGame = {
        ...validGame,
        maxPlayers: 4,
        currentPlayers: 5,
      };
      const result = validateGame(invalidGame);
      expect(result.success).toBe(false);
    });

    it('should reject invalid dates', () => {
      const invalidGame = {
        ...validGame,
        date: 'not-a-date',
      };
      const result = validateGame(invalidGame);
      expect(result.success).toBe(false);
    });

    it('should validate partial game updates', () => {
      const partialUpdate = {
        title: 'Updated Title',
        maxPlayers: 6,
      };
      const result = validatePartialGame(partialUpdate);
      expect(result.success).toBe(true);
    });
  });
}); 