import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Slot, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { View, Platform } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// This component handles protected routes and authentication state
function RootLayoutNav() {
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (isAuthenticated && inAuthGroup) {
      // Redirect authenticated users away from auth screens
      router.replace('/(tabs)');
    } else if (!isAuthenticated && !inAuthGroup) {
      // Redirect unauthenticated users to sign in
      router.replace('/login');
    }
  }, [isAuthenticated, segments, isLoading]);

  return <Slot />;
}

// Root layout wraps the app with necessary providers
export default function RootLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    if (Platform.OS === 'web') {
      // Remove any existing background color
      document.body.style.backgroundColor = '';
      // Add Tailwind classes to body
      document.body.className = colorScheme === 'dark' ? 'dark bg-gray-900' : 'bg-white';
    }
    SplashScreen.hideAsync();
  }, [colorScheme]);

  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <View className="flex-1 bg-white dark:bg-gray-900">
          <RootLayoutNav />
          <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        </View>
      </ThemeProvider>
    </AuthProvider>
  );
}
