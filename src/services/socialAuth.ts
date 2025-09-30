// TODO: Fix type issues with @react-native-google-signin/google-signin
// There seems to be a mismatch between the types provided by the package and the actual response.
// This needs investigation and possibly a package update or type overrides.
// Related types that need fixing:
// - SignInResponse.idToken
// - SignInResponse.user

import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import { Platform } from 'react-native';
import { AUTH_CONFIG, OAUTH_SCOPES, redirectUri } from '@/config/auth';

// Register WebBrowser for OAuth
WebBrowser.maybeCompleteAuthSession();

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
    return {
      type: 'error',
      message: 'Google Sign-In is not available',
    };
  }

  async signInWithFacebook(): Promise<SocialAuthResponse> {
    return {
      type: 'error',
      message: 'Facebook Sign-In is not available',
    };
  }
}

export const socialAuth = new SocialAuthService(); 