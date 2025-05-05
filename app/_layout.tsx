import { Slot, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef } from "react";
import { View, StyleSheet } from "react-native";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { GameProvider } from "@/contexts/GameContext";
import { UIProvider } from "@/contexts/UIContext";
import { BookedGamesProvider } from "@/contexts/BookedGamesContext";
import { ThemeProvider, useTheme } from "@/contexts/ThemeContext";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// This component handles protected routes and authentication state
function RootLayoutNav() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const lastNavigationRef = useRef("");

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === "(auth)";
    const inSkillGroup = segments[0] === "(skill-select)";
    const inProfileSetup = segments[0] === "(profile-setup)";
    const inMainApp = segments[0] === "(tabs)";

    console.log("[Navigation Debug]", {
      currentSegment: segments[0],
      isAuthenticated,
      hasCompletedProfile: user?.has_completed_profile,
      inAuthGroup,
      inSkillGroup,
      inProfileSetup,
      inMainApp,
    });

    // Determine the target route based on current state
    let targetRoute:
      | "/(auth)/login"
      | "/(profile-setup)"
      | "/(skill-select)"
      | "/(tabs)"
      | null = null;

    if (!isAuthenticated) {
      // If not authenticated, always go to login unless already in auth group
      if (!inAuthGroup) {
        targetRoute = "/(auth)/login";
      }
    } else {
      // User is authenticated, check skill level first
      if (!user?.skill_level && !inSkillGroup) {
        targetRoute = "/(skill-select)";
      }
      // Then check profile completion
      else if (
        user?.skill_level &&
        !user?.has_completed_profile &&
        !inProfileSetup
      ) {
        targetRoute = "/(profile-setup)";
      }
      // Only redirect to main app if all requirements are met
      else if (
        user?.skill_level &&
        user?.has_completed_profile &&
        !inMainApp &&
        (inAuthGroup || inProfileSetup || inSkillGroup)
      ) {
        targetRoute = "/(tabs)";
      }
    }

    // Only navigate if we have a target and it's different from our last navigation
    if (targetRoute && targetRoute !== lastNavigationRef.current) {
      console.log("[Navigation] Redirecting:", {
        from: segments.join("/"),
        to: targetRoute,
        auth: isAuthenticated,
        profile: user?.has_completed_profile,
        skill: user?.skill_level,
        inMainApp,
      });

      lastNavigationRef.current = targetRoute;
      router.replace(targetRoute);
    }
  }, [
    isAuthenticated,
    segments,
    isLoading,
    user?.skill_level,
    user?.has_completed_profile,
  ]);

  return <Slot />;
}

// Root layout wraps the app with necessary providers
export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <UIProvider>
          <GameProvider>
            <BookedGamesProvider>
              <View style={styles.container}>
                <RootLayoutNav />
                <StatusBar style='dark' />
              </View>
            </BookedGamesProvider>
          </GameProvider>
        </UIProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
});
