import { SkillLevel, GameStatus, Game, Location, User } from '../game';

describe('Game Types', () => {
  describe('SkillLevel', () => {
    it('should have all valid skill levels', () => {
      expect(Object.values(SkillLevel)).toEqual([
        'Beginner',
        'Intermediate',
        'Advanced',
        'Open',
      ]);
    });

    it('should be type-safe', () => {
      const skillLevel: SkillLevel = SkillLevel.Beginner;
      // @ts-expect-error - This should error because 'Invalid' is not a valid skill level
      const invalidSkillLevel: SkillLevel = 'Invalid';
    });
  });

  describe('GameStatus', () => {
    it('should have all valid game statuses', () => {
      expect(Object.values(GameStatus)).toEqual([
        'Upcoming',
        'InProgress',
        'Completed',
        'Cancelled',
      ]);
    });

    it('should be type-safe', () => {
      const status: GameStatus = GameStatus.Upcoming;
      // @ts-expect-error - This should error because 'Invalid' is not a valid status
      const invalidStatus: GameStatus = 'Invalid';
    });
  });

  describe('Game interface', () => {
    it('should create a valid game object', () => {
      const location: Location = {
        id: '1',
        name: 'Test Court',
        address: '123 Test St',
        city: 'Test City',
        state: 'TS',
        zipCode: '12345',
        coordinates: {
          latitude: 0,
          longitude: 0,
        },
      };

      const host: User = {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        skillLevel: SkillLevel.Intermediate,
      };

      const game: Game = {
        id: '1',
        title: 'Test Game',
        date: new Date(),
        location,
        maxPlayers: 4,
        currentPlayers: 1,
        skillLevel: SkillLevel.Intermediate,
        price: 10,
        host,
        status: GameStatus.Upcoming,
      };

      expect(game).toBeTruthy();
      expect(game.skillLevel).toBe(SkillLevel.Intermediate);
      expect(game.status).toBe(GameStatus.Upcoming);
    });
  });
}); 