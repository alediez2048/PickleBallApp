import { storage } from './storage';

interface CacheConfig {
  ttl?: number; // Time to live in milliseconds
  backgroundRefresh?: boolean;
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  version: number;
}

interface CacheOptions extends CacheConfig {
  key: string;
}

class CacheService {
  private static instance: CacheService;
  private refreshTimers: Map<string, NodeJS.Timeout>;
  private version: Map<string, number>;

  private constructor() {
    this.refreshTimers = new Map();
    this.version = new Map();
  }

  static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  private getKey(key: string): string {
    return `cache_${key}`;
  }

  async set<T>(
    key: string,
    data: T,
    config: CacheConfig = {}
  ): Promise<void> {
    const cacheKey = this.getKey(key);
    const version = (this.version.get(key) || 0) + 1;
    this.version.set(key, version);

    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      version,
    };

    await storage.setItem(cacheKey, JSON.stringify(entry));

    // Set up background refresh if configured
    if (config.backgroundRefresh && config.ttl) {
      this.setupBackgroundRefresh({
        key,
        ttl: config.ttl,
        backgroundRefresh: true,
      });
    }
  }

  async get<T>(
    key: string,
    fetcher?: () => Promise<T>,
    config: CacheConfig = {}
  ): Promise<T | null> {
    const cacheKey = this.getKey(key);
    const cached = await storage.getItem(cacheKey);

    if (!cached) {
      if (fetcher) {
        const data = await fetcher();
        await this.set(key, data, config);
        return data;
      }
      return null;
    }

    const entry: CacheEntry<T> = JSON.parse(cached);
    const now = Date.now();
    const age = now - entry.timestamp;

    // Check if cache is stale
    if (config.ttl && age > config.ttl) {
      if (fetcher) {
        try {
          const data = await fetcher();
          await this.set(key, data, config);
          return data;
        } catch (error) {
          console.warn(`Failed to refresh cache for ${key}:`, error);
          // Return stale data on refresh failure
          return entry.data;
        }
      }
      return null;
    }

    return entry.data;
  }

  async invalidate(key: string): Promise<void> {
    const cacheKey = this.getKey(key);
    await storage.removeItem(cacheKey);
    this.clearBackgroundRefresh(key);
  }

  async clear(): Promise<void> {
    // Clear all cache entries and refresh timers
    const keys = Array.from(this.version.keys());
    await Promise.all(keys.map(key => this.invalidate(key)));
    this.version.clear();
  }

  private setupBackgroundRefresh(options: CacheOptions): void {
    this.clearBackgroundRefresh(options.key);

    if (!options.backgroundRefresh || !options.ttl) return;

    const timer = setInterval(async () => {
      const currentVersion = this.version.get(options.key);
      if (currentVersion === undefined) return;

      const event = new CustomEvent('cacheRefresh', {
        detail: { key: options.key },
      });
      window.dispatchEvent(event);
    }, options.ttl);

    this.refreshTimers.set(options.key, timer);
  }

  private clearBackgroundRefresh(key: string): void {
    const timer = this.refreshTimers.get(key);
    if (timer) {
      clearInterval(timer);
      this.refreshTimers.delete(key);
    }
  }
}

export const cache = CacheService.getInstance(); 