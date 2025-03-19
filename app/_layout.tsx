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

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// This component handles protected routes and authentication state
function RootLayoutNav() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const lastNavigationRef = useRef('');

  // Enhanced web-specific debug logging
  useEffect(() => {
    if (Platform.OS === 'web') {
      console.log('[Navigation Debug - Web]', {
        isLoading,
        isAuthenticated,
        currentSegment: segments[0],
        completeSegments: segments,
        userExists: !!user,
        userEmail: user?.email,
        userSkill: user?.skillLevel,
        userProfile: user?.hasCompletedProfile,
      });
    }
  }, [isLoading, isAuthenticated, segments, user]);

  useEffect(() => {
    if (isLoading) return;

    // Fix type safety by checking against strings
    const segment = segments[0] as string;
    const nextSegment = segments[1] as string | undefined;
    
    const inAuthGroup = segment === '(auth)';
    const inSkillGroup = segment === '(skill-select)';
    const inProfileSetup = segment === '(profile-setup)';
    const inMainApp = segment === '(tabs)';
    const inAuthCallback = segment === 'auth' && nextSegment === 'callback';

    // Enhanced debugging
    console.log('[Navigation Debug]', {
      currentSegment: segment,
      secondSegment: nextSegment,
      isAuthenticated,
      hasSkillLevel: user?.skillLevel,
      hasCompletedProfile: user?.hasCompletedProfile,
      inAuthGroup,
      inSkillGroup,
      inProfileSetup,
      inMainApp,
      inAuthCallback,
      platformOS: Platform.OS
    });

    // Don't redirect during auth callback processing
    if (inAuthCallback) {
      console.log('[Navigation] In auth callback flow, skipping navigation logic');
      return;
    }

    // Determine the target route based on current state
    let targetRoute = '';

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
        from: Array.from(segments).join('/'),
        to: targetRoute,
        auth: isAuthenticated,
        profile: user?.hasCompletedProfile,
        skill: user?.skillLevel,
        inMainApp
      });
      
      lastNavigationRef.current = targetRoute;
      // Fix the router navigation by using a type assertion
      router.replace(targetRoute as any);
    }
  }, [isAuthenticated, segments, isLoading, user?.skillLevel, user?.hasCompletedProfile]);

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
