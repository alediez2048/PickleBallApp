import { Stack } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { StyleSheet } from "react-native";
import { LoadingSpinner } from "@/components/common/ui/LoadingSpinner";
import { ThemedView } from "@/components/common/ThemedView";
import { ThemedText } from "@/components/common/ThemedText";

export default function AuthLayout() {
  const { isLoading } = useAuth();

  // Show loading spinner while authentication state is being determined
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // ThemedView is used as the main container for consistent theming
  return (
    <ThemedView style={styles.container}>
      {/* Example ThemedText header, can be customized or removed */}
      {/* <ThemedText type="title">Authentication</ThemedText> */}
      <Stack
        screenOptions={{
          header: () => null,
          headerShown: false,
          animation: "fade",
          contentStyle: {
            // ThemedView handles background color
          },
        }}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
