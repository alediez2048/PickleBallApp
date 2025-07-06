import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { LocationsProvider } from "@/contexts/LocationsContext";
import { FixedGamesProvider } from "@/contexts/FixedGamesContext";
import { GameProvider } from "@/contexts/GameContext";
import { BookedGamesProvider } from "@/contexts/BookedGamesContext";
import "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useSegments } from "expo-router";
import { useEffect, useRef } from "react";
import { StyleSheet, useColorScheme } from "react-native";

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

    let targetRoute = null;
    if (!isAuthenticated) {
      if (!inAuthGroup) {
        targetRoute = "/(auth)/login";
      }
    } else {
      if (!user?.skill_level && !inSkillGroup) {
        targetRoute = "/(skill-select)";
      } else if (
        user?.skill_level &&
        !user?.has_completed_profile &&
        !inProfileSetup
      ) {
        targetRoute = "/(profile-setup)";
      } else if (
        user?.skill_level &&
        user?.has_completed_profile &&
        !inMainApp &&
        (inAuthGroup || inProfileSetup || inSkillGroup)
      ) {
        targetRoute = "/(tabs)";
      }
    }
    if (targetRoute && targetRoute !== lastNavigationRef.current) {
      lastNavigationRef.current = targetRoute;
      router.replace(targetRoute as any);
    }
  }, [
    isAuthenticated,
    segments,
    isLoading,
    user?.skill_level,
    user?.has_completed_profile,
  ]);

  return (
    <Stack>
      <Stack.Screen name="+not-found" options={{ headerShown: false }} />
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen
        name="(profile-setup)/index"
        options={{ headerShown: false }}
      />
      <Stack.Screen name="(skill-select)" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

      <Stack.Screen
        name="admin/locations/index"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="admin/locations/create"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="admin/locations/[id]"
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="admin/fixed-games/[id]"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="admin/fixed-games/create"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="admin/fixed-games/index"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="admin/fixed-games/delete/[id]"
        options={{ headerShown: false }}
      />
      <Stack.Screen name="game/[id]" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider>
      <AuthProvider>
        <LocationsProvider>
          <FixedGamesProvider>
            <GameProvider>
              <BookedGamesProvider>
                <SafeAreaView
                  style={[
                    styles.global,
                    isDark
                      ? { backgroundColor: "#121212" }
                      : { backgroundColor: "#FFFFFF" },
                  ]}
                  edges={["top", "left", "right", "bottom"]}
                >
                  <RootLayoutNav />
                  <StatusBar style="auto" translucent hidden={false} />
                </SafeAreaView>
              </BookedGamesProvider>
            </GameProvider>
          </FixedGamesProvider>
        </LocationsProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  global: {
    flex: 1,
    padding: 0,
    margin: 0,
    backgroundColor: "transparent",
  },
});
