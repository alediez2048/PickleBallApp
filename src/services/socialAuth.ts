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
  androidClientId: AUTH_CONFIG.google.androidClientId,
  webClientId: AUTH_CONFIG.google.webClientId,
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
      const userInfo = await GoogleSignin.signIn();
      
      if (!userInfo.user) {
        throw new Error('Failed to get user information');
      }

      return {
        type: 'success',
        token: userInfo.idToken || undefined,
        user: {
          id: userInfo.user.id,
          email: userInfo.user.email,
          name: userInfo.user.name || '',
          photoUrl: userInfo.user.photo || undefined,
        },
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

      const result = await request.promptAsync({
        authUrl: 'https://www.facebook.com/v12.0/dialog/oauth',
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