import { cache } from '../cache';
import { storage } from '../storage';

jest.mock('../storage');
jest.useFakeTimers();

const MockStorage = storage as jest.Mocked<typeof storage>;

describe('CacheService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    cache.clear();
  });

  it('should set and get cached data', async () => {
    const testData = { test: 'data' };
    await cache.set('test-key', testData);

    const cachedData = await cache.get('test-key');
    expect(cachedData).toEqual(testData);
  });

  it('should handle cache miss with fetcher', async () => {
    const testData = { test: 'data' };
    const fetcher = jest.fn().mockResolvedValue(testData);

    const result = await cache.get('test-key', fetcher);
    expect(result).toEqual(testData);
    expect(fetcher).toHaveBeenCalled();
  });

  it('should respect TTL', async () => {
    const testData = { test: 'data' };
    const fetcher = jest.fn().mockResolvedValue(testData);

    await cache.set('test-key', testData, { ttl: 1000 });

    // Before TTL expires
    let result = await cache.get('test-key', fetcher);
    expect(result).toEqual(testData);
    expect(fetcher).not.toHaveBeenCalled();

    // Advance time past TTL
    jest.advanceTimersByTime(1500);

    // After TTL expires
    result = await cache.get('test-key', fetcher);
    expect(result).toEqual(testData);
    expect(fetcher).toHaveBeenCalled();
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
    const dispatchEventSpy = jest.spyOn(window, 'dispatchEvent');
    expect(dispatchEventSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'cacheRefresh',
        detail: { key: 'test-key' },
      })
    );
  });

  it('should invalidate cache', async () => {
    const testData = { test: 'data' };
    await cache.set('test-key', testData);

    await cache.invalidate('test-key');
    const result = await cache.get('test-key');
    expect(result).toBeNull();
  });

  it('should return stale data on refresh failure', async () => {
    const testData = { test: 'data' };
    const newData = { test: 'new-data' };
    const fetcher = jest.fn()
      .mockResolvedValueOnce(testData)
      .mockRejectedValueOnce(new Error('Refresh failed'))
      .mockResolvedValueOnce(newData);

    // Initial set
    await cache.set('test-key', testData, { ttl: 1000 });

    // Before TTL expires
    let result = await cache.get('test-key', fetcher);
    expect(result).toEqual(testData);

    // Advance time past TTL
    jest.advanceTimersByTime(1500);

    // After TTL expires, but refresh fails
    result = await cache.get('test-key', fetcher);
    expect(result).toEqual(testData); // Should return stale data

    // Another attempt after failure
    result = await cache.get('test-key', fetcher);
    expect(result).toEqual(newData); // Should succeed with new data
  });

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
    // Fetcher should only be called once
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
}); 