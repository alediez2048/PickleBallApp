import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
} from "react-native";
import { Button } from "@/components/common/Button";
import { TextInput } from "@/components/common/TextInput";
import { ThemedText } from "@/components/common/ThemedText";
import { useAuth } from "@/contexts/AuthContext";
import { SkillLevel } from "@/types/games";
import { Address } from "@/types/user";
import { useTheme } from "@/contexts/ThemeContext";

const SKILL_LEVELS = [
  { value: SkillLevel.Beginner, label: "Beginner" },
  { value: SkillLevel.Intermediate, label: "Intermediate" },
  { value: SkillLevel.Advanced, label: "Advanced" },
  { value: SkillLevel.Open, label: "Open" },
];

const PLAY_STYLES = [
  { value: "singles", label: "Singles" },
  { value: "doubles", label: "Doubles" },
  { value: "both", label: "Both" },
];

type PlayStyle = (typeof PLAY_STYLES)[number]["value"];

interface FormData {
  displayName: string;
  phoneNumber: string;
  dateOfBirth: string;
  address: Address;
  skillLevel: SkillLevel;
  playingExperience: number;
  preferredPlayStyle: PlayStyle | null;
  waiverAccepted: boolean;
  termsAccepted: boolean;
  privacyPolicyAccepted: boolean;
}

interface FirstTimeProfileFormProps {
  onComplete: () => void;
}

