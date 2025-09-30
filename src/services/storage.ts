import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

class Storage {
  async getItem(key: string): Promise<string | null> {
    try {
      if (Platform.OS === "web") {
        // Check if we're in a browser environment
        if (typeof window !== "undefined") {
          return window.localStorage.getItem(key);
        }
        // If we're in SSR/build, return null
        return null;
      }
      // For mobile platforms, use AsyncStorage
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.error("Storage: Error getting item:", error);
      return null;
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    try {
      if (Platform.OS === "web") {
        // Check if we're in a browser environment
        if (typeof window !== "undefined") {
          window.localStorage.setItem(key, value);
          return;
        }
        // If we're in SSR/build, do nothing
        return;
      }
      // For mobile platforms, use AsyncStorage
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.error("Storage: Error setting item:", error);
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      if (Platform.OS === "web") {
        if (typeof window !== "undefined") {
          window.localStorage.removeItem(key);
          return;
        }
        return;
      }
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error("Storage: Error removing item:", error);
    }
  }

  async clearAll(): Promise<void> {
    try {
      if (Platform.OS === "web") {
        if (typeof window !== "undefined") {
          window.localStorage.clear();
          return;
        }
        return;
      }
      await AsyncStorage.clear();
    } catch (error) {
      console.error("Storage: Error clearing storage:", error);
    }
  }
}

export const storage = new Storage();
