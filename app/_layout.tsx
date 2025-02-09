import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Slot, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { View, Platform, StyleSheet } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// This component handles protected routes and authentication state
function RootLayoutNav() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inVerificationScreen = segments[1] === 'verify-email';

    if (isAuthenticated) {
      if (!user?.emailVerified) {
        // Unverified users should only be on the verification screen
        if (!inVerificationScreen) {
          router.replace('/(auth)/verify-email');
        }
      } else {
        // Verified users should be in the main app
        if (inAuthGroup) {
          router.replace('/(tabs)');
        }
      }
    } else if (!inAuthGroup) {
      // Redirect unauthenticated users to sign in
      router.replace('/login');
    }
  }, [isAuthenticated, segments, isLoading, user?.emailVerified]);

  return <Slot />;
}

// Root layout wraps the app with necessary providers
export default function RootLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    if (Platform.OS === 'web') {
      // Remove any existing background color
      document.body.style.backgroundColor = '';
      document.body.style.background = '#fff';
    }
    SplashScreen.hideAsync();
  }, [colorScheme]);

  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <View style={styles.container}>
          <RootLayoutNav />
          <StatusBar style="dark" />
        </View>
      </ThemeProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
