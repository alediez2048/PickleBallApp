import React from 'react';
import { renderHook } from '@testing-library/react-native';
import { AuthProvider } from '../../AuthContext';
import {
  useUser,
  useUserProfile,
  useAuthState,
  useSocialAuthState,
} from '../authSelectors';

interface MockUser {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
}

interface MockAuthContext {
  user: MockUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
  signInWithGoogle: (() => Promise<void>) | null;
  signInWithFacebook: (() => Promise<void>) | null;
}

const mockUser: MockUser = {
  id: '1',
  name: 'Test User',
  email: 'test@example.com',
  emailVerified: true,
};

const mockAuthContext: MockAuthContext = {
  user: mockUser,
  isAuthenticated: true,
  isLoading: false,
  token: 'mock-token',
  signInWithGoogle: () => Promise.resolve(),
  signInWithFacebook: null,
};

jest.mock('../../AuthContext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
  useAuth: () => mockAuthContext,
}));

describe('Auth Selectors', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <AuthProvider>{children}</AuthProvider>
  );

  describe('useUser', () => {
    it('returns the current user', () => {
      const { result } = renderHook(() => useUser(), { wrapper });
      expect(result.current).toEqual(mockUser);
    });

    it('returns null when no user is authenticated', () => {
      mockAuthContext.user = null;
      const { result } = renderHook(() => useUser(), { wrapper });
      expect(result.current).toBeNull();
    });
  });

  describe('useUserProfile', () => {
    beforeEach(() => {
      mockAuthContext.user = mockUser;
    });

    it('returns formatted user profile', () => {
      const { result } = renderHook(() => useUserProfile(), { wrapper });
      expect(result.current).toEqual({
        id: mockUser.id,
        name: mockUser.name,
        email: mockUser.email,
        isVerified: mockUser.emailVerified,
      });
    });

    it('returns null values when no user is authenticated', () => {
      mockAuthContext.user = null;
      const { result } = renderHook(() => useUserProfile(), { wrapper });
      expect(result.current).toEqual({
        id: undefined,
        name: undefined,
        email: undefined,
        isVerified: undefined,
      });
    });
  });

  describe('useAuthState', () => {
    it('returns correct auth state when authenticated', () => {
      mockAuthContext.isAuthenticated = true;
      mockAuthContext.isLoading = false;
      mockAuthContext.token = 'mock-token';

      const { result } = renderHook(() => useAuthState(), { wrapper });
      expect(result.current).toEqual({
        isAuthenticated: true,
        isLoading: false,
        hasToken: true,
        isReady: true,
        isUnauthenticated: false,
      });
    });

    it('returns correct auth state when not authenticated', () => {
      mockAuthContext.isAuthenticated = false;
      mockAuthContext.isLoading = false;
      mockAuthContext.token = null;

      const { result } = renderHook(() => useAuthState(), { wrapper });
      expect(result.current).toEqual({
        isAuthenticated: false,
        isLoading: false,
        hasToken: false,
        isReady: true,
        isUnauthenticated: true,
      });
    });

    it('returns correct auth state while loading', () => {
      mockAuthContext.isAuthenticated = false;
      mockAuthContext.isLoading = true;
      mockAuthContext.token = null;

      const { result } = renderHook(() => useAuthState(), { wrapper });
      expect(result.current).toEqual({
        isAuthenticated: false,
        isLoading: true,
        hasToken: false,
        isReady: false,
        isUnauthenticated: false,
      });
    });
  });

  describe('useSocialAuthState', () => {
    it('returns correct social auth state', () => {
      mockAuthContext.signInWithGoogle = () => Promise.resolve();
      mockAuthContext.signInWithFacebook = null;

      const { result } = renderHook(() => useSocialAuthState(), { wrapper });
      expect(result.current).toEqual({
        hasGoogleAuth: true,
        hasFacebookAuth: false,
      });
    });

    it('returns false for both providers when not available', () => {
      mockAuthContext.signInWithGoogle = null;
      mockAuthContext.signInWithFacebook = null;

      const { result } = renderHook(() => useSocialAuthState(), { wrapper });
      expect(result.current).toEqual({
        hasGoogleAuth: false,
        hasFacebookAuth: false,
      });
    });
  });
}); 