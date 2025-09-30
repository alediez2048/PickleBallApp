import { GamesApi } from '@/services/api/games';
import { cache } from '@/services/cache';

export class PrefetchManager {
  private static instance: PrefetchManager;
  private gamesApi: GamesApi;
  private prefetchQueue: Set<string>;

  private constructor() {
    this.gamesApi = new GamesApi();
    this.prefetchQueue = new Set();
  }

  static getInstance(): PrefetchManager {
    if (!PrefetchManager.instance) {
      PrefetchManager.instance = new PrefetchManager();
    }
    return PrefetchManager.instance;
  }

  async prefetchGame(id: string): Promise<void> {
    if (this.prefetchQueue.has(id)) return;

    this.prefetchQueue.add(id);
    try {
      await this.gamesApi.getGame(id);
    } finally {
      this.prefetchQueue.delete(id);
    }
  }

  async prefetchUpcomingGames(): Promise<void> {
    await this.gamesApi.getGames({ status: 'Upcoming' });
  }

  async prefetchBookingFlow(gameId: string): Promise<void> {
    // Prefetch the specific game and related data needed for booking
    await Promise.all([
      this.prefetchGame(gameId),
      // Add other related data prefetching here as needed
      // e.g., user profile, payment methods, etc.
    ]);
  }

  clearPrefetchQueue(): void {
    this.prefetchQueue.clear();
  }
}

export const prefetch = PrefetchManager.getInstance(); 