export const AUTH_CONFIG = {
  google: {
    iosClientId: 'YOUR_IOS_CLIENT_ID', // Add this from Google Cloud Console
    androidClientId: 'YOUR_ANDROID_CLIENT_ID', // Add this from Google Cloud Console
    webClientId: 'YOUR_WEB_CLIENT_ID', // Add this from Google Cloud Console
    expoClientId: 'YOUR_EXPO_CLIENT_ID', // Add this from Google Cloud Console
  },
  facebook: {
    appId: 'YOUR_FACEBOOK_APP_ID', // Add this from Facebook Developer Console
  },
};

// Scopes for different providers
export const OAUTH_SCOPES = {
  google: ['profile', 'email'],
  facebook: ['public_profile', 'email'],
};

// OAuth redirect URL
export const redirectUri = 'your.app.scheme://'; 