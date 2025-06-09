import { Stack } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { StyleSheet } from "react-native";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { ThemedView } from "@/components/common/ThemedView";

export default function AuthLayout() {
  const { isLoading } = useAuth();

  // Show loading spinner while authentication state is being determined
  if (isLoading) {
    return (
      <ThemedView style={styles.loading}>
        <LoadingSpinner />
      </ThemedView>
    );
  }

  // ThemedView is used as the main container for consistent theming
  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.content}>
        <Stack
          screenOptions={{
            header: () => null,
            headerShown: false,
            animation: "fade",
          }}
        />
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
    paddingHorizontal: 2,
    justifyContent: "center",
    alignItems: "stretch",
    maxWidth: 400,
    alignSelf: "center",
    width: "100%",
  },
});
