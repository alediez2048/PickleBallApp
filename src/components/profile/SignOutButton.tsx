import React from "react";
import { StyleSheet } from "react-native";
import { ThemedView } from "@/components/common/ThemedView";
import { Button } from "@/components/common/Button";

interface SignOutButtonProps {
  onSignOut: () => Promise<void>;
}

export const SignOutButton: React.FC<SignOutButtonProps> = ({ onSignOut }) => (
  <ThemedView style={styles.signOutContainer}>
    <Button variant="outline" onPress={onSignOut} size="large" fullWidth>
      Sign Out
    </Button>
  </ThemedView>
);

const styles = StyleSheet.create({
  signOutContainer: {
    marginTop: 8,
    marginBottom: 20,
  },
});
