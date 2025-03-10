import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Keys for storage
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_ID: 'user_id',
};

// Save a value securely
export async function saveSecurely(key: string, value: string): Promise<void> {
  if (Platform.OS === 'web') {
    await AsyncStorage.setItem(key, value);
  } else {
    await SecureStore.setItemAsync(key, value);
  }
}

// Get a securely stored value
export async function getSecurely(key: string): Promise<string | null> {
  if (Platform.OS === 'web') {
    return await AsyncStorage.getItem(key);
  } else {
    return await SecureStore.getItemAsync(key);
  }
}

// Remove a securely stored value
export async function removeSecurely(key: string): Promise<void> {
  if (Platform.OS === 'web') {
    await AsyncStorage.removeItem(key);
  } else {
    await SecureStore.deleteItemAsync(key);
  }
}

// Clear all securely stored values
export async function clearSecureStorage(): Promise<void> {
  const keys = Object.values(STORAGE_KEYS);
  
  if (Platform.OS === 'web') {
    for (const key of keys) {
      await AsyncStorage.removeItem(key);
    }
  } else {
    for (const key of keys) {
      await SecureStore.deleteItemAsync(key);
    }
  }
} 