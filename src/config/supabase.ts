import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Add debug logging to help identify the issue
const isServer = typeof window === 'undefined';
console.log('Supabase config - Environment:', isServer ? 'Server (Node.js)' : 'Client (Browser/Native)');

// Get the URL and key from environment variables or Constants
const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl || 
  process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey || 
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase URL or anon key. Make sure to set these in your environment variables.');
}

console.log('Supabase config - Creating client with URL:', supabaseUrl);

// Create a client configuration with storage based on environment
let storageConfig;
if (isServer) {
  console.log('Supabase config - Using server-side storage configuration');
  // Don't use AsyncStorage on the server
  storageConfig = { 
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  };
} else {
  console.log('Supabase config - Using client-side AsyncStorage');
  storageConfig = {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  };
}

// Initialize the Supabase client with environment-appropriate config
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: storageConfig,
});

// Initialize function that ensures supabase is only fully set up in browser environments
let isInitialized = false;
export const initializeSupabase = async (): Promise<void> => {
  console.log('initializeSupabase called - Environment:', isServer ? 'Server' : 'Client', 'Platform:', Platform.OS);
  
  if (isInitialized) {
    console.log('Supabase already initialized, skipping');
    return;
  }
  
  // Only do session loading on client side
  if (!isServer) {
    try {
      console.log('Attempting to initialize Supabase client-side features');
      
      // For web platform, check if we have URL auth parameters that need processing
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        const hasHashParams = window.location.hash && 
          (window.location.hash.includes('access_token') || 
           window.location.hash.includes('error_description'));
        
        // Directly handling hash params from OAuth redirects on web
        if (hasHashParams) {
          console.log('Web platform detected with hash params, processing OAuth return');
          const { data, error } = await supabase.auth.getSession();
          if (error) {
            console.error('Error getting session from hash params:', error);
          } else if (data?.session) {
            console.log('Session obtained from hash params');
          }
        }
      }
      
      isInitialized = true;
    } catch (error) {
      console.error('Error initializing Supabase:', error);
      throw error;
    }
  } else {
    console.log('Skipping client-side Supabase initialization on server');
    isInitialized = true;
  }
};

// For debugging in development
if (__DEV__) {
  console.log('Supabase basic client created with URL:', supabaseUrl);
} 