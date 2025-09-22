import { Stack } from "expo-router";
import { StyleSheet } from "react-native";
import { ThemedView } from "@/components/common/ThemedView";

export default function AuthLayout() {
  // Do not block auth routes with a global spinner

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
