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
  }, [supabaseSignUp]);

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
  // For now, we'll use a mix of Supabase for auth and mockApi for profile management
  // Later, we'll migrate these to use Supabase fully

  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    if (!state.user?.id) {
      throw new Error('User not authenticated');
    }
    
    try {
      // For now, we'll continue using mockApi for profile updates
      // In the future, we'll replace this with Supabase updates
      
      // Map UserProfile to UpdateProfileData format expected by mockApi
      const profileUpdates: UpdateProfileData = { 
        ...updates,
        // Handle address mapping if it exists
        address: updates.address ? {
          address: updates.address.street || '',
          city: updates.address.city || '',
          state: updates.address.state || '',
          zipCode: updates.address.zipCode || '',
          country: updates.address.country || 'United States'
        } : undefined
      } as UpdateProfileData;
      
      const { user: updatedUser } = await mockApi.updateProfile(state.user.email || '', profileUpdates);
      
      setState(prev => ({
        ...prev,
        user: {
          ...prev.user,
          ...updatedUser
        } as UserProfile
      }));
      
      // If we updated the profile image, we might need to refresh the Supabase profile
      if (updates.profileImage) {
        refreshProfile();
      }
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  }, [state.user, refreshProfile]);

  const updateFirstTimeProfile = useCallback(async (data: FirstTimeProfileData) => {
    if (!state.user?.id) {
      throw new Error('User not authenticated');
    }
    
    try {
      // Map FirstTimeProfileData to UpdateProfileData
      const profileData: UpdateProfileData = {
        skillLevel: data.skillLevel,
        displayName: data.displayName,
        phoneNumber: data.phoneNumber,
        dateOfBirth: data.dateOfBirth,
        address: {
          address: data.address.address,
          city: data.address.city,
          state: data.address.state,
          zipCode: data.address.zipCode,
          country: data.address.country
        },
        hasCompletedProfile: true
      };
      
      const { user: updatedUser } = await mockApi.updateProfile(state.user.email || '', profileData);
      
      setState(prev => ({
        ...prev,
        user: {
          ...prev.user,
          ...updatedUser,
          hasCompletedProfile: true
        } as UserProfile
      }));
      
      // Refresh the Supabase profile
      refreshProfile();
    } catch (error) {
      console.error('Update first time profile error:', error);
      throw error;
    }
  }, [state.user, refreshProfile]);

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