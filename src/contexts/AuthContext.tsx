import React, { createContext, useContext, useState, useEffect } from 'react';
import { router } from 'expo-router';
import { mockApi } from '@/services/mockApi';
import { storage } from '@/services/storage';
import { socialAuth } from '@/services/socialAuth';
import { Alert } from 'react-native';

interface User {
  id: string;
  email: string;
  name: string;
  emailVerified: boolean;
  skillLevel?: string;
  profileImage?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
}

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithFacebook: () => Promise<void>;
  updateProfile: (data: { skillLevel?: string; profileImage?: string }) => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: true,
  });

  useEffect(() => {
    // Load token and user data from storage on app start
    loadStoredAuth();
  }, []);

  useEffect(() => {
    // Only navigate when auth state changes, not on every loading state change
    if (!state.isLoading && state.token === null) {
      router.replace('/login');
    }
  }, [state.token]);

  const loadStoredAuth = async () => {
    try {
      console.log('Loading stored auth data...');
      const [token, userString] = await Promise.all([
        storage.getItem('auth_token'),
        storage.getItem('user'),
      ]);

      console.log('Stored auth data:', { token, userString });

      if (token && userString) {
        const user = JSON.parse(userString);
        setState({ token, user, isLoading: false });
      } else {
        setState({ token: null, user: null, isLoading: false });
      }
    } catch (error) {
      console.error('Error loading auth data:', error);
      setState({ token: null, user: null, isLoading: false });
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Signing in...', { email });
      setState(prev => ({ ...prev, isLoading: true }));
      
      const { token, user } = await mockApi.login({ email, password });
      console.log('Sign in successful:', { token, user });

      await Promise.all([
        storage.setItem('auth_token', token),
        storage.setItem('user', JSON.stringify(user)),
      ]);
      console.log('Auth data stored');

      setState({ token, user, isLoading: false });
    } catch (error) {
      console.error('Sign in error:', error);
      setState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      console.log('Signing up...', { email, name });
      setState(prev => ({ ...prev, isLoading: true }));
      
      const { token, user } = await mockApi.register({ email, password, name });
      console.log('Sign up successful:', { token, user });

      // Store the auth data
      await Promise.all([
        storage.setItem('auth_token', token),
        storage.setItem('user', JSON.stringify(user)),
      ]);
      console.log('Auth data stored');

      // Update the state with the new user data
      setState({ token, user, isLoading: false });
      // Navigation will be handled by the root layout based on emailVerified status
    } catch (error) {
      console.error('Sign up error:', error);
      setState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  const signOut = async () => {
    try {
      console.log('Signing out...');
      setState(prev => ({ ...prev, isLoading: true }));
      
      await Promise.all([
        storage.removeItem('auth_token'),
        storage.removeItem('user'),
      ]);
      console.log('Auth data removed');

      setState({ token: null, user: null, isLoading: false });
    } catch (error) {
      console.error('Sign out error:', error);
      setState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  const handleSocialAuthSuccess = async (
    provider: 'google' | 'facebook',
    token: string,
    user: { id: string; email: string; name: string; photoUrl?: string }
  ) => {
    try {
      const response = await mockApi.socialAuth({ token, provider, user });
      
      await Promise.all([
        storage.setItem('auth_token', response.token),
        storage.setItem('user', JSON.stringify(response.user)),
      ]);

      setState({
        token: response.token,
        user: response.user,
        isLoading: false,
      });
    } catch (error) {
      console.error(`${provider} auth error:`, error);
      Alert.alert('Error', `Failed to authenticate with ${provider}`);
    }
  };

  const signInWithGoogle = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      const result = await socialAuth.signInWithGoogle();
      
      if (result.type === 'success' && result.token && result.user) {
        await handleSocialAuthSuccess('google', result.token, result.user);
      } else {
        throw new Error(result.message || 'Google sign in failed');
      }
    } catch (error) {
      console.error('Google sign in error:', error);
      Alert.alert('Error', 'Failed to sign in with Google');
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const signInWithFacebook = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      const result = await socialAuth.signInWithFacebook();
      
      if (result.type === 'success' && result.token && result.user) {
        await handleSocialAuthSuccess('facebook', result.token, result.user);
      } else {
        throw new Error(result.message || 'Facebook sign in failed');
      }
    } catch (error) {
      console.error('Facebook sign in error:', error);
      Alert.alert('Error', 'Failed to sign in with Facebook');
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const updateProfile = async (data: { skillLevel?: string; profileImage?: string }) => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      if (!state.user?.email) {
        throw new Error('No authenticated user');
      }

      const { user: updatedUser } = await mockApi.updateProfile(state.user.email, data);
      
      await storage.setItem('user', JSON.stringify(updatedUser));
      
      setState(prev => ({
        ...prev,
        user: updatedUser,
        isLoading: false
      }));
    } catch (error) {
      console.error('Profile update error:', error);
      setState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  const value = {
    ...state,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
    signInWithFacebook,
    updateProfile,
    isAuthenticated: !!state.token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 