export function FirstTimeProfileForm({
  onComplete,
}: FirstTimeProfileFormProps) {
  const { user, updateProfile } = useAuth();
  const { colors } = useTheme();
  const [form, setForm] = useState<FormData>({
    displayName: "",
    phoneNumber: "",
    dateOfBirth: "",
    address: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
    },
    skillLevel: SkillLevel.Beginner,
    playingExperience: 0,
    preferredPlayStyle: null,
    waiverAccepted: false,
    termsAccepted: false,
    privacyPolicyAccepted: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setForm((prevForm) => ({
        ...prevForm,
        displayName: user.display_name ?? "",
        phoneNumber: user.phone_number ?? "",
        dateOfBirth: user.date_of_birth ?? "",
        address: {
          street: user.address?.street ?? "",
          city: user.address?.city ?? "",
          state: user.address?.state ?? "",
          zipCode: user.address?.zipCode ?? "",
          country: user.address?.country ?? "",
        },
        skillLevel: (user.skill_level as SkillLevel) ?? SkillLevel.Beginner,
        playingExperience: user.playing_experience ?? 0,
        preferredPlayStyle: (user.preferred_play_style as PlayStyle) ?? null,
        waiverAccepted: user.waiver_accepted ?? false,
        termsAccepted: user.terms_accepted ?? false,
        privacyPolicyAccepted: user.privacy_policy_accepted ?? false,
      }));
    }
  }, [user]);

  const handleSubmit = async () => {
    try {
      // Validate required fields
      if (
        !form.termsAccepted ||
        !form.privacyPolicyAccepted ||
        !form.waiverAccepted
      ) {
        Alert.alert(
          "Validation Error",
          "You must accept Terms & Conditions, Privacy Policy, and Liability Waiver before proceeding."
        );
        console.log("Validation Error Accept Legal Agreements");
        return;
      }

      if (
        !form.displayName.trim() ||
        !form.phoneNumber.trim() ||
        !form.dateOfBirth.trim() ||
        !form.address.street?.trim() ||
        !form.address.city?.trim() ||
        !form.address.state?.trim() ||
        !form.address.zipCode?.trim() ||
        !form.address.country?.trim()
      ) {
        Alert.alert(
          "Validation Error",
          "Please fill in all required fields, including your address."
        );
        console.log("Validation Error Required Fields");
        return;
      }

      setIsSubmitting(true);

      const isVerified = !!user?.email_confirmed_at;

      const profileData = {
        display_name: form.displayName.trim(),
        phone_number: form.phoneNumber.trim(),
        date_of_birth: form.dateOfBirth.trim(),
        address: {
          street: form.address.street.trim(),
          city: form.address.city.trim(),
          state: form.address.state.trim(),
          zipCode: form.address.zipCode.trim(),
          country: form.address.country.trim(),
        },
        skill_level: form.skillLevel,
        playing_experience: form.playingExperience,
        preferred_play_style: form.preferredPlayStyle,
        waiver_accepted: form.waiverAccepted,
        waiver_signed_at: form.waiverAccepted ? new Date().toISOString() : null,
        terms_accepted: form.termsAccepted,
        terms_accepted_at: form.termsAccepted ? new Date().toISOString() : null,
        privacy_policy_accepted: form.privacyPolicyAccepted,
        privacy_policy_accepted_at: form.privacyPolicyAccepted
          ? new Date().toISOString()
          : null,
        has_completed_profile: true,
        is_verified: isVerified,
      };

      await updateProfile(profileData);
      onComplete();
    } catch (error) {
      Alert.alert("Error", "Failed to update profile. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePlayStyleToggle = (style: PlayStyle) => {
    setForm((prev) => ({
      ...prev,
      preferredPlayStyle: prev.preferredPlayStyle === style ? null : style,
    }));
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          <ThemedText type='sectionTitle' style={styles.title}>
            Complete Your Profile
          </ThemedText>
          <ThemedText type='subtitle' style={styles.subtitle}>
            Tell us a bit about yourself to get started
          </ThemedText>

          <View style={styles.form}>
            <TextInput
              label='Display Name'
              value={form.displayName}
              onChangeText={(text) =>
                setForm((prev) => ({ ...prev, displayName: text }))
              }
              editable={!isSubmitting}
            />
            <TextInput
              label='Phone Number'
              value={form.phoneNumber}
              onChangeText={(text) =>
                setForm((prev) => ({ ...prev, phoneNumber: text }))
              }
              keyboardType='phone-pad'
              editable={!isSubmitting}
            />
            <TextInput
              label='Date of Birth'
              value={form.dateOfBirth}
              onChangeText={(text) =>
                setForm((prev) => ({ ...prev, dateOfBirth: text }))
              }
              placeholder='YYYY-MM-DD'
              editable={!isSubmitting}
            />
            {/* Address Fields */}
            <ThemedText type='subtitle' style={styles.sectionTitle}>
              Address
            </ThemedText>
            <TextInput
              label='Street'
              value={form.address.street}
              onChangeText={(text) =>
                setForm((prev) => ({
                  ...prev,
                  address: { ...prev.address, street: text },
                }))
              }
              editable={!isSubmitting}
            />
            <TextInput
              label='City'
              value={form.address.city}
              onChangeText={(text) =>
                setForm((prev) => ({
                  ...prev,
                  address: { ...prev.address, city: text },
                }))
              }
              editable={!isSubmitting}
            />
            <TextInput
              label='State'
              value={form.address.state}
              onChangeText={(text) =>
                setForm((prev) => ({
                  ...prev,
                  address: { ...prev.address, state: text },
                }))
              }
              editable={!isSubmitting}
            />
            <TextInput
              label='Zip Code'
              value={form.address.zipCode}
              onChangeText={(text) =>
                setForm((prev) => ({
                  ...prev,
                  address: { ...prev.address, zipCode: text },
                }))
              }
              keyboardType='numeric'
              editable={!isSubmitting}
            />
            <TextInput
              label='Country'
              value={form.address.country}
              onChangeText={(text) =>
                setForm((prev) => ({
                  ...prev,
                  address: { ...prev.address, country: text },
                }))
              }
              editable={!isSubmitting}
            />

            {/* Skill Level */}
            <ThemedText type='subtitle' style={styles.sectionTitle}>
              Skill Level
            </ThemedText>
            {SKILL_LEVELS.map((level) => (
              <TouchableOpacity
                key={level.value}
                style={[
                  styles.skillButton,
                  form.skillLevel === level.value && styles.selectedSkillButton,
                ]}
                onPress={() =>
                  setForm((prev) => ({ ...prev, skillLevel: level.value }))
                }
              >
                <ThemedText
                  style={[
                    styles.skillButtonText,
                    form.skillLevel === level.value &&
                      styles.selectedSkillButtonText,
                  ]}
                >
                  {level.label}
                </ThemedText>
              </TouchableOpacity>
            ))}

            {/* Play Style */}
            <ThemedText type='subtitle' style={styles.sectionTitle}>
              Preferred Play Style
            </ThemedText>
            <View style={styles.playStyleButtons}>
              {PLAY_STYLES.map((style) => (
                <TouchableOpacity
                  key={style.value}
                  style={[
                    styles.playStyleButton,
                    form.preferredPlayStyle === style.value &&
                      styles.selectedPlayStyleButton,
                  ]}
                  onPress={() => handlePlayStyleToggle(style.value)}
                >
                  <ThemedText
                    style={[
                      styles.playStyleButtonText,
                      form.preferredPlayStyle === style.value &&
                        styles.selectedPlayStyleButtonText,
                    ]}
                  >
                    {style.label}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>

            {/* Legal Agreements */}
            <ThemedText type='subtitle' style={styles.sectionTitle}>
              Legal Agreements
            </ThemedText>
            <TouchableOpacity
              style={[
                styles.legalButton,
                form.termsAccepted && styles.acceptedLegalButton,
              ]}
              onPress={() =>
                setForm((prev) => ({
                  ...prev,
                  termsAccepted: !prev.termsAccepted,
                }))
              }
            >
              <ThemedText style={styles.legalButtonText}>
                Accept Terms & Conditions
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.legalButton,
                form.privacyPolicyAccepted && styles.acceptedLegalButton,
              ]}
              onPress={() =>
                setForm((prev) => ({
                  ...prev,
                  privacyPolicyAccepted: !prev.privacyPolicyAccepted,
                }))
              }
            >
              <ThemedText style={styles.legalButtonText}>
                Accept Privacy Policy
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.legalButton,
                form.waiverAccepted && styles.acceptedLegalButton,
              ]}
              onPress={() =>
                setForm((prev) => ({
                  ...prev,
                  waiverAccepted: !prev.waiverAccepted,
                }))
              }
            >
              <ThemedText style={styles.legalButtonText}>
                Accept Liability Waiver
              </ThemedText>
            </TouchableOpacity>
          </View>

          <Button
            onPress={handleSubmit}
            disabled={isSubmitting}
            loading={isSubmitting}
            style={styles.submitButton}
          >
            {isSubmitting ? "Saving..." : "Complete Profile"}
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  title: {
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    textAlign: "center",
    marginBottom: 20,
  },
  form: {
    gap: 16,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  skillButton: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 8,
  },
  selectedSkillButton: {
    borderColor: "#4CAF50",
    backgroundColor: "#4CAF50",
  },
  skillButtonText: {
    textAlign: "center",
  },
  selectedSkillButtonText: {
    color: "#fff",
  },
  playStyleButtons: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  playStyleButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
    alignItems: "center",
  },
  selectedPlayStyleButton: {
    borderColor: "#4CAF50",
    backgroundColor: "#4CAF50",
  },
  playStyleButtonText: {
    color: "#666666",
  },
  selectedPlayStyleButtonText: {
    color: "#fff",
  },
  legalButton: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 8,
  },
  acceptedLegalButton: {
    borderColor: "#4CAF50",
    backgroundColor: "#4CAF50",
  },
  legalButtonText: {
    textAlign: "center",
  },
  submitButton: {
    marginTop: 24,
  },
});
