import { Game, SkillLevel, GameStatus } from '@/types/games';
import {
  gameListResponseSchema,
  gameResponseSchema,
  validateCreateGameRequest,
  validateUpdateGameRequest,
  validateGameFilters,
} from '@/schemas/api';
import { cache } from '../cache';
import { z } from 'zod';

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
    ttl: 1000 * 60 * 5, // 5 minutes
    backgroundRefresh: true,
  };

  async getGames(filters?: GameFiltersType) {
    const queryParams = filters ? { ...filters } : undefined;

    return cache.get<Game[]>(
      `games_${JSON.stringify(queryParams)}`,
      async () => {
        const response = await api.get<ApiResponse<Game[]>>('/games', { params: queryParams });
        return response.data;
      },
      GamesApi.CACHE_CONFIG
    ) || [];
  }

  async getGame(id: string) {
    return cache.get<Game>(
      `game_${id}`,
      async () => {
        const response = await api.get<ApiResponse<Game>>(`/games/${id}`);
        return response.data;
      },
      GamesApi.CACHE_CONFIG
    );
  }

  async createGame(data: Omit<Game, 'id' | 'createdAt' | 'updatedAt' | 'status'>) {
    const response = await api.post<ApiResponse<Game>>('/games', data);
    await cache.invalidate('games_{}');
    return response.data;
  }

  async updateGame(id: string, data: Partial<Game>) {
    const response = await api.patch<ApiResponse<Game>>(`/games/${id}`, data);
    await Promise.all([
      cache.invalidate(`game_${id}`),
      cache.invalidate('games_{}'),
    ]);
    return response.data;
  }

  async deleteGame(id: string) {
    await api.delete(`/games/${id}`);
    await Promise.all([
      cache.invalidate(`game_${id}`),
      cache.invalidate('games_{}'),
    ]);
  }

  async joinGame(id: string) {
    const response = await api.post<ApiResponse<Game>>(`/games/${id}/join`);
    return response.data;
  }

  async leaveGame(id: string) {
    const response = await api.post<ApiResponse<Game>>(`/games/${id}/leave`);
    return response.data;
  }

  static async getGames(filters?: GameFiltersType): Promise<Game[]> {
    const response = await api.get<ApiResponse<Game[]>>('/games', { params: filters });
    return response.data;
  }

  static async getGameById(gameId: string): Promise<Game> {
    const response = await api.get<ApiResponse<Game>>(`/games/${gameId}`);
    return response.data;
  }

  static async createGame(data: Omit<Game, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Promise<Game> {
    const response = await api.post<ApiResponse<Game>>('/games', data);
    return response.data;
  }

  static async updateGame(gameId: string, data: Partial<Game>): Promise<Game> {
    const response = await api.patch<ApiResponse<Game>>(`/games/${gameId}`, data);
    return response.data;
  }

  static async deleteGame(gameId: string): Promise<void> {
    await api.delete(`/games/${gameId}`);
  }

  static async joinGame(gameId: string): Promise<Game> {
    const response = await api.post<ApiResponse<Game>>(`/games/${gameId}/join`);
    return response.data;
  }

  static async leaveGame(gameId: string): Promise<Game> {
    const response = await api.post<ApiResponse<Game>>(`/games/${gameId}/leave`);
    return response.data;
  }
}

export const gamesApi = new GamesApi();