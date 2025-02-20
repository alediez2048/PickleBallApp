import { cache } from '../cache';
import { storage } from '../storage';

jest.mock('../storage');
jest.useFakeTimers();

const MockStorage = storage as jest.Mocked<typeof storage>;

// Mock storage implementation
const mockStorageData: { [key: string]: string } = {};
MockStorage.setItem.mockImplementation((key, value) => {
  mockStorageData[key] = value;
  return Promise.resolve();
});
MockStorage.getItem.mockImplementation((key) => {
  return Promise.resolve(mockStorageData[key] || null);
});
MockStorage.removeItem.mockImplementation((key) => {
  delete mockStorageData[key];
  return Promise.resolve();
});

describe('CacheService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Object.keys(mockStorageData).forEach(key => delete mockStorageData[key]);
    cache.clear();
  });

  describe('Basic Operations', () => {
    it('should set and get cached data', async () => {
      const testData = { test: 'data' };
      await cache.set('test-key', testData);

      const cachedData = await cache.get('test-key');
      expect(cachedData).toEqual(testData);
      expect(MockStorage.setItem).toHaveBeenCalled();
    });

    it('should handle cache miss with fetcher', async () => {
      const testData = { test: 'data' };
      const fetcher = jest.fn().mockResolvedValue(testData);

      const result = await cache.get('test-key', fetcher);
      expect(result).toEqual(testData);
      expect(fetcher).toHaveBeenCalled();
    });

    it('should return null on cache miss without fetcher', async () => {
      const result = await cache.get('non-existent-key');
      expect(result).toBeNull();
    });

    it('should invalidate cache entries', async () => {
      const testData = { test: 'data' };
      await cache.set('test-key', testData);
      await cache.invalidate('test-key');

      const result = await cache.get('test-key');
      expect(result).toBeNull();
      expect(MockStorage.removeItem).toHaveBeenCalled();
    });
  });

  describe('TTL Behavior', () => {
    it('should respect TTL', async () => {
      const testData = { test: 'data' };
      const newData = { test: 'new-data' };
      const fetcher = jest.fn()
        .mockResolvedValueOnce(testData)
        .mockResolvedValueOnce(newData);

      await cache.set('test-key', testData, { ttl: 1000 });

      // Before TTL expires
      let result = await cache.get('test-key', fetcher);
      expect(result).toEqual(testData);
      expect(fetcher).not.toHaveBeenCalled();

      // Advance time past TTL
      jest.advanceTimersByTime(1500);

      // After TTL expires
      result = await cache.get('test-key', fetcher);
      expect(result).toEqual(newData);
      expect(fetcher).toHaveBeenCalledTimes(1);
    });

    it('should return stale data on refresh failure', async () => {
      const testData = { test: 'data' };
      const fetcher = jest.fn()
        .mockResolvedValueOnce(testData)
        .mockRejectedValueOnce(new Error('Refresh failed'));

      await cache.set('test-key', testData, { ttl: 1000 });

      // Before TTL expires
      let result = await cache.get('test-key', fetcher);
      expect(result).toEqual(testData);

      // Advance time past TTL
      jest.advanceTimersByTime(1500);

      // After TTL expires, but refresh fails
      result = await cache.get('test-key', fetcher);
      expect(result).toEqual(testData); // Should return stale data
      expect(fetcher).toHaveBeenCalledTimes(1);
      expect(console.warn).toHaveBeenCalledWith(
        'Failed to refresh cache for test-key:',
        expect.any(Error)
      );
    });
  });

  describe('Background Refresh', () => {
    beforeEach(() => {
      // Mock window.dispatchEvent
      (global as any).window = {
        dispatchEvent: jest.fn(),
      };
    });

    it('should handle background refresh', async () => {
      const testData = { test: 'data' };
      await cache.set('test-key', testData, {
        ttl: 1000,
        backgroundRefresh: true,
      });

      // Advance time past TTL
      jest.advanceTimersByTime(1500);

      // Verify that refresh event was dispatched
      expect(window.dispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'cacheRefresh',
          detail: { key: 'test-key' },
        })
      );
    });

    it('should clear background refresh on invalidate', async () => {
      const testData = { test: 'data' };
      await cache.set('test-key', testData, {
        ttl: 1000,
        backgroundRefresh: true,
      });

      await cache.invalidate('test-key');

      // Advance time past TTL
      jest.advanceTimersByTime(1500);

      // Verify that no refresh event was dispatched after invalidation
      expect(window.dispatchEvent).not.toHaveBeenCalled();
    });
  });

  describe('Concurrent Operations', () => {
    it('should handle concurrent requests', async () => {
      const testData = { test: 'data' };
      const fetcher = jest.fn().mockResolvedValue(testData);

      // Make multiple concurrent requests
      const requests = Array(5).fill(null).map(() =>
        cache.get('test-key', fetcher)
      );

      const results = await Promise.all(requests);
      
      // All requests should return the same data
      results.forEach(result => expect(result).toEqual(testData));
      // Fetcher should only be called once since we're using a singleton
      expect(fetcher).toHaveBeenCalledTimes(1);
    });

    it('should handle concurrent sets', async () => {
      const testData1 = { test: 'data1' };
      const testData2 = { test: 'data2' };

      // Make concurrent set requests with a small delay to ensure order
      await Promise.all([
        new Promise(resolve => setTimeout(resolve, 10)).then(() =>
          cache.set('test-key', testData1)
        ),
        cache.set('test-key', testData2),
      ]);

      // The last set should win (testData2 in this case)
      const result = await cache.get('test-key');
      expect(result).toEqual(testData2);
    });
  });
}); 