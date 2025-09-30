import React, { useEffect, useState } from "react";
import {
  TextInput,
  Button,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useLocations } from "@/contexts/LocationsContext";
import { useRouter, useLocalSearchParams } from "expo-router";
import BackButton from "@/components/common/BackButton";
import { ThemedText } from "@/components/common/ThemedText";
import { ThemedView } from "@/components/common/ThemedView";
import { useTheme } from "@/contexts/ThemeContext";

export default function AdminLocationEdit() {
  const { getLocation, updateLocation, loading } = useLocations();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [form, setForm] = useState<any>(null);
  const [fetching, setFetching] = useState(true);
  const { colors } = useTheme();

  // Fetch location data on mount
  useEffect(() => {
    (async () => {
      if (id) {
        const location = await getLocation(id);
        if (location) {
          setForm({
            ...location,
            coordinates: location.coordinates || { latitude: 0, longitude: 0 },
          });
        }
        setFetching(false);
      }
    })();
  }, [id]);

  // Handle input change for text fields
  const handleChange = (field: string, value: string) => {
    setForm((prev: any) => ({ ...prev, [field]: value }));
  };

  // Handle input change for coordinates
  const handleCoordinateChange = (
    field: "latitude" | "longitude",
    value: string
  ) => {
    setForm((prev: any) => ({
      ...prev,
      coordinates: { ...prev.coordinates, [field]: parseFloat(value) || 0 },
    }));
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!form.name) return Alert.alert("Name is required");
    const ok = await updateLocation(id, {
      ...form,
      coordinates: form.coordinates,
    });
    if (ok) {
      Alert.alert("Location updated");
      router.replace("/admin/locations");
    }
  };

  if (fetching || !form) return <ActivityIndicator style={{ marginTop: 40 }} />;

  return (
    <ThemedView>
      <ScrollView contentContainerStyle={styles.container}>
        <BackButton />
        <ThemedView style={{ marginTop: 20 }}>
          <ThemedText style={styles.label}>Name*</ThemedText>
          <TextInput
            style={[styles.input, { color: colors.text }]}
            value={form.name}
            onChangeText={(v) => handleChange("name", v)}
          />
          <ThemedText style={styles.label}>Address</ThemedText>
          <TextInput
            style={[styles.input, { color: colors.text }]}
            value={form.address}
            onChangeText={(v) => handleChange("address", v)}
          />
          <ThemedText style={styles.label}>City</ThemedText>
          <TextInput
            style={[styles.input, { color: colors.text }]}
            value={form.city}
            onChangeText={(v) => handleChange("city", v)}
          />
          <ThemedText style={styles.label}>State</ThemedText>
          <TextInput
            style={[styles.input, { color: colors.text }]}
            value={form.state}
            onChangeText={(v) => handleChange("state", v)}
          />
          <ThemedText style={styles.label}>Zip Code</ThemedText>
          <TextInput
            style={[styles.input, { color: colors.text }]}
            value={form.zip_code}
            onChangeText={(v) => handleChange("zip_code", v)}
          />
          <ThemedText style={styles.label}>Image (URL)</ThemedText>
          <TextInput
            style={[styles.input, { color: colors.text }]}
            value={form.image_url}
            onChangeText={(v) => handleChange("image_url", v)}
          />
          <ThemedText style={styles.label}>Latitude</ThemedText>
          <TextInput
            style={[styles.input, { color: colors.text }]}
            value={form.coordinates.latitude?.toString() || ""}
            keyboardType="numeric"
            onChangeText={(v) => handleCoordinateChange("latitude", v)}
          />
          <ThemedText style={styles.label}>Longitude</ThemedText>
          <TextInput
            style={[styles.input, { color: colors.text }]}
            value={form.coordinates.longitude?.toString() || ""}
            keyboardType="numeric"
            onChangeText={(v) => handleCoordinateChange("longitude", v)}
          />
        </ThemedView>
        <ThemedView style={{ marginTop: 20 }}>
          <Button
            title={loading ? "Updating..." : "Update location"}
            onPress={handleSubmit}
            disabled={loading}
          />
        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  label: { marginTop: 12, marginBottom: 4, fontWeight: "bold" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 8,
    marginBottom: 4,
  },
});
