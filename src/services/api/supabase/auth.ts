import { supabase, initializeSupabase } from '@/config/supabase';
import { Session, User, AuthError, RealtimeChannel } from '@supabase/supabase-js';
import { DBProfile } from './schema';
import { Platform } from 'react-native';
import * as Linking from 'expo-linking';
import Constants from 'expo-constants';
import { handleSupabaseError } from './utils';

// Type definitions
export interface SignUpCredentials {
  email: string;
  password: string;
  name: string;
}

export interface SignInCredentials {
  email: string;
  password: string;
}

export interface SocialAuthCredentials {
  provider: 'google' | 'facebook' | 'apple';
}

export interface ResetPasswordCredentials {
  email: string;
}

export interface UpdatePasswordCredentials {
  password: string;
}

export interface AuthResponse {
  user: User | null;
  session: Session | null;
  error: AuthError | Error | null;
}

// Define the redirect URL for OAuth and password reset
const getRedirectUrl = () => {
  // In development, we need different URLs for different platforms
  if (__DEV__) {
    if (Platform.OS === 'web') {
      return window.location.origin;
    } else {
      // Use Expo Linking scheme for native
      const redirectUrl = Linking.createURL('auth/callback');
      return redirectUrl;
    }
  }
  
  // Production URL from constants or environment
  return Constants.expoConfig?.extra?.authRedirectUrl || 
    process.env.EXPO_PUBLIC_AUTH_REDIRECT_URL || 
    'https://pickleballapp.com/auth/callback';
};

/**
 * Initialize authentication
 * Should be called early in app lifecycle
 */
export const initializeAuth = async (): Promise<void> => {
  try {
    // Ensure Supabase client is initialized
    await initializeSupabase();
    
    // Set up deep link handling for auth flows
    const url = await Linking.getInitialURL();
    if (url) {
      handleDeepLink(url);
    }
    
    // Listen for deep links while the app is running
    Linking.addEventListener('url', ({ url }) => {
      handleDeepLink(url);
    });
    
    if (__DEV__) {
      console.log('Auth service initialized');
    }
  } catch (error) {
    console.error('Error initializing auth:', error);
  }
};

/**
 * Handle deep links for authentication flows
 */
const handleDeepLink = async (url: string): Promise<void> => {
  if (!url) return;
  
  try {
    // Extract the type and token from the URL
    const parsed = Linking.parse(url);
    
    // Handle auth-related deep links
    if (parsed.path?.includes('auth/reset-password') && parsed.queryParams?.token) {
      // Navigate to password reset screen
      // This will need to be handled by the app's navigation
      console.log('Password reset token received:', parsed.queryParams.token);
    } else if (parsed.path?.includes('auth/callback')) {
      // Handle OAuth callback
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        throw error;
      }
      if (__DEV__) {
        console.log('OAuth authentication completed');
      }
    }
  } catch (error) {
    console.error('Error handling deep link:', error);
  }
};

/**
 * Sign up with email and password
 */
export const signUp = async (credentials: SignUpCredentials): Promise<AuthResponse> => {
  try {
    // Initialize Supabase if not already done
    await initializeSupabase();
    
    // Sign up the user
    const { data, error } = await supabase.auth.signUp({
      email: credentials.email,
      password: credentials.password,
      options: {
        data: {
          name: credentials.name
        }
      }
    });
    
    if (error) {
      throw error;
    }
    
    return {
      user: data.user,
      session: data.session,
      error: null
    };
  } catch (error) {
    console.error('Sign up error:', error);
    return {
      user: null,
      session: null,
      error: handleSupabaseError(error)
    };
  }
};

/**
 * Sign in with email and password
 */
export const signIn = async (credentials: SignInCredentials): Promise<AuthResponse> => {
  try {
    // Initialize Supabase if not already done
    await initializeSupabase();
    
    // Sign in the user
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password
    });
    
    if (error) {
      throw error;
    }
    
    return {
      user: data.user,
      session: data.session,
      error: null
    };
  } catch (error) {
    console.error('Sign in error:', error);
    return {
      user: null,
      session: null,
      error: handleSupabaseError(error)
    };
  }
};

/**
 * Sign in with a third-party provider
 */
