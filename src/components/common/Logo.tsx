import React from "react";
import { View, StyleSheet } from "react-native";
import { ThemedText } from "@/components/common/ThemedText";

export default function Logo() {
  return (
    <View style={styles.logoContainer}>
      <ThemedText type='title' style={styles.logo}>
        PicklePass
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  logoContainer: {
    alignItems: "center",
    marginBottom: 10,
  },
  logo: {
    fontSize: 32,
    fontWeight: "bold",
  },
});
