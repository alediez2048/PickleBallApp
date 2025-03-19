/**
 * Isomorphic Storage Implementation
 * Provides a compatible AsyncStorage API for both browser and server environments
 */

// Detect if we're in a Node.js environment (server-side)
const isServer = typeof window === 'undefined';

// Server-side in-memory storage implementation
class MemoryStorage {
  private storage = new Map<string, string>();

  async getItem(key: string): Promise<string | null> {
    return this.storage.get(key) || null;
  }

  async setItem(key: string, value: string): Promise<void> {
    this.storage.set(key, value);
  }

  async removeItem(key: string): Promise<void> {
    this.storage.delete(key);
  }

  async clear(): Promise<void> {
    this.storage.clear();
  }

  async multiGet(keys: string[]): Promise<[string, string | null][]> {
    return keys.map(key => [key, this.storage.get(key) || null]);
  }

  async multiSet(keyValuePairs: [string, string][]): Promise<void> {
    keyValuePairs.forEach(([key, value]) => {
      this.storage.set(key, value);
    });
  }

  async multiRemove(keys: string[]): Promise<void> {
    keys.forEach(key => {
      this.storage.delete(key);
    });
  }
}

// Create and export the appropriate storage implementation based on environment
let storageImpl: any;

if (isServer) {
  // Use in-memory implementation for server
  storageImpl = new MemoryStorage();
  console.log('Using server-side memory storage implementation');
} else {
  // Use actual AsyncStorage for client
  try {
    // Dynamic import to avoid reference error during SSR
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    storageImpl = AsyncStorage;
  } catch (e) {
    console.error('Failed to import AsyncStorage, falling back to memory implementation', e);
    storageImpl = new MemoryStorage();
  }
}

export default storageImpl; 