import { useState, useEffect, useCallback } from 'react';
import { Session, User, RealtimeChannel } from '@supabase/supabase-js';
import * as authService from '@/services/api/supabase/auth';
import { DBProfile } from '@/services/api/supabase/schema';

type AuthSubscription = {
  data: { subscription: { unsubscribe: () => void } };
};

/**
 * Custom hook for Supabase authentication
 */
export function useSupabaseAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<DBProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Initialize auth and session
  useEffect(() => {
    let mounted = true;
    let authListener: AuthSubscription | null = null;
    let profileListener: RealtimeChannel | null = null;

    async function initialize() {
      try {
        // Initialize auth service
        await authService.initializeAuth();

        // Get initial session
        const { session: initialSession, error: sessionError } = await authService.getSession();
        if (sessionError) throw sessionError;

        if (mounted) {
          setSession(initialSession);
          
          if (initialSession?.user) {
            setUser(initialSession.user);
            
            // Fetch profile
            profileListener = await fetchProfile(initialSession.user.id);
          }
        }

        // Set up auth state change listener
        authListener = authService.onAuthStateChange((event, changedSession) => {
          if (mounted) {
            setSession(changedSession);
            setUser(changedSession?.user || null);
            
            if (changedSession?.user) {
              // Clean up previous listener if it exists
              if (profileListener) {
                profileListener.unsubscribe();
              }
              
              // Set up new listener
              fetchProfile(changedSession.user.id).then(listener => {
                if (listener) {
                  profileListener = listener;
                }
              });
            } else if (event === 'SIGNED_OUT') {
              setProfile(null);
            }
          }
        }) as AuthSubscription;
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err : new Error(String(err)));
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    initialize();

    return () => {
      mounted = false;
      // Clean up listeners
      if (authListener?.data?.subscription) {
        authListener.data.subscription.unsubscribe();
      }
      if (profileListener) {
        profileListener.unsubscribe();
      }
    };
  }, []);

  // Fetch user profile
  const fetchProfile = useCallback(async (userId: string): Promise<RealtimeChannel | null> => {
    try {
      const { profile: userProfile, error: profileError } = await authService.getUserProfile(userId);
      if (profileError) throw profileError;

      setProfile(userProfile);

      // Set up profile change listener
      const listener = authService.onProfileChange(userId, (updatedProfile) => {
        if (updatedProfile) {
          setProfile(updatedProfile);
        }
      });
      
      return listener;
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      return null;
    }
  }, []);

  // Sign in with email and password
  const signIn = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const { user: authUser, session: authSession, error: authError } = 
        await authService.signIn({ email, password });

      if (authError) throw authError;

      setUser(authUser);
      setSession(authSession);

      if (authUser) {
        await fetchProfile(authUser.id);
      }

      return { user: authUser, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(new Error(errorMessage));
      return { user: null, error: new Error(errorMessage) };
    } finally {
      setIsLoading(false);
    }
  }, [fetchProfile]);

  // Sign up with email and password
  const signUp = useCallback(async (email: string, password: string, name: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const { user: authUser, error: authError } = 
        await authService.signUp({ email, password, name });

      if (authError) throw authError;

      return { user: authUser, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(new Error(errorMessage));
      return { user: null, error: new Error(errorMessage) };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Sign in with a third-party provider
  const signInWithProvider = useCallback(async (provider: 'google' | 'facebook' | 'apple') => {
    setIsLoading(true);
    setError(null);

    try {
      const { error: authError } = 
        await authService.signInWithProvider({ provider });

      if (authError) throw authError;

      return { error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(new Error(errorMessage));
      return { error: new Error(errorMessage) };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Sign out
  const signOut = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { error: authError } = await authService.signOut();

      if (authError) throw authError;

      setUser(null);
      setSession(null);
      setProfile(null);

      return { error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(new Error(errorMessage));
      return { error: new Error(errorMessage) };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Reset password
  const resetPassword = useCallback(async (email: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const { error: authError } = await authService.resetPassword({ email });

      if (authError) throw authError;

      return { error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(new Error(errorMessage));
      return { error: new Error(errorMessage) };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update password
  const updatePassword = useCallback(async (password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const { error: authError } = await authService.updatePassword({ password });

      if (authError) throw authError;

      return { error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(new Error(errorMessage));
      return { error: new Error(errorMessage) };
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    user,
    session,
    profile,
    isLoading,
    error,
    signIn,
    signUp,
    signInWithProvider,
    signOut,
    resetPassword,
    updatePassword,
    refreshProfile: () => user && fetchProfile(user.id)
  };
} 