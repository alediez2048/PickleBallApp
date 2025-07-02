import React from "react";
import {
  View,
  Button,
  ActivityIndicator,
  Alert,
  StyleSheet,
  FlatList,
} from "react-native";
import { useLocations } from "@/contexts/LocationsContext";
import { Link } from "expo-router";
import BackButton from "@/components/common/BackButton";
import { ThemedText } from "@/components/common/ThemedText";
import { ThemedView } from "@/components/common/ThemedView";
import { useTheme } from "@/contexts/ThemeContext";

export default function AdminLocationsList() {
  const { locations, loading, error, deleteLocation } = useLocations();
  const { colors } = useTheme();

  const handleDelete = (id: string) => {
    Alert.alert(
      "Delete location",
      "Are you sure you want to delete this location?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await deleteLocation(id);
          },
        },
      ]
    );
  };

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} />;
  if (error)
    return (
      <ThemedText style={{ color: "red", margin: 20 }}>{error}</ThemedText>
    );

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <BackButton />
      </View>
      <ThemedView className="my-4">
        <Link href="/admin/locations/create" asChild>
          <Button title="Create new location" color={colors.primary} />
        </Link>
      </ThemedView>
      <FlatList
        data={locations}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ThemedView type="card" colorType="soft" style={styles.item}>
            <ThemedText type="bold" style={styles.name}>
              {item.name}
            </ThemedText>
            <ThemedText style={styles.address}>{item.address}</ThemedText>
            <View style={styles.actions}>
              <Link href={`/admin/locations/${item.id}`} asChild>
                <Button title="Edit" />
              </Link>
              <Button
                title="Delete"
                color="red"
                onPress={() => handleDelete(item.id)}
              />
            </View>
          </ThemedView>
        )}
        ListEmptyComponent={
          <ThemedText style={{ margin: 20 }}>
            No locations registered.
          </ThemedText>
        }
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  item: {
    marginVertical: 8,
    padding: 16,
    borderRadius: 8,
  },
  name: { fontWeight: "bold", fontSize: 16 },
  address: { marginBottom: 8 },
  actions: { flexDirection: "row", gap: 12 },
  header: { marginBottom: 16, height: 40 },
});
