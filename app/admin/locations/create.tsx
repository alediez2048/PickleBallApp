import React, { useState } from "react";
import {
  View,
  TextInput,
  Button,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import { useLocations } from "@/contexts/LocationsContext";
import { useRouter } from "expo-router";
import BackButton from "@/components/common/BackButton";
import { ThemedText } from "@/components/common/ThemedText";
import { useTheme } from "@/contexts/ThemeContext";

export default function AdminLocationCreate() {
  const { createLocation, loading } = useLocations();
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    zip_code: "",
    image_url: "",
    coordinates: { latitude: 0, longitude: 0 },
  });

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleCoordinateChange = (
    field: "latitude" | "longitude",
    value: string
  ) => {
    setForm((prev) => ({
      ...prev,
      coordinates: { ...prev.coordinates, [field]: parseFloat(value) || 0 },
    }));
  };

  const handleSubmit = async () => {
    if (!form.name) return Alert.alert("Name is required");
    const created = await createLocation(form);
    if (created) {
      Alert.alert("Location created");
      router.replace("/admin/locations");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <BackButton />
      <ThemedText style={styles.label}>Name*</ThemedText>
      <TextInput
        style={styles.input}
        value={form.name}
        onChangeText={(v) => handleChange("name", v)}
      />
      <ThemedText style={styles.label}>Address</ThemedText>
      <TextInput
        style={styles.input}
        value={form.address}
        onChangeText={(v) => handleChange("address", v)}
      />
      <ThemedText style={styles.label}>City</ThemedText>
      <TextInput
        style={styles.input}
        value={form.city}
        onChangeText={(v) => handleChange("city", v)}
      />
      <ThemedText style={styles.label}>State</ThemedText>
      <TextInput
        style={styles.input}
        value={form.state}
        onChangeText={(v) => handleChange("state", v)}
      />
      <ThemedText style={styles.label}>Zip Code</ThemedText>
      <TextInput
        style={styles.input}
        value={form.zip_code}
        onChangeText={(v) => handleChange("zip_code", v)}
      />
      <ThemedText style={styles.label}>Image (URL)</ThemedText>
      <TextInput
        style={styles.input}
        value={form.image_url}
        onChangeText={(v) => handleChange("image_url", v)}
      />
      <ThemedText style={styles.label}>Latitude</ThemedText>
      <TextInput
        style={styles.input}
        value={form.coordinates.latitude.toString()}
        keyboardType='numeric'
        onChangeText={(v) => handleCoordinateChange("latitude", v)}
      />
      <ThemedText style={styles.label}>Longitude</ThemedText>
      <TextInput
        style={styles.input}
        value={form.coordinates.longitude.toString()}
        keyboardType='numeric'
        onChangeText={(v) => handleCoordinateChange("longitude", v)}
      />
      <Button
        title={loading ? "Creating..." : "Create location"}
        onPress={handleSubmit}
        disabled={loading}
      />
    </ScrollView>
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
