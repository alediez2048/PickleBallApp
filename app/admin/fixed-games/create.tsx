// Create view for Fixed Games
import React, { useState } from "react";
import { TextInput, Button, StyleSheet, ScrollView, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useFixedGames } from "@/contexts/FixedGamesContext";
import { ThemedText } from "@/components/common/ThemedText";
import { ThemedView } from "@/components/common/ThemedView";
import { useTheme } from "@/contexts/ThemeContext";
import { DayOfWeek, FixedGameStatus } from "@/types/fixedGames";
import {
  SkillLevel,
  SkillLevel as SkillLevelEnum,
} from "@/constants/skillLevel.types";
import { useLocations } from "@/contexts/LocationsContext";

const days: DayOfWeek[] = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const statuses: FixedGameStatus[] = ["active", "inactive"];

export default function FixedGameCreate() {
  const { createFixedGame, loading } = useFixedGames();
  const router = useRouter();
  const { colors } = useTheme();
  const { locations } = useLocations();
  const [form, setForm] = useState({
    title: "",
    description: "",
    day_of_week: days[0],
    start_time: "",
    duration_minutes: "",
    location_id: "",
    host: "{}",
    max_players: "",
    skill_level: "",
    price: "",
    image_url: "",
    status: statuses[0],
  });

  // Handle input change for text fields
  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
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
      hostJson = JSON.parse(form.host);
    } catch {
      return Alert.alert("Host must be valid JSON");
    }
    const created = await createFixedGame({
      ...form,
      duration_minutes: Number(form.duration_minutes),
      max_players: Number(form.max_players),
      price: Number(form.price),
      host: hostJson,
    });
    if (created) {
      Alert.alert("Fixed game created");
      router.replace("/admin/fixed-games");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ThemedView>
        <ThemedText type='title' style={styles.title}>
          Create Fixed Game
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
        <select
          style={{ marginBottom: 8, padding: 8 }}
          value={form.day_of_week}
          onChange={(e) => handleChange("day_of_week", e.target.value)}
        >
          {days.map((day) => (
            <option key={day} value={day}>
              {day}
            </option>
          ))}
        </select>
        <ThemedText style={styles.label}>Start Time* (HH:MM:SS)</ThemedText>
        <TextInput
          style={[styles.input, { color: colors.text }]}
          value={form.start_time}
          onChangeText={(v) => handleChange("start_time", v)}
        />
        <ThemedText style={styles.label}>Duration (minutes)*</ThemedText>
        <TextInput
          style={[styles.input, { color: colors.text }]}
          value={form.duration_minutes}
          onChangeText={(v) => handleChange("duration_minutes", v)}
          keyboardType='numeric'
        />
        <ThemedText style={styles.label}>Location*</ThemedText>
        <select
          style={{ marginBottom: 8, padding: 8 }}
          value={form.location_id}
          onChange={(e) => handleChange("location_id", e.target.value)}
        >
          <option value=''>Select a location</option>
          {locations.map((loc) => (
            <option key={loc.id} value={loc.id}>
              {loc.name}
            </option>
          ))}
        </select>
        <ThemedText style={styles.label}>Max Players*</ThemedText>
        <TextInput
          style={[styles.input, { color: colors.text }]}
          value={form.max_players}
          onChangeText={(v) => handleChange("max_players", v)}
          keyboardType='numeric'
        />
        <ThemedText style={styles.label}>Skill Level*</ThemedText>
        <select
          style={{ marginBottom: 8, padding: 8 }}
          value={form.skill_level}
          onChange={(e) =>
            handleChange("skill_level", e.target.value as SkillLevel)
          }
        >
          <option value=''>Select skill level</option>
          {Object.values(SkillLevelEnum).map((level) => (
            <option key={level} value={level}>
              {level}
            </option>
          ))}
        </select>
        <ThemedText style={styles.label}>Price*</ThemedText>
        <TextInput
          style={[styles.input, { color: colors.text }]}
          value={form.price}
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
          placeholder='active or inactive'
        />
        <Button
          title={loading ? "Creating..." : "Create Fixed Game"}
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
