import { Stack } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { StyleSheet } from "react-native";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { ThemedView } from "@/components/common/ThemedView";
import { ThemedText } from "@/components/common/ThemedText";

export default function SkillSelectLayout() {
  // Extract authentication context values
  const { isLoading, user, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect logic based on authentication and user skill level
    if (!isLoading) {
      if (!isAuthenticated) {
        // Redirect to login if the user is not authenticated
        router.replace("/(auth)/login");
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
      <ThemedView style={styles.centeredContainer}>
        <LoadingSpinner message="Loading..." />
      </ThemedView>
    );
  }

  // Render the stack navigator for the skill selection flow
  return (
    <ThemedView style={styles.container}>
      {/* Example ThemedText header, can be customized or removed */}
      {/* <ThemedText type="title">Select Your Skill Level</ThemedText> */}
      <Stack
        screenOptions={{
          header: () => null, // Disable the header
          headerShown: false, // Ensure the header is not shown
          animation: "slide_from_right", // Add a slide animation for transitions
          contentStyle: {
            // ThemedView handles background color
          },
        }}
      />
    </ThemedView>
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
