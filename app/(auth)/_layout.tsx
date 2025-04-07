import { Stack } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { View, StyleSheet } from "react-native";
import { LoadingSpinner } from "@components/common/ui/LoadingSpinner";
import { useTheme } from "@/contexts/ThemeContext";

export default function AuthLayout() {
  const { isLoading } = useAuth();
  const { colors } = useTheme();

  // Show a loading screen while checking authentication status
  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "fade",
          contentStyle: {
            backgroundColor: "transparent",
          },
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
