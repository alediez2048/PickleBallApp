// Edit view for Fixed Games
import React, { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  TextInput,
  Button,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
  TouchableOpacity,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useFixedGames } from "@/contexts/FixedGamesContext";
import { ThemedText } from "@/components/common/ThemedText";
import { ThemedView } from "@/components/common/ThemedView";
import { useTheme } from "@/contexts/ThemeContext";
import { DAYS_OF_WEEK } from "@/constants/daysOfWeek";
import { SkillLevel, SkillLevel as SkillLevelEnum } from "@/types/skillLevel";
import { useLocations } from "@/contexts/LocationsContext";
import BackButton from "@/components/common/BackButton";
import DateTimePicker from "@react-native-community/datetimepicker";
import { ThemedPicker } from "@/components/common/ThemedPicker";

export default function FixedGameEdit() {
  const { getFixedGame, updateFixedGame, loading } = useFixedGames();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [form, setForm] = useState<any>(null);
  const [fetching, setFetching] = useState(true);
  const { colors } = useTheme();
  const { locations } = useLocations();
  const [showTimePicker, setShowTimePicker] = useState(false);

  const days = DAYS_OF_WEEK;

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
    // Support nested host fields
    if (field.startsWith("host.")) {
      const hostField = field.split(".")[1];
      setForm((prev: any) => ({
        ...prev,
        host: { ...prev.host, [hostField]: value },
      }));
    } else {
      setForm((prev: any) => ({ ...prev, [field]: value }));
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (
      !form.title ||
      !form.day_of_week ||
      !form.start_time ||
      !form.duration_minutes ||
      !form.location_id ||
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
    delete form.location;
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
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.container, { backgroundColor: colors.background }]}
      keyboardVerticalOffset={0}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <BackButton />
        <ThemedView>
          <ThemedText type="title" style={styles.title}>
            Edit Fixed Game+
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
              marginBottom: 8,
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
                setForm((prev: any) => ({
                  ...prev,
                  start_time: value + ":00",
                }));
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
                      setForm((prev: any) => ({
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
            value={String(form.duration_minutes)}
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
              marginBottom: 8,
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
            value={String(form.max_players)}
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
              marginBottom: 8,
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
            value={String(form.price)}
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
              marginBottom: 8,
            }}
          >
            <ThemedPicker.Item label="Active" value="active" />
            <ThemedPicker.Item label="Inactive" value="inactive" />
          </ThemedPicker>
          {/* Host Section */}
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Host
          </ThemedText>
          <ThemedText style={styles.label}>Host Name*</ThemedText>
          <TextInput
            style={[styles.input, { color: colors.text }]}
            value={form.host?.name || ""}
            onChangeText={(v) => handleChange("host.name", v)}
            placeholder="Enter host name"
            placeholderTextColor={colors.text + "99"}
          />
          <ThemedText style={styles.label}>Host Email</ThemedText>
          <TextInput
            style={[styles.input, { color: colors.text }]}
            value={form.host?.email || ""}
            onChangeText={(v) => handleChange("host.email", v)}
            placeholder="Enter host email"
            placeholderTextColor={colors.text + "99"}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <ThemedText style={styles.label}>Host Skill Level</ThemedText>
          <ThemedPicker
            selectedValue={form.host?.skill_level || ""}
            onValueChange={(v) => handleChange("host.skill_level", v as string)}
            style={{
              color: colors.text,
              backgroundColor: colors.background,
              marginBottom: 8,
            }}
          >
            <ThemedPicker.Item label="Select skill level" value="" />
            {Object.values(SkillLevelEnum).map((level) => (
              <ThemedPicker.Item key={level} label={level} value={level} />
            ))}
          </ThemedPicker>
          <ThemedText style={styles.label}>Host Phone Number</ThemedText>
          <TextInput
            style={[styles.input, { color: colors.text }]}
            value={form.host?.phone_number || ""}
            onChangeText={(v) => handleChange("host.phone_number", v)}
            placeholder="Enter host phone number"
            placeholderTextColor={colors.text + "99"}
            keyboardType="phone-pad"
          />
          <Button
            title={loading ? "Updating..." : "Update Fixed Game"}
            onPress={handleSubmit}
            disabled={loading}
          />
        </ThemedView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 16,
  },
  title: { marginBottom: 16 },
  label: { marginTop: 12, marginBottom: 4, fontWeight: "bold" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 8,
    marginBottom: 4,
  },
  header: { height: 40, marginBottom: 20 },
  sectionTitle: {
    marginTop: 24,
    marginBottom: 8,
    fontWeight: "bold",
    fontSize: 18,
  },
});
