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
  headerCard: {
    marginTop: 16,
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 3,
        },
        shadowOpacity: 0.12,
        shadowRadius: 5,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  headerBackground: {
    padding: 24,
    alignItems: "center",
  },
  profileImageContainer: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    position: "relative",
  },
  defaultAvatar: {
    width: "100%",
    height: "100%",
    borderRadius: 55,
    justifyContent: "center",
    alignItems: "center",
  },
  profileImage: {
    width: "100%",
    height: "100%",
    borderRadius: 55,
  },
  editImageButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#4CAF50",
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#ffffff",
  },
  name: {
    color: "#333333",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
    textAlign: "center",
  },
  email: {
    color: "#666666",
    textAlign: "center",
    fontSize: 16,
  },
  quickActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 12,
    marginHorizontal: 4,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.05,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  actionText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#333333",
  },
  card: {
    borderRadius: 16,
    marginBottom: 16,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  cardTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardIcon: {
    marginRight: 8,
  },
  cardTitle: {
    fontWeight: "600",
    fontSize: 18,
    color: "#666666",
  },
  skillLevelContainer: {
    borderRadius: 12,
    padding: 16,
  },
  skillBadge: {
    backgroundColor: "#E8F5E9",
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 14,
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  advancedBadge: {
    backgroundColor: "#E1F5FE",
  },
  proBadge: {
    backgroundColor: "#FFF3E0",
  },
  skillLevelText: {
    color: "#4CAF50",
    fontWeight: "600",
    fontSize: 16,
    textTransform: "capitalize",
  },
  skillLevelDescription: {
    color: "#666666",
    lineHeight: 20,
  },
  profileInfo: {
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 16,
  },
  infoItem: {
    flexDirection: "row",
    marginBottom: 16,
  },
  infoIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    color: "#666666",
    marginBottom: 4,
  },
  infoValue: {
    color: "#333333",
    fontWeight: "500",
  },
  signOutContainer: {
    marginTop: 8,
    marginBottom: 20,
  },
  toggleContainer: {
    marginTop: 8,
    marginBottom: 80,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  modalTitle: {
    flex: 1,
    textAlign: "center",
    color: "#666666",
  },
  closeButton: {
    padding: 8,
  },
  modalScroll: {
    padding: 16,
  },
  skillOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#f8f9fa",
    marginBottom: 12,
  },
  skillOptionContent: {
    flex: 1,
    paddingRight: 8,
  },
  selectedSkill: {
    backgroundColor: "#E8F5E9",
    borderWidth: 1,
    borderColor: "#4CAF50",
  },
  skillOptionText: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
    color: "#666666",
  },
  skillDescription: {
    color: "#666666",
  },
  profileFormOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  profileFormContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    maxHeight: "90%",
  },
  modalCloseButton: {
    padding: 8,
  },
  profileFormScroll: {
    maxHeight: "90%",
  },
});
