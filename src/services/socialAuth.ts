// TODO: Fix type issues with @react-native-google-signin/google-signin
// There seems to be a mismatch between the types provided by the package and the actual response.
// This needs investigation and possibly a package update or type overrides.
// Related types that need fixing:
// - SignInResponse.idToken
// - SignInResponse.user

import { GoogleSignin } from '@react-native-google-signin/google-signin';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import { Platform } from 'react-native';
import { AUTH_CONFIG, OAUTH_SCOPES, redirectUri } from '@/config/auth';

// Register WebBrowser for OAuth
WebBrowser.maybeCompleteAuthSession();

// Configure Google Sign In
GoogleSignin.configure({
  iosClientId: AUTH_CONFIG.google.iosClientId,
  webClientId: AUTH_CONFIG.google.webClientId,
  // Android client ID is configured in app.json
});

interface SocialAuthResponse {
  type: 'success' | 'error';
  message?: string;
  token?: string;
  user?: {
    id: string;
    email: string;
    name: string;
    photoUrl?: string;
  };
}

class SocialAuthService {
  async signInWithGoogle(): Promise<SocialAuthResponse> {
    try {
      if (Platform.OS === 'web') {
        return await this.signInWithGoogleWeb();
      }
      
      await GoogleSignin.hasPlayServices();
      const signInResult = await GoogleSignin.signIn();
      
      return {
        type: 'success',
        token: signInResult.idToken ?? undefined,
        user: signInResult.user ? {
          id: signInResult.user.id,
          email: signInResult.user.email,
          name: signInResult.user.name || '',
          photoUrl: signInResult.user.photo ?? undefined,
        } : undefined,
      };
    } catch (error) {
      console.error('Google Sign In Error:', error);
      return {
        type: 'error',
        message: 'Failed to sign in with Google',
      };
    }
  }

  private async signInWithGoogleWeb(): Promise<SocialAuthResponse> {
    try {
      const discovery = await AuthSession.fetchDiscoveryAsync('https://accounts.google.com');
      const request = new AuthSession.AuthRequest({
        clientId: AUTH_CONFIG.google.webClientId,
        scopes: OAUTH_SCOPES.google,
        redirectUri,
      });

      const result = await request.promptAsync(discovery);
      
      if (result.type !== 'success') {
        throw new Error('Google sign in was cancelled or failed');
      }

      // Here you would typically validate the token with your backend
      // and get user information
      return {
        type: 'success',
        token: result.authentication?.accessToken,
        // Note: In a real app, you'd get user info from your backend
        user: {
          id: 'temp-id', // This should come from your backend
          email: 'pending@example.com', // This should come from your backend
          name: 'Pending User', // This should come from your backend
        },
      };
    } catch (error) {
      console.error('Google Web Sign In Error:', error);
      return {
        type: 'error',
        message: 'Failed to sign in with Google',
      };
    }
  }

  async signInWithFacebook(): Promise<SocialAuthResponse> {
    try {
      const request = new AuthSession.AuthRequest({
        clientId: AUTH_CONFIG.facebook.appId,
        scopes: OAUTH_SCOPES.facebook,
        redirectUri,
      });

      // Use the discovery document for Facebook OAuth
      const result = await request.promptAsync({
        authorizationEndpoint: 'https://www.facebook.com/v12.0/dialog/oauth',
      });

      if (result.type !== 'success') {
        throw new Error('Facebook sign in was cancelled or failed');
      }

      // Here you would typically validate the token with your backend
      // and get user information
      return {
        type: 'success',
        token: result.authentication?.accessToken,
        // Note: In a real app, you'd get user info from your backend
        user: {
          id: 'temp-id', // This should come from your backend
          email: 'pending@example.com', // This should come from your backend
          name: 'Pending User', // This should come from your backend
        },
      };
    } catch (error) {
      console.error('Facebook Sign In Error:', error);
      return {
        type: 'error',
        message: 'Failed to sign in with Facebook',
      };
    }
  }
}

export const socialAuth = new SocialAuthService(); 