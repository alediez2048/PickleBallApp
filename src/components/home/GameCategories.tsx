import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { IconSymbol } from "@/components/common/IconSymbol";

const CATEGORIES = [
  { id: "beginner", name: "Beginner", icon: "gamecontroller.fill" },
  { id: "intermediate", name: "Intermediate", icon: "trophy.fill" },
  { id: "advanced", name: "Advanced", icon: "trophy.fill" },
] as const;

export function GameCategories() {
  return (
    <View style={styles.container}>
      <ThemedText style={styles.title}>Categories</ThemedText>
      <View style={styles.categoriesContainer}>
        {CATEGORIES.map((category) => (
          <TouchableOpacity key={category.id} style={styles.category}>
            <IconSymbol name={category.icon} size={24} color='#4CAF50' />
            <ThemedText style={styles.categoryText}>{category.name}</ThemedText>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 12,
  },
  categoriesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  category: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: "500",
  },
});
