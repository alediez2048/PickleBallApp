import React from 'react';
import renderer from 'react-test-renderer';
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
  isVerified?: boolean;
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
  isVerified: true,
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

// Components to test the hooks
const UserComponent: React.FC = () => {
  const user = useUser();
  return (
    <div data-testid="user-component">
      {user ? (
        <div>
          <div>ID: {user.id}</div>
          <div>Name: {user.name}</div>
          <div>Email: {user.email}</div>
          <div>Email Verified: {user.isVerified ? 'Yes' : 'No'}</div>
        </div>
      ) : (
        <div>No user found</div>
      )}
    </div>
  );
};

const UserProfileComponent: React.FC = () => {
  const profile = useUserProfile();
  return (
    <div data-testid="profile-component">
      <div>ID: {profile.id || 'undefined'}</div>
      <div>Name: {profile.name || 'undefined'}</div>
      <div>Email: {profile.email || 'undefined'}</div>
      <div>Verified: {profile.isVerified ? 'Yes' : 'No'}</div>
    </div>
  );
};

const AuthStateComponent: React.FC = () => {
  const authState = useAuthState();
  return (
    <div data-testid="auth-state-component">
      <div>Is Authenticated: {authState.isAuthenticated ? 'Yes' : 'No'}</div>
      <div>Is Loading: {authState.isLoading ? 'Yes' : 'No'}</div>
      <div>Has Token: {authState.hasToken ? 'Yes' : 'No'}</div>
      <div>Is Ready: {authState.isReady ? 'Yes' : 'No'}</div>
      <div>Is Unauthenticated: {authState.isUnauthenticated ? 'Yes' : 'No'}</div>
    </div>
  );
};

const SocialAuthStateComponent: React.FC = () => {
  const socialAuthState = useSocialAuthState();
  return (
    <div data-testid="social-auth-state-component">
      <div>Has Google Auth: {socialAuthState.hasGoogleAuth ? 'Yes' : 'No'}</div>
      <div>Has Facebook Auth: {socialAuthState.hasFacebookAuth ? 'Yes' : 'No'}</div>
    </div>
  );
};

describe('Auth Selectors', () => {
  const wrapper = (component: React.ReactElement) => (
    <AuthProvider>{component}</AuthProvider>
  );

  describe('useUser', () => {
    it('returns the current user', () => {
      mockAuthContext.user = mockUser;
      const tree = renderer.create(wrapper(<UserComponent />)).toJSON();
      expect(tree).toMatchSnapshot('authenticated user');
    });

    it('returns null when no user is authenticated', () => {
      mockAuthContext.user = null;
      const tree = renderer.create(wrapper(<UserComponent />)).toJSON();
      expect(tree).toMatchSnapshot('no user');
    });
  });

  describe('useUserProfile', () => {
    beforeEach(() => {
      mockAuthContext.user = mockUser;
    });

    it('returns formatted user profile', () => {
      const tree = renderer.create(wrapper(<UserProfileComponent />)).toJSON();
      expect(tree).toMatchSnapshot('authenticated user profile');
    });

    it('returns null values when no user is authenticated', () => {
      mockAuthContext.user = null;
      const tree = renderer.create(wrapper(<UserProfileComponent />)).toJSON();
      expect(tree).toMatchSnapshot('empty user profile');
    });
  });

  describe('useAuthState', () => {
    it('returns correct auth state when authenticated', () => {
      mockAuthContext.isAuthenticated = true;
      mockAuthContext.isLoading = false;
      mockAuthContext.token = 'mock-token';

      const tree = renderer.create(wrapper(<AuthStateComponent />)).toJSON();
      expect(tree).toMatchSnapshot('authenticated state');
    });

    it('returns correct auth state when not authenticated', () => {
      mockAuthContext.isAuthenticated = false;
      mockAuthContext.isLoading = false;
      mockAuthContext.token = null;

      const tree = renderer.create(wrapper(<AuthStateComponent />)).toJSON();
      expect(tree).toMatchSnapshot('unauthenticated state');
    });

    it('returns correct auth state while loading', () => {
      mockAuthContext.isAuthenticated = false;
      mockAuthContext.isLoading = true;
      mockAuthContext.token = null;

      const tree = renderer.create(wrapper(<AuthStateComponent />)).toJSON();
      expect(tree).toMatchSnapshot('loading state');
    });
  });

  describe('useSocialAuthState', () => {
    it('returns correct social auth state', () => {
      mockAuthContext.signInWithGoogle = () => Promise.resolve();
      mockAuthContext.signInWithFacebook = null;

      const tree = renderer.create(wrapper(<SocialAuthStateComponent />)).toJSON();
      expect(tree).toMatchSnapshot('google auth available');
    });

    it('returns false for both providers when not available', () => {
      mockAuthContext.signInWithGoogle = null;
      mockAuthContext.signInWithFacebook = null;

      const tree = renderer.create(wrapper(<SocialAuthStateComponent />)).toJSON();
      expect(tree).toMatchSnapshot('no social auth available');
    });
  });
}); 