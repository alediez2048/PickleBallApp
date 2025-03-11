import AsyncStorage from '@react-native-async-storage/async-storage';

// Check if we're running in a browser environment
const isWeb = typeof window !== 'undefined';

// Create a safe version of AsyncStorage that won't break SSR
const safeAsyncStorage = {
  getItem: async (key: string): Promise<string | null> => {
    if (!isWeb) return null;
    return await AsyncStorage.getItem(key);
  },
  setItem: async (key: string, value: string): Promise<void> => {
    if (!isWeb) return;
    return await AsyncStorage.setItem(key, value);
  },
  removeItem: async (key: string): Promise<void> => {
    if (!isWeb) return;
    return await AsyncStorage.removeItem(key);
  },
  clear: async (): Promise<void> => {
    if (!isWeb) return;
    return await AsyncStorage.clear();
  },
  getAllKeys: async (): Promise<readonly string[]> => {
    if (!isWeb) return [];
    return await AsyncStorage.getAllKeys();
  },
  multiGet: async (keys: readonly string[]): Promise<readonly [string, string | null][]> => {
    if (!isWeb) return keys.map(key => [key, null]);
    return await AsyncStorage.multiGet(keys);
  },
  multiSet: async (keyValuePairs: readonly [string, string][]): Promise<void> => {
    if (!isWeb) return;
    return await AsyncStorage.multiSet(keyValuePairs);
  },
  multiRemove: async (keys: readonly string[]): Promise<void> => {
    if (!isWeb) return;
    return await AsyncStorage.multiRemove(keys);
  },
};

export default safeAsyncStorage; 