import React from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { ThemedText } from "@/components/common/ThemedText";
import { ThemedView } from "@/components/common/ThemedView";

export default function BackButton() {
  const router = useRouter();

  return (
    <ThemedView style={styles.header}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <ThemedText>← Back</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  backButton: {
    position: "absolute",
    top: 25,
    left: 0,
    zIndex: 10,
    marginBottom: 16,
  },
  header: {
    height: 40,
    marginBottom: 16,
  },
});
