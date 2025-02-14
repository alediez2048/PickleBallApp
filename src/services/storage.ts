import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

class Storage {
  async getItem(key: string): Promise<string | null> {
    console.log('Storage: Getting item with key:', key);
    if (Platform.OS === 'web') {
      try {
        const value = window.localStorage.getItem(key);
        console.log('Storage: Retrieved value from localStorage:', value);
        return value;
      } catch (error) {
        console.error('Storage: Error getting item from localStorage:', error);
        return null;
      }
    }
    try {
      const value = await AsyncStorage.getItem(key);
      console.log('Storage: Retrieved value from AsyncStorage:', value);
      return value;
    } catch (error) {
      console.error('Storage: Error getting item from AsyncStorage:', error);
      return null;
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    console.log('Storage: Setting item with key:', key, 'value:', value);
    if (Platform.OS === 'web') {
      try {
        window.localStorage.setItem(key, value);
        console.log('Storage: Successfully set item in localStorage');
      } catch (error) {
        console.error('Storage: Error setting item in localStorage:', error);
      }
      return;
    }
    try {
      await AsyncStorage.setItem(key, value);
      console.log('Storage: Successfully set item in AsyncStorage');
    } catch (error) {
      console.error('Storage: Error setting item in AsyncStorage:', error);
    }
  }

  async removeItem(key: string): Promise<void> {
    console.log('Storage: Removing item with key:', key);
    if (Platform.OS === 'web') {
      try {
        window.localStorage.removeItem(key);
        console.log('Storage: Successfully removed item from localStorage');
      } catch (error) {
        console.error('Storage: Error removing item from localStorage:', error);
      }
      return;
    }
    try {
      await AsyncStorage.removeItem(key);
      console.log('Storage: Successfully removed item from AsyncStorage');
    } catch (error) {
      console.error('Storage: Error removing item from AsyncStorage:', error);
    }
  }

  async clearAll(): Promise<void> {
    console.log('Storage: Clearing all data');
    if (Platform.OS === 'web') {
      try {
        window.localStorage.clear();
        console.log('Storage: Successfully cleared localStorage');
      } catch (error) {
        console.error('Storage: Error clearing localStorage:', error);
      }
      return;
    }
    try {
      await AsyncStorage.clear();
      console.log('Storage: Successfully cleared AsyncStorage');
    } catch (error) {
      console.error('Storage: Error clearing AsyncStorage:', error);
    }
  }
}

export const storage = new Storage(); 