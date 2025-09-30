import React from "react";
import { View, StyleSheet } from "react-native";
import { router } from "expo-router";
import { FirstTimeProfileForm } from "@/components/profile/FirstTimeProfileForm";
import { useAuth } from "@/contexts/AuthContext";

export default function ProfileSetupScreen() {
  const { user } = useAuth();

  const handleProfileComplete = () => {
    // Navigate to membership selection or main app depending on your flow
    router.replace("/(tabs)");
  };

  // If user already has a complete profile, redirect to main app
  React.useEffect(() => {
    if (user?.skill_level) {
      router.replace("/(tabs)");
    }
  }, [user?.skill_level]);

  return (
    <View style={styles.container}>
      <FirstTimeProfileForm onComplete={handleProfileComplete} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
});
