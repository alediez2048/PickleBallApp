// Create view for Fixed Games
import React, { useState } from "react";
import {
  TextInput,
  Button,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { useFixedGames } from "@/contexts/FixedGamesContext";
import { ThemedText } from "@/components/common/ThemedText";
import { ThemedView } from "@/components/common/ThemedView";
import { useTheme } from "@/contexts/ThemeContext";
import { DayOfWeek, FixedGameStatus } from "@/types/fixedGames";
import { SkillLevel, SkillLevel as SkillLevelEnum } from "@/types/skillLevel";
import { useLocations } from "@/contexts/LocationsContext";
import BackButton from "@/components/common/BackButton";
import DateTimePicker from "@react-native-community/datetimepicker";
import { ThemedPicker } from "@/components/common/ThemedPicker";

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
  const [showTimePicker, setShowTimePicker] = useState(false);

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
      <BackButton />
      <ThemedView>
        <ThemedText type="title" style={styles.title}>
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
        <ThemedPicker
          selectedValue={form.day_of_week}
          onValueChange={(v) => handleChange("day_of_week", v as string)}
          style={{
            color: colors.text,
            backgroundColor: colors.background,
            paddingVertical: 6,
          }}
        >
          {days.map((day) => (
            <ThemedPicker.Item key={day} label={day} value={day} />
          ))}
        </ThemedPicker>
        <ThemedText style={styles.label}>Start Time* (HH:MM:SS)</ThemedText>
        {Platform.OS === "web" ? (
          <input
            type="time"
            step="60"
            value={form.start_time.slice(0, 5)}
            onChange={(e) => {
              const value = e.target.value;
              setForm((prev) => ({ ...prev, start_time: value + ":00" }));
            }}
            style={{
              width: "100%",
              padding: 8,
              borderRadius: 6,
              border: "1px solid #ccc",
              marginBottom: 4,
              background: colors.background,
              color: colors.text,
            }}
          />
        ) : (
          <>
            <TouchableOpacity
              onPress={() => setShowTimePicker(true)}
              style={[styles.input, { backgroundColor: colors.background }]}
            >
              <ThemedText>{form.start_time || "Select time"}</ThemedText>
            </TouchableOpacity>
            {showTimePicker && (
              <DateTimePicker
                value={
                  form.start_time
                    ? new Date(`1970-01-01T${form.start_time}`)
                    : new Date()
                }
                mode="time"
                is24Hour={true}
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={(event, date) => {
                  setShowTimePicker(false);
                  if (date) {
                    const h = date.getHours().toString().padStart(2, "0");
                    const m = date.getMinutes().toString().padStart(2, "0");
                    setForm((prev) => ({
                      ...prev,
                      start_time: `${h}:${m}:00`,
                    }));
                  }
                }}
              />
            )}
          </>
        )}
        <ThemedText style={styles.label}>Duration (minutes)*</ThemedText>
        <TextInput
          style={[
            styles.input,
            { color: colors.text, backgroundColor: colors.background },
          ]}
          value={form.duration_minutes}
          onChangeText={(v) => handleChange("duration_minutes", v)}
          keyboardType="numeric"
        />
        <ThemedText style={styles.label}>Location*</ThemedText>
        <ThemedPicker
          selectedValue={form.location_id}
          onValueChange={(v) => handleChange("location_id", v as string)}
          style={{
            color: colors.text,
            backgroundColor: colors.background,
            paddingVertical: 6,
          }}
        >
          <ThemedPicker.Item label="Select a location" value="" />
          {locations.map((loc) => (
            <ThemedPicker.Item key={loc.id} label={loc.name} value={loc.id} />
          ))}
        </ThemedPicker>
        <ThemedText style={styles.label}>Max Players*</ThemedText>
        <TextInput
          style={[
            styles.input,
            { color: colors.text, backgroundColor: colors.background },
          ]}
          value={form.max_players}
          onChangeText={(v) => handleChange("max_players", v)}
          keyboardType="numeric"
        />
        <ThemedText style={styles.label}>Skill Level*</ThemedText>
        <ThemedPicker
          selectedValue={form.skill_level}
          onValueChange={(v) => handleChange("skill_level", v as string)}
          style={{
            color: colors.text,
            backgroundColor: colors.background,
            paddingVertical: 6,
          }}
        >
          <ThemedPicker.Item label="Select skill level" value="" />
          {Object.values(SkillLevelEnum).map((level) => (
            <ThemedPicker.Item key={level} label={level} value={level} />
          ))}
        </ThemedPicker>
        <ThemedText style={styles.label}>Price*</ThemedText>
        <TextInput
          style={[
            styles.input,
            { color: colors.text, backgroundColor: colors.background },
          ]}
          value={form.price}
          onChangeText={(v) => handleChange("price", v)}
          keyboardType="numeric"
        />
        <ThemedText style={styles.label}>Image URL</ThemedText>
        <TextInput
          style={[
            styles.input,
            { color: colors.text, backgroundColor: colors.background },
          ]}
          value={form.image_url}
          onChangeText={(v) => handleChange("image_url", v)}
        />
        <ThemedText style={styles.label}>Status*</ThemedText>
        <ThemedPicker
          selectedValue={form.status}
          onValueChange={(v) => handleChange("status", v as string)}
          style={{
            color: colors.text,
            backgroundColor: colors.background,
            paddingVertical: 6,
          }}
        >
          <ThemedPicker.Item label="Active" value="active" />
          <ThemedPicker.Item label="Inactive" value="inactive" />
        </ThemedPicker>
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
  header: {
    height: 40,
    marginBottom: 20,
  },
});
