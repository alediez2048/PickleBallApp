import { api } from './client';
import { Game, SkillLevel } from '@/types/game';
import {
  gameListResponseSchema,
  gameResponseSchema,
  validateCreateGameRequest,
  validateUpdateGameRequest,
  validateGameFilters,
} from '@/schemas/api';

export interface GameFilters {
  skillLevel?: SkillLevel;
  date?: string;
  location?: string;
  status?: string;
  page?: number;
  limit?: number;
}

class GamesApi {
  async getGames(filters?: GameFilters) {
    const validatedFilters = validateGameFilters(filters);
    if (!validatedFilters.success) {
      throw new Error('Invalid filters');
    }

    return api.get<typeof gameListResponseSchema._type>('/games', {
      params: filters as Record<string, string>,
      schema: gameListResponseSchema,
    });
  }

  async getGame(id: string) {
    return api.get<typeof gameResponseSchema._type>(`/games/${id}`, {
      schema: gameResponseSchema,
    });
  }

  async createGame(data: Omit<Game, 'id' | 'status'>) {
    const validated = validateCreateGameRequest(data);
    if (!validated.success) {
      throw new Error('Invalid game data');
    }

    return api.post<typeof gameResponseSchema._type>('/games', data, {
      schema: gameResponseSchema,
    });
  }

  async updateGame(id: string, data: Partial<Game>) {
    const validated = validateUpdateGameRequest(data);
    if (!validated.success) {
      throw new Error('Invalid update data');
    }

    return api.patch<typeof gameResponseSchema._type>(`/games/${id}`, data, {
      schema: gameResponseSchema,
    });
  }

  async deleteGame(id: string) {
    return api.delete(`/games/${id}`);
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