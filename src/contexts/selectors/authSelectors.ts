import { useMemo } from 'react';
import { useAuth } from '../AuthContext';

// User selectors
export const useUser = () => {
  const { user } = useAuth();
  return useMemo(() => user, [user]);
};

export const useUserProfile = () => {
  const { user } = useAuth();
  return useMemo(() => ({
    id: user?.id,
    name: user?.name,
    email: user?.email,
    isVerified: user?.emailVerified,
  }), [user]);
};

// Auth state selectors
export const useAuthState = () => {
  const { isAuthenticated, isLoading, token } = useAuth();
  return useMemo(() => ({
    isAuthenticated,
    isLoading,
    hasToken: !!token,
    isReady: !isLoading,
    isUnauthenticated: !isAuthenticated && !isLoading,
  }), [isAuthenticated, isLoading, token]);
};

// Social auth state selectors
export const useSocialAuthState = () => {
  const { signInWithGoogle, signInWithFacebook } = useAuth();
  return useMemo(() => ({
    hasGoogleAuth: !!signInWithGoogle,
    hasFacebookAuth: !!signInWithFacebook,
  }), [signInWithGoogle, signInWithFacebook]);
}; 