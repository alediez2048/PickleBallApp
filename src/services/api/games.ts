import { api } from './client';
import { Game, SkillLevel } from '@/types/game';
import {
  gameListResponseSchema,
  gameResponseSchema,
  validateCreateGameRequest,
  validateUpdateGameRequest,
  validateGameFilters,
} from '@/schemas/api';
import { cache } from '../cache';

export interface GameFilters {
  skillLevel?: SkillLevel;
  date?: string;
  location?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export class GamesApi {
  private static CACHE_CONFIG = {
    ttl: 5 * 60 * 1000, // 5 minutes
    backgroundRefresh: true,
  };

  async getGames(filters?: GameFilters) {
    const validatedFilters = validateGameFilters(filters);
    if (!validatedFilters.success) {
      throw new Error('Invalid filters');
    }

    const cacheKey = `games_${JSON.stringify(filters || {})}`;
    
    return cache.get(
      cacheKey,
      async () => {
        const response = await api.get<typeof gameListResponseSchema._type>('/games', {
          params: filters as Record<string, string>,
          schema: gameListResponseSchema,
        });
        const games = gameListResponseSchema.parse(response.data);
        return games;
      },
      GamesApi.CACHE_CONFIG
    ) || [];
  }

  async getGame(id: string) {
    const cacheKey = `game_${id}`;
    
    return cache.get(
      cacheKey,
      async () => {
        const response = await api.get<typeof gameResponseSchema._type>(`/games/${id}`, {
          schema: gameResponseSchema,
        });
        const game = gameResponseSchema.parse(response.data);
        return game;
      },
      GamesApi.CACHE_CONFIG
    );
  }

  async createGame(data: Omit<Game, 'id' | 'status'>) {
    const validated = validateCreateGameRequest(data);
    if (!validated.success) {
      throw new Error('Invalid game data');
    }

    const game = await api.post<typeof gameResponseSchema._type>('/games', data, {
      schema: gameResponseSchema,
    });
    
    // Invalidate games list cache
    await cache.invalidate('games_{}');
    
    return game;
  }

  async updateGame(id: string, data: Partial<Game>) {
    const validated = validateUpdateGameRequest(data);
    if (!validated.success) {
      throw new Error('Invalid update data');
    }

    const game = await api.patch<typeof gameResponseSchema._type>(`/games/${id}`, data, {
      schema: gameResponseSchema,
    });
    
    // Invalidate both specific game and games list caches
    await Promise.all([
      cache.invalidate(`game_${id}`),
      cache.invalidate('games_{}')
    ]);
    
    return game;
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
}

export const gamesApi = new GamesApi(); 