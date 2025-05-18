import React from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Button,
  Alert,
  StyleSheet,
} from "react-native";
import { useLocations } from "@/contexts/LocationsContext";
import { Link } from "expo-router";

export default function AdminLocationsList() {
  const { locations, loading, error, deleteLocation } = useLocations();

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
  if (error) return <Text style={{ color: "red", margin: 20 }}>{error}</Text>;

  return (
    <View style={styles.container}>
      <Link href='/admin/locations/create' asChild>
        <Button title='Create new location' />
      </Link>
      <FlatList
        data={locations}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.address}>{item.address}</Text>
            <View style={styles.actions}>
              <Link href={`/admin/locations/${item.id}`} asChild>
                <Button title='Edit' />
              </Link>
              <Button
                title='Delete'
                color='red'
                onPress={() => handleDelete(item.id)}
              />
            </View>
          </View>
        )}
        ListEmptyComponent={
          <Text style={{ margin: 20 }}>No locations registered.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  item: {
    backgroundColor: "#f9f9f9",
    marginVertical: 8,
    padding: 16,
    borderRadius: 8,
  },
  name: { fontWeight: "bold", fontSize: 16 },
  address: { color: "#555", marginBottom: 8 },
  actions: { flexDirection: "row", gap: 12 },
});
