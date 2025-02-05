import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';

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
    // Load token and user data from secure storage on app start
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const [token, userString] = await Promise.all([
        SecureStore.getItemAsync('auth_token'),
        SecureStore.getItemAsync('user'),
      ]);

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
      // TODO: Implement actual API call
      const response = await fetch('YOUR_API_URL/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Authentication failed');
      }

      const { token, user } = await response.json();

      // Store auth data securely
      await Promise.all([
        SecureStore.setItemAsync('auth_token', token),
        SecureStore.setItemAsync('user', JSON.stringify(user)),
      ]);

      setState({ token, user, isLoading: false });
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      // TODO: Implement actual API call
      const response = await fetch('YOUR_API_URL/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name }),
      });

      if (!response.ok) {
        throw new Error('Registration failed');
      }

      const { token, user } = await response.json();

      // Store auth data securely
      await Promise.all([
        SecureStore.setItemAsync('auth_token', token),
        SecureStore.setItemAsync('user', JSON.stringify(user)),
      ]);

      setState({ token, user, isLoading: false });
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      // Remove stored auth data
      await Promise.all([
        SecureStore.deleteItemAsync('auth_token'),
        SecureStore.deleteItemAsync('user'),
      ]);

      setState({ token: null, user: null, isLoading: false });
    } catch (error) {
      console.error('Sign out error:', error);
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