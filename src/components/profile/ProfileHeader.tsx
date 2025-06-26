import React from "react";
import { Image, TouchableOpacity, StyleSheet } from "react-native";
import { ThemedView } from "@/components/common/ThemedView";
import { ThemedText } from "@/components/common/ThemedText";
import { IconSymbol } from "@/components/common/IconSymbol";

interface ProfileHeaderProps {
  user: any;
  onImagePick: () => void;
  refreshKey: number;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  user,
  onImagePick,
  refreshKey,
}) => {
  const getProfileImageSource = (profile_image: any) => {
    if (!profile_image) return undefined;
    if (typeof profile_image === "string") return { uri: profile_image };
    if (profile_image?.uri) return { uri: profile_image.uri };
    return undefined;
  };

  return (
    <ThemedView style={styles.headerCard}>
      <ThemedView style={styles.headerBackground}>
        <TouchableOpacity
          style={styles.profileImageContainer}
          onPress={onImagePick}
          accessibilityLabel="Change profile picture"
        >
          {user?.profile_image ? (
            <Image
              source={getProfileImageSource(user.profile_image)}
              style={styles.profileImage}
              key={refreshKey}
            />
          ) : (
            <ThemedView style={styles.defaultAvatar}>
              <IconSymbol name="person.fill" size={48} color="#4CAF50" />
            </ThemedView>
          )}
          <ThemedView style={styles.editImageButton}>
            <IconSymbol name="pencil" size={14} color="#FFFFFF" />
          </ThemedView>
        </TouchableOpacity>
        <ThemedText type="title" style={styles.name}>
          {user.display_name || user.name || user.email}
        </ThemedText>
        <ThemedText type="caption" style={styles.email}>
          {user.email}
        </ThemedText>
      </ThemedView>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  headerCard: {
    marginTop: 16,
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 16,
  },
  headerBackground: {
    padding: 24,
    alignItems: "center",
    backgroundColor: "#FFFFFF",
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
    backgroundColor: "#F1F8E9",
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
});
