import {
  validateCreateGameRequest,
  validateUpdateGameRequest,
  validateGameFilters,
  validateGameListResponse,
  validateGameResponse,
  validateApiError,
} from '../api';
import { SkillLevel, GameStatus } from '@/types/games';

describe('API Schemas', () => {
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

  const validCreateGameRequest = {
    title: 'Test Game',
    date: new Date(),
    location: validLocation,
    maxPlayers: 4,
    currentPlayers: 2,
    skillLevel: SkillLevel.Intermediate,
    price: 10,
    host: validUser,
  };

  describe('Create Game Request Schema', () => {
    it('should validate a valid create game request', () => {
      const result = validateCreateGameRequest(validCreateGameRequest);
      expect(result.success).toBe(true);
    });

    it('should reject request with missing required fields', () => {
      const invalidRequest = {
        title: 'Test Game',
        // missing other required fields
      };
      const result = validateCreateGameRequest(invalidRequest);
      expect(result.success).toBe(false);
    });
  });

  describe('Update Game Request Schema', () => {
    it('should validate a partial game update', () => {
      const updateRequest = {
        title: 'Updated Title',
        maxPlayers: 6,
      };
      const result = validateUpdateGameRequest(updateRequest);
      expect(result.success).toBe(true);
    });

    it('should validate an empty update', () => {
      const result = validateUpdateGameRequest({});
      expect(result.success).toBe(true);
    });
  });

  describe('Game Filters Schema', () => {
    it('should validate valid filters', () => {
      const filters = {
        skillLevel: SkillLevel.Intermediate,
        date: '2024-03-20',
        location: '1',
        status: GameStatus.Upcoming,
      };
      const result = validateGameFilters(filters);
      expect(result.success).toBe(true);
    });

    it('should validate empty filters', () => {
      const result = validateGameFilters({});
      expect(result.success).toBe(true);
    });
  });

  describe('Game List Response Schema', () => {
    it('should validate a valid game list response', () => {
      const response = {
        data: [{
          id: '1',
          ...validCreateGameRequest,
          status: GameStatus.Upcoming,
        }],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
        },
      };
      const result = validateGameListResponse(response);
      expect(result.success).toBe(true);
    });

    it('should reject invalid pagination', () => {
      const response = {
        data: [],
        pagination: {
          page: 0, // invalid page number
          limit: 10,
          total: 0,
        },
      };
      const result = validateGameListResponse(response);
      expect(result.success).toBe(false);
    });
  });

  describe('Game Response Schema', () => {
    it('should validate a valid game response', () => {
      const response = {
        data: {
          id: '1',
          ...validCreateGameRequest,
          status: GameStatus.Upcoming,
        },
      };
      const result = validateGameResponse(response);
      expect(result.success).toBe(true);
    });
  });

  describe('API Error Schema', () => {
    it('should validate a valid error response', () => {
      const error = {
        code: 400,
        message: 'Bad Request',
        details: {
          field: 'title',
          error: 'Title is required',
        },
      };
      const result = validateApiError(error);
      expect(result.success).toBe(true);
    });

    it('should validate error without details', () => {
      const error = {
        code: 404,
        message: 'Not Found',
      };
      const result = validateApiError(error);
      expect(result.success).toBe(true);
    });
  });
}); 