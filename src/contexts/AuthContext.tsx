import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { router } from 'expo-router';
import { mockApi, FirstTimeProfileData, UpdateProfileData } from '@/services/mockApi';
import { storage } from '@/services/storage';
import { socialAuth } from '@/services/socialAuth';
import { Alert, Platform } from 'react-native';
import { MembershipPlan } from '@/types/membership';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { supabase } from '@/config/supabase';
import { User } from '@supabase/supabase-js';
import * as authService from '@/services/api/supabase/auth';
import * as storageApi from '@/services/api/supabase/storage';
import { DBProfile } from '@/services/api/supabase/schema';

interface PaymentMethod {
  id: string;
  last4: string;
  brand: string;
  expiryMonth: string;
  expiryYear: string;
  isDefault: boolean;
}

interface UserProfile {
  id?: string;
  email?: string;
  name?: string;
  isVerified?: boolean;
  skillLevel?: string;
  profileImage?: string | {
    uri: string;
    base64: string;
    timestamp: number;
  };
  phoneNumber?: string;
  dateOfBirth?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  membership?: MembershipPlan;
  paymentMethods?: PaymentMethod[];
  hasCompletedProfile?: boolean;
}

interface AuthState {
  user: UserProfile | null;
  token: string | null;
  isLoading: boolean;
}

interface AuthContextType extends AuthState {
  // Authentication methods
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  
  // Social authentication methods
  signInWithGoogle: () => Promise<void>;
  signInWithFacebook: () => Promise<void>;
  
  // Profile management methods
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  updateFirstTimeProfile: (data: FirstTimeProfileData) => Promise<void>;
  updateMembership: (plan: MembershipPlan) => Promise<void>;
  updatePaymentMethods: (methods: PaymentMethod[]) => Promise<void>;
  updatePaymentMethod?: (hasPaymentMethod: boolean) => Promise<void>;
  
  // Session management
  refreshSession: () => Promise<void>;
  
