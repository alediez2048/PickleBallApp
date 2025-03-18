import { supabase, initializeSupabase } from '@/config/supabase';
import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { decode } from 'base64-arraybuffer';
import { v4 as uuidv4 } from 'uuid';

// Define storage buckets
export const STORAGE_BUCKETS = {
  PROFILE_IMAGES: 'profile-images',
  GAME_IMAGES: 'game-images',
  LOCATION_IMAGES: 'location-images',
};

// Create bucket if it doesn't exist (development helper)
const ensureBucketExists = async (bucketName: string): Promise<void> => {
  if (!__DEV__) return; // Only in development
  
  try {
    const { data, error } = await supabase.storage.getBucket(bucketName);
    
    if (error && error.message.includes('does not exist')) {
      await supabase.storage.createBucket(bucketName, {
        public: false,
        fileSizeLimit: 5242880, // 5MB
      });
      console.log(`Created storage bucket: ${bucketName}`);
    }
  } catch (error) {
    console.error(`Error ensuring bucket exists: ${bucketName}`, error);
  }
};

// Initialize buckets
export const initializeStorage = async (): Promise<void> => {
  // Ensure Supabase is initialized
  await initializeSupabase();
  
  // Create buckets if they don't exist (development only)
  if (__DEV__) {
    await Promise.all([
      ensureBucketExists(STORAGE_BUCKETS.PROFILE_IMAGES),
      ensureBucketExists(STORAGE_BUCKETS.GAME_IMAGES),
      ensureBucketExists(STORAGE_BUCKETS.LOCATION_IMAGES),
    ]);
  }
};

/**
 * Uploads a profile image to Supabase storage
 */
export const uploadProfileImage = async (
  userId: string,
  imageData: string | { uri: string; base64: string; timestamp: number }
): Promise<string | null> => {
  try {
    // Ensure the bucket exists
    await ensureBucketExists(STORAGE_BUCKETS.PROFILE_IMAGES);
    
    // Generate a unique filename
    const fileName = `${userId}-${uuidv4()}.jpg`;
    
    // Process image data based on format
    let base64Data: string;
    
    if (typeof imageData === 'string') {
      // If the image is a base64 string directly
      base64Data = imageData.startsWith('data:image')
        ? imageData.split(',')[1]
        : imageData;
    } else {
      // If the image is an object with URI and base64
      if (imageData.base64) {
        base64Data = imageData.base64;
      } else {
        // If we only have URI, we need to read the file
        if (Platform.OS === 'web') {
          throw new Error('Web platform requires base64 data for image upload');
        }
        
        const fileUri = imageData.uri;
        const fileInfo = await FileSystem.getInfoAsync(fileUri);
        
        if (!fileInfo.exists) {
          throw new Error('File does not exist');
        }
        
        const fileContent = await FileSystem.readAsStringAsync(fileUri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        
        base64Data = fileContent;
      }
    }
    
    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKETS.PROFILE_IMAGES)
      .upload(fileName, decode(base64Data), {
        contentType: 'image/jpeg',
        upsert: false,
      });
    
    if (error) {
      console.error('Error uploading profile image:', error);
      return null;
    }
    
    // Get the public URL
    const { data: urlData } = supabase.storage
      .from(STORAGE_BUCKETS.PROFILE_IMAGES)
      .getPublicUrl(fileName);
    
    return urlData.publicUrl;
  } catch (error) {
    console.error('Error in uploadProfileImage:', error);
    return null;
  }
};

/**
 * Gets a profile image URL from Supabase storage
 */
export const getProfileImageUrl = (filePath: string): string => {
  const { data } = supabase.storage
    .from(STORAGE_BUCKETS.PROFILE_IMAGES)
    .getPublicUrl(filePath);
  
  return data.publicUrl;
};

/**
 * Deletes a profile image from Supabase storage
 */
export const deleteProfileImage = async (filePath: string): Promise<boolean> => {
  try {
    const { error } = await supabase.storage
      .from(STORAGE_BUCKETS.PROFILE_IMAGES)
      .remove([filePath]);
    
    if (error) {
      console.error('Error deleting profile image:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in deleteProfileImage:', error);
    return false;
  }
};

/**
 * Uploads a game image to Supabase storage
 */
export const uploadGameImage = async (
  gameId: string,
  imageUri: string
): Promise<string | null> => {
  try {
    // Ensure the bucket exists
    await ensureBucketExists(STORAGE_BUCKETS.GAME_IMAGES);
    
    // Generate a unique filename
    const fileName = `${gameId}-${uuidv4()}.jpg`;
    
    // Read the file content
    if (Platform.OS === 'web') {
      throw new Error('Web platform requires base64 data for image upload');
    }
    
    const fileInfo = await FileSystem.getInfoAsync(imageUri);
    
    if (!fileInfo.exists) {
      throw new Error('File does not exist');
    }
    
    const base64Data = await FileSystem.readAsStringAsync(imageUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    
    // Upload to Supabase Storage
    const { error } = await supabase.storage
      .from(STORAGE_BUCKETS.GAME_IMAGES)
      .upload(fileName, decode(base64Data), {
        contentType: 'image/jpeg',
        upsert: false,
      });
    
    if (error) {
      console.error('Error uploading game image:', error);
      return null;
    }
    
    // Get the public URL
    const { data: urlData } = supabase.storage
      .from(STORAGE_BUCKETS.GAME_IMAGES)
      .getPublicUrl(fileName);
    
    return urlData.publicUrl;
  } catch (error) {
    console.error('Error in uploadGameImage:', error);
    return null;
  }
};

/**
 * Uploads a location image to Supabase storage
 */
export const uploadLocationImage = async (
  locationId: string,
  imageUri: string
): Promise<string | null> => {
  try {
    // Ensure the bucket exists
    await ensureBucketExists(STORAGE_BUCKETS.LOCATION_IMAGES);
    
    // Generate a unique filename
    const fileName = `${locationId}-${uuidv4()}.jpg`;
    
    // Read the file content
    if (Platform.OS === 'web') {
      throw new Error('Web platform requires base64 data for image upload');
    }
    
    const fileInfo = await FileSystem.getInfoAsync(imageUri);
    
    if (!fileInfo.exists) {
      throw new Error('File does not exist');
    }
    
    const base64Data = await FileSystem.readAsStringAsync(imageUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    
    // Upload to Supabase Storage
    const { error } = await supabase.storage
      .from(STORAGE_BUCKETS.LOCATION_IMAGES)
      .upload(fileName, decode(base64Data), {
        contentType: 'image/jpeg',
        upsert: false,
      });
    
    if (error) {
      console.error('Error uploading location image:', error);
      return null;
    }
    
    // Get the public URL
    const { data: urlData } = supabase.storage
      .from(STORAGE_BUCKETS.LOCATION_IMAGES)
      .getPublicUrl(fileName);
    
    return urlData.publicUrl;
  } catch (error) {
    console.error('Error in uploadLocationImage:', error);
    return null;
  }
}; 