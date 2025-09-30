import * as AuthSession from 'expo-auth-session';

// TODO: Configure OAuth credentials
// 1. Create a project in Google Cloud Console (https://console.cloud.google.com)
// 2. Enable Google Sign-In API
// 3. Create OAuth 2.0 Client IDs for:
//    - iOS
//    - Android
//    - Web
// 4. Create a Facebook App in Facebook Developer Console (https://developers.facebook.com)
// 5. Configure OAuth redirect URIs in both consoles

export const AUTH_CONFIG = {
  google: {
    // Get these from Google Cloud Console OAuth 2.0 Client IDs
    iosClientId: 'YOUR_IOS_CLIENT_ID',
    androidClientId: 'YOUR_ANDROID_CLIENT_ID',
    webClientId: 'YOUR_WEB_CLIENT_ID',
    expoClientId: 'YOUR_EXPO_CLIENT_ID',
  },
  facebook: {
    // Get this from Facebook Developer Console
    appId: 'YOUR_FACEBOOK_APP_ID',
  },
};

// OAuth scopes required for each provider
export const OAUTH_SCOPES = {
  google: ['profile', 'email'],
  facebook: ['public_profile', 'email'],
};

// Update this with your app's scheme from app.json
export const redirectUri = AuthSession.makeRedirectUri({
  scheme: 'pickleballapp',
  path: 'auth',
});