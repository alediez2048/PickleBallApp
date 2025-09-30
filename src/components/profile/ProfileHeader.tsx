import React, { useEffect, useState } from "react";
import { Image, TouchableOpacity, StyleSheet } from "react-native";
import { ThemedView } from "@/components/common/ThemedView";
import { ThemedText } from "@/components/common/ThemedText";
import { IconSymbol } from "@/components/common/IconSymbol";
import { getSignedUrl } from "@/services/image";

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
  const [profileImageSource, setProfileImageSource] = useState<any>(undefined);
  const fetchProfileImage = async () => {
    if (!user?.profile_image) {
      setProfileImageSource(undefined);
      return;
    }
    if (typeof user.profile_image === "string") {
      const urlImage = await getSignedUrl(user.profile_image);
      setProfileImageSource(urlImage ? { uri: urlImage } : undefined);
    } else {
      setProfileImageSource(undefined);
    }
  };

  useEffect(() => {
    fetchProfileImage();
  }, [refreshKey]);

  return (
    <ThemedView
      style={styles.headerCard}
      borderColorType="primary"
      borderWidth={3}
    >
      <ThemedView style={styles.headerBackground}>
        <TouchableOpacity
          style={styles.profileImageContainer}
          onPress={onImagePick}
          accessibilityLabel="Change profile picture"
        >
          {user?.profile_image && profileImageSource ? (
            <Image
              style={{
                borderRadius: 120,
                width: 120,
                height: 120,
                resizeMode: "cover",
              }}
              source={profileImageSource}
              key={refreshKey}
            />
          ) : (
            <ThemedView
              style={styles.defaultAvatar}
              borderColorType="primary"
              borderWidth={4}
            >
              <IconSymbol name="person.fill" size={48} color="primary" />
            </ThemedView>
          )}
          <ThemedView
            style={styles.editImageButton}
            colorType="primary"
            borderColorType="white"
            borderWidth={3}
          >
            <IconSymbol name="pencil" size={14} color="white" />
          </ThemedView>
        </TouchableOpacity>
        <ThemedText type="subtitle" weight={"bold"}>
          {user.display_name || user.name || user.email}
        </ThemedText>
        <ThemedText type="label">{user.email}</ThemedText>
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
    borderRadius: 60,
    backgroundColor: "#fdfefceb",
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
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
    textAlign: "center",
  },
  email: {
    textAlign: "center",
    fontSize: 16,
  },
});
