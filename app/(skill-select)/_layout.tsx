import { Stack } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { View, StyleSheet } from "react-native";
import { LoadingSpinner } from "@/components/common/ui/LoadingSpinner";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { useTheme } from "@/contexts/ThemeContext";

export default function SkillSelectLayout() {
  // Extract authentication and theme context values
  const { isLoading, user, isAuthenticated } = useAuth();
  const { colors } = useTheme();
  const router = useRouter();

  useEffect(() => {
    // Redirect logic based on authentication and user skill level
    if (!isLoading) {
      if (!isAuthenticated) {
        // Redirect to login if the user is not authenticated
        router.replace("/login");
        return;
      }

      if (user?.skill_level) {
        // Redirect to the main app if the user already has a skill level
        router.replace("/(tabs)");
      }
    }
  }, [isLoading, isAuthenticated, user?.skill_level, router]);

  // Show a loading spinner while authentication state is being determined
  if (isLoading) {
    return (
      <View
        style={[
          styles.centeredContainer,
          { backgroundColor: colors.background },
        ]}
      >
        <LoadingSpinner message='Loading...' />
      </View>
    );
  }

  // Render the stack navigator for the skill selection flow
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack
        screenOptions={{
          header: () => null, // Disable the header
          headerShown: false, // Ensure the header is not shown
          animation: "slide_from_right", // Add a slide animation for transitions
          contentStyle: {
            backgroundColor: colors.background, // Match the theme's background color
          },
        }}
      />
    </View>
  );
}

// Styles for the layout
const styles = StyleSheet.create({
  container: {
    flex: 1, // Full-screen container
  },
  centeredContainer: {
    flex: 1, // Full-screen container
    justifyContent: "center", // Center content vertically
    alignItems: "center", // Center content horizontally
  },
});