  // Auth state
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper to map Supabase profile to app's UserProfile format
const mapSupabaseProfileToUserProfile = (supabaseUser: User | null, profile: any): UserProfile | null => {
  if (!supabaseUser) return null;
  
  return {
    id: supabaseUser.id,
    email: supabaseUser.email || undefined,
    name: profile?.name || supabaseUser.user_metadata?.name,
    isVerified: supabaseUser.email_confirmed_at ? true : false,
    skillLevel: profile?.skill_level,
    profileImage: profile?.profile_image_url,
    phoneNumber: profile?.phone_number,
    dateOfBirth: profile?.date_of_birth,
    // We'll need to fetch address separately if needed
    hasCompletedProfile: profile?.has_completed_profile || false,
    // We'll need to fetch these separately if needed
    // membership: ...,
    // paymentMethods: ...,
  };
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Use the Supabase auth hook
  const {
    user: supabaseUser,
    session,
    profile: supabaseProfile,
    isLoading: supabaseLoading,
    error: supabaseError,
    signIn: supabaseSignIn,
    signUp: supabaseSignUp,
    signOut: supabaseSignOut,
    signInWithProvider,
    resetPassword,
    updatePassword,
    refreshProfile
  } = useSupabaseAuth();
  
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: true,
  });

  // Map Supabase user and profile to our app's user format whenever they change
  useEffect(() => {
    if (supabaseLoading) {
      setState(prev => ({ ...prev, isLoading: true }));
      return;
    }
    
    const mappedUser = mapSupabaseProfileToUserProfile(supabaseUser, supabaseProfile);
    const token = session?.access_token || null;
    
    setState({
      user: mappedUser,
      token,
      isLoading: false,
    });
    
  }, [supabaseUser, supabaseProfile, session, supabaseLoading]);

  // Log any Supabase errors
  useEffect(() => {
    if (supabaseError) {
      console.error('Supabase auth error:', supabaseError);
    }
  }, [supabaseError]);

  // ----- Auth Methods -----

  // In the AuthProvider component, define refreshSession method first
  const refreshSession = useCallback(async () => {
    try {
      console.log('[AuthContext] Attempting to refresh session');
      // Get current session from Supabase
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('[AuthContext] Error refreshing session:', error);
        throw error;
      }
      
      if (data?.session) {
        console.log('[AuthContext] Session refreshed successfully');
        // Refresh profile data - this will trigger the useEffect that updates state
        refreshProfile();
      } else {
        console.warn('[AuthContext] No session found during refresh');
      }
    } catch (error) {
      console.error('[AuthContext] Session refresh error:', error);
      throw error;
    }
  }, [refreshProfile]);

  // Add a method to check for email signup redirects on app start (for web)
  const checkEmailSignupRedirect = useCallback(async () => {
    if (Platform.OS !== 'web') return;
    
    try {
      console.log('[AuthContext] Checking for email signup redirect on web');
      
      // Get the URL parameters
      const url = window.location.href;
      if (url.includes('#access_token=') || url.includes('type=signup') || url.includes('type=recovery')) {
        console.log('[AuthContext] Detected auth parameters in URL');
        
        // Let Supabase handle the auth params
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('[AuthContext] Error processing auth redirect:', error);
          return;
        }
        
        if (data?.session) {
          console.log('[AuthContext] Successfully authenticated from URL parameters');
          await refreshProfile();
        }
      }
    } catch (error) {
      console.error('[AuthContext] Error checking email signup redirect:', error);
    }
  }, [refreshProfile]);

  // Call the check on component mount for web platform
  useEffect(() => {
    if (Platform.OS === 'web') {
      checkEmailSignupRedirect();
    }
  }, [checkEmailSignupRedirect]);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const { user, error } = await supabaseSignIn(email, password);
      
      if (error) {
        throw error;
      }
      
      if (!user) {
        throw new Error('Unknown error during sign in');
      }
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  }, [supabaseSignIn]);

  const signUp = useCallback(async (email: string, password: string, name: string) => {
    try {
      const { user, error } = await supabaseSignUp(email, password, name);
      
      if (error) {
        throw error;
      }
      
      if (!user) {
        throw new Error('Unknown error during sign up');
      }
      
      console.log('[AuthContext] Sign up successful, checking confirmation method:', user.identities);
      
      // In the web version, after signup, the user may need to be confirmed
      // We should show a message but also check if we have an active session already
      if (Platform.OS === 'web') {
        console.log('[AuthContext] Web signup - checking for active session');
        // If we have an active session, the user was auto-confirmed
        const { data } = await supabase.auth.getSession();
        
        if (data?.session) {
          console.log('[AuthContext] Web signup - active session found, user confirmed');
          // We have a session, refresh profile
          await refreshSession();
          return;
        }
      }
      
      // Show confirmation message
      Alert.alert(
        'Email Verification',
        'We have sent you an email with a verification link. Please check your email to complete the sign up process.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  }, [supabaseSignUp, refreshSession]);

  const signOut = useCallback(async () => {
    try {
      const { error } = await supabaseSignOut();
      
      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  }, [supabaseSignOut]);

  // ----- Social Auth Methods -----

  const signInWithGoogle = useCallback(async () => {
    try {
      const { error } = await signInWithProvider('google');
      
      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Google sign in error:', error);
      throw error;
    }
  }, [signInWithProvider]);

  const signInWithFacebook = useCallback(async () => {
    try {
      const { error } = await signInWithProvider('facebook');
      
      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Facebook sign in error:', error);
      throw error;
    }
  }, [signInWithProvider]);

  // ----- Profile Methods -----
  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    if (!state.user?.id) {
      throw new Error('User not authenticated');
    }
    
    try {
      // Map UserProfile updates to DBProfile format
      const profileUpdates: Partial<DBProfile> = {
        name: updates.name,
        display_name: updates.name, // Use name as display_name if not provided
        skill_level: updates.skillLevel,
        phone_number: updates.phoneNumber,
        date_of_birth: updates.dateOfBirth,
        profile_image_url: typeof updates.profileImage === 'string' ? updates.profileImage : undefined,
        has_completed_profile: updates.hasCompletedProfile,
        updated_at: new Date().toISOString()
      };

      // If there's a profile image update, handle it first
      if (updates.profileImage && typeof updates.profileImage === 'object' && 'uri' in updates.profileImage) {
        const { uri, base64 } = updates.profileImage as { uri: string; base64: string };
        const imageUrl = await storageApi.uploadProfileImage(state.user.id, { uri, base64, timestamp: Date.now() });
        if (imageUrl) {
          profileUpdates.profile_image_url = imageUrl;
        }
      }
      
      const { profile, error } = await authService.updateProfile(state.user.id, profileUpdates);
      
      if (error) throw error;
      
      if (profile) {
        setState(prev => ({
          ...prev,
          user: mapSupabaseProfileToUserProfile(supabaseUser, profile)
        }));
      }
      
      // Refresh the profile to ensure we have the latest data
      refreshProfile();
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  }, [state.user, supabaseUser, refreshProfile]);

  const updateFirstTimeProfile = useCallback(async (data: FirstTimeProfileData) => {
    if (!state.user?.id) {
      throw new Error('User not authenticated');
    }
    
    try {
      // Ensure required fields are present
      if (!data.skillLevel) {
        throw new Error('Skill level is required for first-time profile setup');
      }

      // Map FirstTimeProfileData to DBProfile format
      const profileData = {
        name: state.user.name || '',
        display_name: data.displayName,
        phone_number: data.phoneNumber,
        date_of_birth: data.dateOfBirth,
        skill_level: data.skillLevel,
        has_completed_profile: true,
        waiver_accepted: data.waiverAccepted,
        waiver_signed_at: data.waiverSignedAt || new Date().toISOString(),
        terms_accepted: data.termsAccepted,
        terms_accepted_at: data.termsAcceptedAt,
        privacy_policy_accepted: data.privacyPolicyAccepted,
        privacy_policy_accepted_at: data.privacyPolicyAcceptedAt
      } as const; // Use const assertion to ensure type inference
      
      const { profile, error } = await authService.updateFirstTimeProfile(state.user.id, profileData);
      
      if (error) throw error;
      
      if (profile) {
        setState(prev => ({
          ...prev,
          user: mapSupabaseProfileToUserProfile(supabaseUser, profile)
        }));
      }
      
      // Refresh the profile to ensure we have the latest data
      refreshProfile();
    } catch (error) {
      console.error('Update first time profile error:', error);
      throw error;
    }
  }, [state.user, supabaseUser, refreshProfile]);

  const updateMembership = useCallback(async (plan: MembershipPlan) => {
    if (!state.user?.id) {
      throw new Error('User not authenticated');
    }
    
    try {
      // Update user with new membership plan directly in state
      // Later we'll implement this in Supabase
      
      setState(prev => ({
        ...prev,
        user: {
          ...prev.user,
          membership: plan
        } as UserProfile
      }));
      
      console.log('Membership updated successfully:', plan);
    } catch (error) {
      console.error('Update membership error:', error);
      throw error;
    }
  }, [state.user]);

  const updatePaymentMethods = useCallback(async (methods: PaymentMethod[]) => {
    if (!state.user?.id) {
      throw new Error('User not authenticated');
    }
    
    try {
      // Update user with new payment methods directly in state
      // Later we'll implement this in Supabase
      
      setState(prev => ({
        ...prev,
        user: {
          ...prev.user,
          paymentMethods: methods
        } as UserProfile
      }));
      
      console.log('Payment methods updated successfully:', methods);
    } catch (error) {
      console.error('Update payment methods error:', error);
      throw error;
    }
  }, [state.user]);

  const value = {
    ...state,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
    signInWithFacebook,
    updateProfile,
    updateFirstTimeProfile,
    updateMembership,
    updatePaymentMethods,
    refreshSession,
    isAuthenticated: !!state.user && !!state.token,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 