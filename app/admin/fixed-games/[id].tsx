// Edit view for Fixed Games
import React, { useEffect, useState } from "react";
import {
  TextInput,
  Button,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useFixedGames } from "@/contexts/FixedGamesContext";
import { ThemedText } from "@/components/common/ThemedText";
import { ThemedView } from "@/components/common/ThemedView";
import { useTheme } from "@/contexts/ThemeContext";

export default function FixedGameEdit() {
  const { getFixedGame, updateFixedGame, loading } = useFixedGames();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [form, setForm] = useState<any>(null);
  const [fetching, setFetching] = useState(true);
  const { colors } = useTheme();

  // Fetch fixed game data on mount
  useEffect(() => {
    (async () => {
      if (id) {
        const game = await getFixedGame(id);
        if (game) {
          setForm(game);
        }
        setFetching(false);
      }
    })();
  }, [id]);

  // Handle input change for text fields
  const handleChange = (field: string, value: string) => {
    setForm((prev: any) => ({ ...prev, [field]: value }));
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (
      !form.title ||
      !form.day_of_week ||
      !form.start_time ||
      !form.duration_minutes ||
      !form.location_id ||
      !form.host ||
      !form.max_players ||
      !form.skill_level ||
      !form.price ||
      !form.status
    ) {
      return Alert.alert(
        "All fields except description and image_url are required"
      );
    }
    let hostJson: any = {};
    try {
      hostJson =
        typeof form.host === "string" ? JSON.parse(form.host) : form.host;
    } catch {
      return Alert.alert("Host must be valid JSON");
    }
    const ok = await updateFixedGame(id, {
      ...form,
      duration_minutes: Number(form.duration_minutes),
      max_players: Number(form.max_players),
      price: Number(form.price),
      host: hostJson,
    });
    if (ok) {
      Alert.alert("Fixed game updated");
      router.replace("/admin/fixed-games");
    }
  };

  if (fetching || !form) return <ActivityIndicator style={{ marginTop: 40 }} />;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ThemedView>
        <ThemedText type='title' style={styles.title}>
          Edit Fixed Game
        </ThemedText>
        <ThemedText style={styles.label}>Title*</ThemedText>
        <TextInput
          style={[styles.input, { color: colors.text }]}
          value={form.title}
          onChangeText={(v) => handleChange("title", v)}
        />
        <ThemedText style={styles.label}>Description</ThemedText>
        <TextInput
          style={[styles.input, { color: colors.text }]}
          value={form.description}
          onChangeText={(v) => handleChange("description", v)}
        />
        <ThemedText style={styles.label}>Day of Week*</ThemedText>
        <TextInput
          style={[styles.input, { color: colors.text }]}
          value={form.day_of_week}
          onChangeText={(v) => handleChange("day_of_week", v)}
        />
        <ThemedText style={styles.label}>Start Time* (HH:MM:SS)</ThemedText>
        <TextInput
          style={[styles.input, { color: colors.text }]}
          value={form.start_time}
          onChangeText={(v) => handleChange("start_time", v)}
        />
        <ThemedText style={styles.label}>Duration (minutes)*</ThemedText>
        <TextInput
          style={[styles.input, { color: colors.text }]}
          value={String(form.duration_minutes)}
          onChangeText={(v) => handleChange("duration_minutes", v)}
          keyboardType='numeric'
        />
        <ThemedText style={styles.label}>Location ID*</ThemedText>
        <TextInput
          style={[styles.input, { color: colors.text }]}
          value={form.location_id}
          onChangeText={(v) => handleChange("location_id", v)}
        />
        <ThemedText style={styles.label}>Host (JSON)*</ThemedText>
        <TextInput
          style={[styles.input, { color: colors.text }]}
          value={
            typeof form.host === "string"
              ? form.host
              : JSON.stringify(form.host)
          }
          onChangeText={(v) => handleChange("host", v)}
        />
        <ThemedText style={styles.label}>Max Players*</ThemedText>
        <TextInput
          style={[styles.input, { color: colors.text }]}
          value={String(form.max_players)}
          onChangeText={(v) => handleChange("max_players", v)}
          keyboardType='numeric'
        />
        <ThemedText style={styles.label}>Skill Level*</ThemedText>
        <TextInput
          style={[styles.input, { color: colors.text }]}
          value={form.skill_level}
          onChangeText={(v) => handleChange("skill_level", v)}
        />
        <ThemedText style={styles.label}>Price*</ThemedText>
        <TextInput
          style={[styles.input, { color: colors.text }]}
          value={String(form.price)}
          onChangeText={(v) => handleChange("price", v)}
          keyboardType='numeric'
        />
        <ThemedText style={styles.label}>Image URL</ThemedText>
        <TextInput
          style={[styles.input, { color: colors.text }]}
          value={form.image_url}
          onChangeText={(v) => handleChange("image_url", v)}
        />
        <ThemedText style={styles.label}>Status*</ThemedText>
        <TextInput
          style={[styles.input, { color: colors.text }]}
          value={form.status}
          onChangeText={(v) => handleChange("status", v)}
        />
        <Button
          title={loading ? "Updating..." : "Update Fixed Game"}
          onPress={handleSubmit}
          disabled={loading}
        />
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { marginBottom: 16 },
  label: { marginTop: 12, marginBottom: 4, fontWeight: "bold" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 8,
    marginBottom: 4,
  },
});
