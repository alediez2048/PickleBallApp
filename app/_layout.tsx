import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Slot, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { View, Platform, StyleSheet } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { GameProvider } from '@/contexts/GameContext';
import { UIProvider } from '@/contexts/UIContext';
import { BookedGamesProvider } from '@/contexts/BookedGamesContext';

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
    const inSkillGroup = segments[0] === '(skill-select)';

    if (isAuthenticated) {
      // Check if user needs to set skill level
      if (!user?.skillLevel && segments[0] !== '(skill-select)') {
        router.push('/(skill-select)');
        return;
      }

      // If user has skill level and is in auth or skill select group, redirect to main app
      if ((inAuthGroup || inSkillGroup) && user?.skillLevel) {
        router.replace('/(tabs)');
      }
    } else if (!inAuthGroup) {
      // Redirect unauthenticated users to sign in
      router.replace('/login');
    }
  }, [isAuthenticated, segments, isLoading, user?.skillLevel]);

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
      <UIProvider>
        <GameProvider>
          <BookedGamesProvider>
            <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
              <View style={styles.container}>
                <RootLayoutNav />
                <StatusBar style="dark" />
              </View>
            </ThemeProvider>
          </BookedGamesProvider>
        </GameProvider>
      </UIProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
