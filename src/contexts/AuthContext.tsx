import React, { createContext, useContext, useState, useEffect } from 'react';
import { router } from 'expo-router';
import { mockApi } from '@/services/mockApi';
import { storage } from '@/services/storage';

interface User {
  id: string;
  email: string;
  name: string;
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
    if (!state.isLoading) {
      if (state.token) {
        router.replace('/(tabs)');
      } else {
        router.replace('/login');
      }
    }
  }, [state.token, state.isLoading]);

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

      // First store the auth data
      await Promise.all([
        storage.setItem('auth_token', token),
        storage.setItem('user', JSON.stringify(user)),
      ]);
      console.log('Auth data stored');

      // Then update the state with the new user data
      setState({ token, user, isLoading: false });
      
      // Finally, navigate to tabs
      router.replace('/(tabs)');
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

  const value = {
    ...state,
    signIn,
    signUp,
    signOut,
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