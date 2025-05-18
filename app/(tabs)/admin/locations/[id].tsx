import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, ScrollView, ActivityIndicator, Alert } from "react-native";
import { useLocations } from "@/contexts/LocationsContext";
import { useRouter, useLocalSearchParams } from "expo-router";

export default function AdminLocationEdit() {
  const { getLocation, updateLocation, loading } = useLocations();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [form, setForm] = useState<any>(null);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    (async () => {
      if (id) {
        const loc = await getLocation(id);
        if (loc) {
          setForm({
            ...loc,
            coordinates: loc.coordinates || { latitude: 0, longitude: 0 },
          });
        }
        setFetching(false);
      }
    })();
  }, [id]);

  const handleChange = (field: string, value: string) => {
    setForm((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleCoordinateChange = (field: "latitude" | "longitude", value: string) => {
    setForm((prev: any) => ({
      ...prev,
      coordinates: { ...prev.coordinates, [field]: parseFloat(value) || 0 },
    }));
  };

  const handleSubmit = async () => {
    if (!form.name) return Alert.alert("El nombre es obligatorio");
    const ok = await updateLocation(id, {
      ...form,
      coordinates: form.coordinates,
    });
    if (ok) {
      Alert.alert("Ubicación actualizada");
      router.replace("/admin/locations");
    }
  };

  if (fetching || !form) return <ActivityIndicator style={{ marginTop: 40 }} />;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.label}>Nombre*</Text>
      <TextInput style={styles.input} value={form.name} onChangeText={v => handleChange("name", v)} />
      <Text style={styles.label}>Dirección</Text>
      <TextInput style={styles.input} value={form.address} onChangeText={v => handleChange("address", v)} />
      <Text style={styles.label}>Ciudad</Text>
      <TextInput style={styles.input} value={form.city} onChangeText={v => handleChange("city", v)} />
      <Text style={styles.label}>Estado</Text>
      <TextInput style={styles.input} value={form.state} onChangeText={v => handleChange("state", v)} />
      <Text style={styles.label}>Código Postal</Text>
      <TextInput style={styles.input} value={form.zip_code} onChangeText={v => handleChange("zip_code", v)} />
      <Text style={styles.label}>Imagen (URL)</Text>
      <TextInput style={styles.input} value={form.image_url} onChangeText={v => handleChange("image_url", v)} />
      <Text style={styles.label}>Latitud</Text>
      <TextInput style={styles.input} value={form.coordinates.latitude?.toString() || ""} keyboardType="numeric" onChangeText={v => handleCoordinateChange("latitude", v)} />
      <Text style={styles.label}>Longitud</Text>
      <TextInput style={styles.input} value={form.coordinates.longitude?.toString() || ""} keyboardType="numeric" onChangeText={v => handleCoordinateChange("longitude", v)} />
      <Button title={loading ? "Actualizando..." : "Actualizar ubicación"} onPress={handleSubmit} disabled={loading} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  label: { marginTop: 12, marginBottom: 4, fontWeight: "bold" },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 6, padding: 8, marginBottom: 4 },
});
