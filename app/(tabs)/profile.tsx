import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
  Alert,
  Platform,
  SafeAreaView,
  ScrollView,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "expo-router";
import { MembershipPlan } from "@/types/membership";
import { ThemedText } from "@/components/common/ThemedText";
import { ThemedView } from "@/components/common/ThemedView";
import ThemeToggleButton from "@/components/common/ThemeToggleButton";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { QuickActions } from "@/components/profile/QuickActions";
import { SkillLevelCard } from "@/components/profile/SkillLevelCard";
import { MembershipCard } from "@/components/profile/MembershipCard";
import { ProfileInfoCard } from "@/components/profile/ProfileInfoCard";
import { SignOutButton } from "@/components/profile/SignOutButton";
import { SkillLevelModal } from "@/components/profile/SkillLevelModal";
import { ProfileFormModal } from "@/components/profile/ProfileFormModal";
import { SKILL_LEVELS } from "@/constants/skillLevels";
import type { UserProfile, GameHistory } from "@/types/userProfile";

export default function ProfileScreen() {
  const { user } = useAuth();
  const { updateProfile, signOut, updateMembership } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isProfileFormVisible, setIsProfileFormVisible] = useState(false);
  const [isSkillModalVisible, setIsSkillModalVisible] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<MembershipPlan | undefined>(
    user?.membership || undefined
  );
  const router = useRouter();

  useEffect(() => {
    setCurrentPlan(user?.membership || undefined);
  }, [user?.membership]);

  const handleUpdateMembership = async (plan: MembershipPlan) => {
    try {
      setIsLoading(true);

      // Log the current plan before update
      console.log("Current plan before update:", currentPlan);

      // Update the plan in the backend
      await updateMembership(plan);

      // Update the local state
      setCurrentPlan(plan);

      // Log the new plan after update
      console.log("New plan after update:", plan);

      // Show success message
      Alert.alert(
        "Membership Updated",
        `Your membership has been successfully updated to the ${plan.name} plan.`,
        [{ text: "OK" }]
      );
    } catch (error) {
      console.error("Error updating membership:", error);
      Alert.alert("Error", "Failed to update membership. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleImagePick = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Please allow access to your photo library to change profile picture."
      );
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        setIsLoading(true);
        const imageUri = result.assets[0].uri;
        const base64Data = result.assets[0].base64;

        if (!base64Data) {
          throw new Error("Failed to get image data");
        }

        const imageData = {
          uri: imageUri,
          base64: `data:image/jpeg;base64,${base64Data}`,
          timestamp: Date.now(),
        };

        await updateProfile({ profileImage: imageData });
        setRefreshKey(Date.now());
      }
    } catch (error) {
      console.error("Image pick error:", error);
      Alert.alert(
        "Error",
        "Failed to update profile picture. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getImageSource = (profileImage: UserProfile["profileImage"]) => {
    if (!profileImage) return undefined;

    if (typeof profileImage === "string") {
      return { uri: profileImage };
    }

    return { uri: profileImage.base64 };
  };

  const handleSkillUpdate = async (newSkillLevel: string) => {
    try {
      setIsLoading(true);
      await updateProfile({ skillLevel: newSkillLevel });
      setIsSkillModalVisible(false);
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Failed to update skill level"
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Loading...</ThemedText>
      </ThemedView>
    );
  }
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <ProfileHeader
          user={user}
          onImagePick={handleImagePick}
          refreshKey={refreshKey}
        />
        <QuickActions
          onEditProfile={() => setIsProfileFormVisible(true)}
          onEditSkill={() => setIsSkillModalVisible(true)}
          onMembership={() => console.log("Navigate to membership")}
        />
        <SkillLevelCard
          skillLevel={user.skill_level || ""}
          onEdit={() => setIsSkillModalVisible(true)}
        />
        <MembershipCard
          currentPlan={currentPlan}
          onUpdatePlan={handleUpdateMembership}
        />
        <ProfileInfoCard
          user={user}
          onEdit={() => setIsProfileFormVisible(true)}
        />
        <SignOutButton
          onSignOut={async () => {
            try {
              await signOut();
              router.replace("/");
            } catch (error) {
              console.error("Error during sign out:", error);
              Alert.alert("Error", "Failed to sign out. Please try again.");
            }
          }}
        />
        <ThemedView style={styles.toggleContainer}>
          <ThemeToggleButton />
        </ThemedView>
      </ScrollView>
      <ProfileFormModal
        visible={isProfileFormVisible}
        onClose={() => setIsProfileFormVisible(false)}
        onComplete={() => {
          setIsProfileFormVisible(false);
          setRefreshKey((prev) => prev + 1);
        }}
      />
      <SkillLevelModal
        visible={isSkillModalVisible}
        onClose={() => setIsSkillModalVisible(false)}
        onSelect={handleSkillUpdate}
        selectedLevel={user.skill_level || ""}
        isLoading={isLoading}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 80,
  },
  toggleContainer: {
    marginTop: 8,
    marginBottom: 80,
  },
});
