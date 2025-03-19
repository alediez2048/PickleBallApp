import React, { useEffect } from 'react';
import { Text, View, ActivityIndicator, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '@/config/supabase';
import { useAuth } from '@/contexts/AuthContext';
import * as Linking from 'expo-linking';

/**
 * This component handles redirects from authentication flows:
 * - Email confirmation
 * - Password reset
 * - OAuth provider redirects
 */
export default function AuthCallback() {
  const router = useRouter();
  const { refreshSession } = useAuth();
  const params = useLocalSearchParams();
  const [status, setStatus] = React.useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = React.useState('Processing authentication...');

  // Add debug info on component mount
  useEffect(() => {
    console.log('[AUTH CALLBACK] Component mounted with params:', params);
    console.log('[AUTH CALLBACK] Current URL:', window?.location?.href);
  }, []);

  useEffect(() => {
    const handleRedirect = async () => {
      try {
        console.log('[AUTH CALLBACK] Processing with params:', params);
        
        // Parse the URL to extract any auth parameters
        const url = Linking.createURL('/auth/callback', params as Record<string, string>);
        console.log('[AUTH CALLBACK] Processing auth redirect from URL:', url);

        if (params.type === 'recovery') {
          // This is a password reset flow
          setMessage('Preparing password reset...');
          // The recovery token is in params.token
          router.replace({
            pathname: "/(auth)/reset-password",
            params: { token: params.token as string }
          } as any);
          return;
        }
        
        // For OAuth and email confirmation flows, we need to exchange the auth code
        if (params.access_token || params.code || params.error_description) {
          // Let Supabase handle the token exchange
          console.log('[AUTH CALLBACK] Attempting to get session with tokens in URL');
          const { data, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error('[AUTH CALLBACK] Error getting session:', error);
            setStatus('error');
            setMessage(`Authentication error: ${error.message}`);
            return;
          }
          
          console.log('[AUTH CALLBACK] Session data received:', data ? 'exists' : 'null');
          
          if (data?.session) {
            console.log('[AUTH CALLBACK] Successfully authenticated, session found');
            
            // Refresh the auth context
            console.log('[AUTH CALLBACK] Refreshing session in auth context');
            await refreshSession();
            
            setStatus('success');
            setMessage('Authentication successful!');
            
            // Navigate to the home screen or onboarding if needed
            console.log('[AUTH CALLBACK] Setting timeout to navigate home');
            setTimeout(() => {
              // Navigate directly to tabs instead of using a relative path
              console.log('[AUTH CALLBACK] Navigating to home');
              router.replace("/(tabs)" as any);
            }, 1000);
          } else {
            console.error('[AUTH CALLBACK] No session found after authentication');
            setStatus('error');
            setMessage('No session found after authentication');
          }
        } else {
          // No auth tokens found, this might be an invalid callback
          console.error('[AUTH CALLBACK] No auth tokens in params');
          setStatus('error');
          setMessage('Invalid authentication callback');
        }
      } catch (error) {
        console.error('[AUTH CALLBACK] Error in auth callback:', error);
        setStatus('error');
        setMessage(`Error: ${error instanceof Error ? error.message : String(error)}`);
      }
    };

    handleRedirect();
  }, [params, router, refreshSession]);

  return (
    <View style={styles.container}>
      {status === 'loading' && <ActivityIndicator size="large" color="#0284c7" />}
      <Text style={[styles.text, status === 'error' ? styles.errorText : null]}>
        {message}
      </Text>
      {status === 'success' && (
        <Text style={styles.successText}>
          Redirecting you to the app...
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#ffffff',
  },
  text: {
    marginTop: 20,
    fontSize: 16,
    textAlign: 'center',
  },
  errorText: {
    color: '#ef4444',
    fontWeight: 'bold',
  },
  successText: {
    color: '#10b981',
    marginTop: 10,
  },
}); 