export const signInWithProvider = async (credentials: SocialAuthCredentials): Promise<AuthResponse> => {
  try {
    // Initialize Supabase if not already done
    await initializeSupabase();
    
    const redirectTo = getRedirectUrl();
    
    // Sign in with the provider
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: credentials.provider,
      options: {
        redirectTo
      }
    });
    
    if (error) {
      throw error;
    }
    
    // For OAuth, we can only return the URL, not the session right away
    return {
      user: null,
      session: null,
      error: null
    };
  } catch (error) {
    console.error('Social sign in error:', error);
    return {
      user: null,
      session: null,
      error: handleSupabaseError(error)
    };
  }
};

/**
 * Sign out the current user
 */
export const signOut = async (): Promise<{ error: Error | null }> => {
  try {
    // Initialize Supabase if not already done
    await initializeSupabase();
    
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      throw error;
    }
    
    return { error: null };
  } catch (error) {
    console.error('Sign out error:', error);
    return { error: handleSupabaseError(error) };
  }
};

/**
 * Reset password (send reset email)
 */
export const resetPassword = async (credentials: ResetPasswordCredentials): Promise<{ error: Error | null }> => {
  try {
    // Initialize Supabase if not already done
    await initializeSupabase();
    
    const redirectTo = `${getRedirectUrl()}/reset-password/update`;
    
    const { error } = await supabase.auth.resetPasswordForEmail(credentials.email, {
      redirectTo
    });
    
    if (error) {
      throw error;
    }
    
    return { error: null };
  } catch (error) {
    console.error('Password reset error:', error);
    return { error: handleSupabaseError(error) };
  }
};

/**
 * Update password after reset
 */
export const updatePassword = async (credentials: UpdatePasswordCredentials): Promise<{ error: Error | null }> => {
  try {
    // Initialize Supabase if not already done
    await initializeSupabase();
    
    const { error } = await supabase.auth.updateUser({
      password: credentials.password
    });
    
    if (error) {
      throw error;
    }
    
    return { error: null };
  } catch (error) {
    console.error('Update password error:', error);
    return { error: handleSupabaseError(error) };
  }
};

/**
 * Get the current session
 */
export const getSession = async (): Promise<{ session: Session | null; error: Error | null }> => {
  try {
    // Initialize Supabase if not already done
    await initializeSupabase();
    
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      throw error;
    }
    
    return {
      session: data.session,
      error: null
    };
  } catch (error) {
    console.error('Get session error:', error);
    return {
      session: null,
      error: handleSupabaseError(error)
    };
  }
};

/**
 * Get the current user
 */
export const getCurrentUser = async (): Promise<{ user: User | null; error: Error | null }> => {
  try {
    // Initialize Supabase if not already done
    await initializeSupabase();
    
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      throw error;
    }
    
    return {
      user,
      error: null
    };
  } catch (error) {
    console.error('Get user error:', error);
    return {
      user: null,
      error: handleSupabaseError(error)
    };
  }
};

/**
 * Get a user's profile data
 */
export const getUserProfile = async (userId: string): Promise<{ profile: DBProfile | null; error: Error | null }> => {
  try {
    // Initialize Supabase if not already done
    await initializeSupabase();
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      throw error;
    }
    
    return {
      profile: data as DBProfile,
      error: null
    };
  } catch (error) {
    console.error('Get profile error:', error);
    return {
      profile: null,
      error: handleSupabaseError(error)
    };
  }
};

// Type for auth state change 
export type AuthChangeCallback = (event: string, session: Session | null) => void;

/**
 * Set up auth state change listener
 */
export const onAuthStateChange = (callback: AuthChangeCallback) => {
  return supabase.auth.onAuthStateChange(callback);
};

// Type for profile update callback
export type ProfileChangeCallback = (profile: DBProfile | null) => void;

/**
 * Set up user profile change listener
 */
export const onProfileChange = (userId: string, callback: ProfileChangeCallback): RealtimeChannel => {
  return supabase
    .channel(`public:profiles:id=eq.${userId}`)
    .on('postgres_changes', { 
      event: '*', 
      schema: 'public', 
      table: 'profiles',
      filter: `id=eq.${userId}`
    }, (payload) => {
      callback(payload.new as DBProfile);
    })
    .subscribe();
};

export default {
  initializeAuth,
  signUp,
  signIn,
  signInWithProvider,
  signOut,
  resetPassword,
  updatePassword,
  getSession,
  getCurrentUser,
  getUserProfile,
  onAuthStateChange,
  onProfileChange
}; 