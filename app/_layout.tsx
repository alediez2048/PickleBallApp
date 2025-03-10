import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Slot, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef } from 'react';
import { View, Platform, StyleSheet } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { GameProvider } from '@/contexts/GameContext';
import { UIProvider } from '@/contexts/UIContext';
import { BookedGamesProvider } from '@/contexts/BookedGamesContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider as SupabaseAuthProvider } from './context/AuthContext';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// This component handles protected routes and authentication state
function RootLayoutNav() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const lastNavigationRef = useRef('');

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inSkillGroup = segments[0] === '(skill-select)';
    const inProfileSetup = segments[0] === '(profile-setup)';
    const inMainApp = segments[0] === '(tabs)';
    const isSupabaseTest = segments[0] === 'supabase-test';

    console.log('[Navigation Debug]', {
      currentSegment: segments[0],
      isAuthenticated,
      hasSkillLevel: user?.skillLevel,
      hasCompletedProfile: user?.hasCompletedProfile,
      inAuthGroup,
      inSkillGroup,
      inProfileSetup,
      inMainApp,
      isSupabaseTest
    });

    // Skip redirection for Supabase test screen
    if (isSupabaseTest) {
      return;
    }

    // Determine the target route based on current state
    let targetRoute: '/(auth)/login' | '/(profile-setup)' | '/(skill-select)' | '/(tabs)' | null = null;

    if (!isAuthenticated) {
      // If not authenticated, always go to login unless already in auth group
      if (!inAuthGroup) {
        targetRoute = '/(auth)/login';
      }
    } else {
      // User is authenticated, check skill level first
      if (!user?.skillLevel && !inSkillGroup) {
        targetRoute = '/(skill-select)';
      }
      // Then check profile completion
      else if (user?.skillLevel && !user?.hasCompletedProfile && !inProfileSetup) {
        targetRoute = '/(profile-setup)';
      }
      // Only redirect to main app if all requirements are met
      else if (user?.skillLevel && user?.hasCompletedProfile && !inMainApp && (inAuthGroup || inProfileSetup || inSkillGroup)) {
        targetRoute = '/(tabs)';
      }
    }

    // Only navigate if we have a target and it's different from our last navigation
    if (targetRoute && targetRoute !== lastNavigationRef.current) {
      console.log('[Navigation] Redirecting:', {
        from: segments.join('/'),
        to: targetRoute,
        auth: isAuthenticated,
        profile: user?.hasCompletedProfile,
        skill: user?.skillLevel,
        inMainApp
      });
      
      lastNavigationRef.current = targetRoute;
      router.replace(targetRoute);
    }
  }, [isAuthenticated, segments, isLoading, user?.skillLevel, user?.hasCompletedProfile]);

  return <Slot />;
}

// Create a client
const queryClient = new QueryClient();

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
    <QueryClientProvider client={queryClient}>
      <SupabaseAuthProvider>
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
      </SupabaseAuthProvider>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
