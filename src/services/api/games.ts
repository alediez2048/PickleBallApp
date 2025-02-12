import { api } from './client';
import { Game, SkillLevel, GameStatus } from '@/types/game';
import {
  gameListResponseSchema,
  gameResponseSchema,
  validateCreateGameRequest,
  validateUpdateGameRequest,
  validateGameFilters,
} from '@/schemas/api';
import { cache } from '../cache';
import { z } from 'zod';
import { GameFilters } from '@/hooks/useGames';

const gameSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  location: z.object({
    id: z.string(),
    name: z.string(),
    address: z.string(),
    city: z.string(),
    state: z.string(),
    zipCode: z.string(),
    imageUrl: z.string().optional(),
    coordinates: z.object({
      latitude: z.number(),
      longitude: z.number(),
    }).optional(),
  }),
  host: z.object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
    avatarUrl: z.string().optional(),
    skillLevel: z.string().optional(),
  }),
  players: z.array(z.object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
    avatarUrl: z.string().optional(),
    skillLevel: z.string().optional(),
  })),
  maxPlayers: z.number(),
  skillLevel: z.enum(['Beginner', 'Intermediate', 'Advanced', 'All Levels']),
  price: z.number(),
  imageUrl: z.string().optional(),
  status: z.enum(['scheduled', 'in-progress', 'completed', 'cancelled']),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const gamesResponseSchema = z.array(gameSchema);

export type GameFiltersType = {
  skillLevel?: keyof typeof SkillLevel;
  status?: keyof typeof GameStatus;
  startDate?: string;
  endDate?: string;
  location?: string;
  host?: string;
};

interface ApiResponse<T> {
  data: T;
  message?: string;
}

export class GamesApi {
  private static CACHE_CONFIG = {
    ttl: 5 * 60 * 1000, // 5 minutes
    backgroundRefresh: true,
  };

  async getGames(filters?: GameFiltersType) {
    const validatedFilters = validateGameFilters(filters);
    if (!validatedFilters.success) {
      throw new Error('Invalid filters');
    }

    const cacheKey = `games_${JSON.stringify(filters || {})}`;
    
    return cache.get(
      cacheKey,
      async () => {
        const queryParams = filters ? Object.entries(filters).reduce((acc, [key, value]) => {
          if (value !== undefined) {
            acc[key] = String(value);
          }
          return acc;
        }, {} as Record<string, string>) : undefined;

        const response = await api.get<ApiResponse<Game[]>>('/games', { params: queryParams });
        return response.data.data;
      },
      GamesApi.CACHE_CONFIG
    ) || [];
  }

  async getGame(id: string) {
    const cacheKey = `game_${id}`;
    
    return cache.get(
      cacheKey,
      async () => {
        const response = await api.get<ApiResponse<Game>>(`/games/${id}`);
        return response.data.data;
      },
      GamesApi.CACHE_CONFIG
    );
  }

  async createGame(data: Omit<Game, 'id' | 'status'>) {
    const validated = validateCreateGameRequest(data);
    if (!validated.success) {
      throw new Error('Invalid game data');
    }

    const response = await api.post<ApiResponse<Game>>('/games', data);
    
    // Invalidate games list cache
    await cache.invalidate('games_{}');
    
    return response.data.data;
  }

  async updateGame(id: string, data: Partial<Game>) {
    const validated = validateUpdateGameRequest(data);
    if (!validated.success) {
      throw new Error('Invalid update data');
    }

    const response = await api.put<ApiResponse<Game>>(`/games/${id}`, data);
    
    // Invalidate both specific game and games list caches
    await Promise.all([
      cache.invalidate(`game_${id}`),
      cache.invalidate('games_{}')
    ]);
    
    return response.data.data;
  }

  async deleteGame(id: string) {
    await api.delete(`/games/${id}`);
    
    // Invalidate both specific game and games list caches
    await Promise.all([
      cache.invalidate(`game_${id}`),
      cache.invalidate('games_{}')
    ]);
  }

  async joinGame(id: string) {
    return api.post<typeof gameResponseSchema._type>(`/games/${id}/join`, null, {
      schema: gameResponseSchema,
    });
  }

  async leaveGame(id: string) {
    return api.post<typeof gameResponseSchema._type>(`/games/${id}/leave`, null, {
      schema: gameResponseSchema,
    });
  }

  static async getGames(filters?: GameFiltersType): Promise<Game[]> {
    const response = await api.get('/games', { params: filters });
    return gamesResponseSchema.parse(response.data);
  }

  static async getGameById(gameId: string): Promise<Game> {
    const response = await api.get(`/games/${gameId}`);
    return gameSchema.parse(response.data);
  }

  static async createGame(data: Omit<Game, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Promise<Game> {
    const response = await api.post('/games', data);
    return gameSchema.parse(response.data);
  }

  static async updateGame(gameId: string, data: Partial<Game>): Promise<Game> {
    const response = await api.patch(`/games/${gameId}`, data);
    return gameSchema.parse(response.data);
  }

  static async deleteGame(gameId: string): Promise<void> {
    await api.delete(`/games/${gameId}`);
  }

  static async joinGame(gameId: string): Promise<Game> {
    const response = await api.post(`/games/${gameId}/join`);
    return gameSchema.parse(response.data);
  }

  static async leaveGame(gameId: string): Promise<Game> {
    const response = await api.post(`/games/${gameId}/leave`);
    return gameSchema.parse(response.data);
  }
}

export const gamesApi = new GamesApi(); 