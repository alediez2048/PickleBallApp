import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/common/ui/Button";
import { LoadingSpinner } from "@/components/common/ui/LoadingSpinner";
import { useUser } from "@/contexts/selectors/authSelectors";
import { useUpcomingGames } from "@/contexts/selectors/gameSelectors";
import { SkillLevel } from "@/types/games";
import { IconSymbol } from "@/components/ui/IconSymbol";

export function ProfileScreen() {
  const user = useUser();
  const upcomingGames = useUpcomingGames();
  const [isLoading, setIsLoading] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const handleImagePick = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert(
          "Permission Required",
          "Please allow access to your photo library to change profile picture."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled) {
        setProfileImage(result.assets[0].uri);
        // TODO: Implement profile picture upload to backend
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick image. Please try again.");
    }
  };

  if (!user) {
    return <LoadingSpinner />;
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Profile Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.profileImageContainer}
          onPress={handleImagePick}
          accessibilityLabel='Change profile picture'
        >
          {profileImage ? (
            <Image source={{ uri: profileImage }} style={styles.profileImage} />
          ) : (
            <View style={styles.defaultAvatar}>
              <IconSymbol name='person.fill' size={48} color='#FFFFFF' />
            </View>
          )}
          <View style={styles.editImageButton}>
            <IconSymbol name='pencil' size={14} color='#FFFFFF' />
          </View>
        </TouchableOpacity>
        <ThemedText variant='title' style={styles.name}>
          {user.name}
        </ThemedText>
        <ThemedText variant='caption' style={styles.email}>
          {user.email}
        </ThemedText>
      </View>

      {/* Skill Level Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <ThemedText variant='subtitle' style={styles.cardTitle}>
            Skill Level
          </ThemedText>
          <Button
            variant='outline'
            size='small'
            onPress={() => {
              /* TODO: Implement edit skill level */
            }}
          >
            Edit
          </Button>
        </View>
        <View style={styles.skillLevelContainer}>
          <View style={styles.skillBadge}>
            <ThemedText style={styles.skillLevelText}>
              {user.skillLevel || SkillLevel.Beginner}
            </ThemedText>
          </View>
          <ThemedText variant='caption' style={styles.skillLevelDescription}>
            {user.skillLevel === SkillLevel.Beginner
              ? "New to pickleball or playing for less than 6 months"
              : user.skillLevel === SkillLevel.Intermediate
              ? "Comfortable with basic shots and rules, playing for 6 months to 2 years"
              : user.skillLevel === SkillLevel.Advanced
              ? "Experienced player with strong shot control and strategy"
              : "Competitive player with tournament experience"}
          </ThemedText>
        </View>
      </View>

      {/* Upcoming Games Card */}
      <View style={styles.card}>
        <ThemedText variant='subtitle' style={styles.cardTitle}>
          Upcoming Games
        </ThemedText>
        {upcomingGames.length > 0 ? (
          upcomingGames.map((game) => (
            <View key={game.id} style={styles.gameItem}>
              <View style={styles.gameHeader}>
                <ThemedText style={styles.gameTitle}>{game.title}</ThemedText>
                <ThemedText variant='caption' style={styles.gameDate}>
                  {new Date(game.startTime).toLocaleDateString()}
                </ThemedText>
              </View>
              <View style={styles.gameDetails}>
                <View style={styles.gameDetailRow}>
                  <IconSymbol name='location.fill' size={16} color='#4CAF50' />
                  <ThemedText variant='caption' style={styles.gameDetailText}>
                    {typeof game.location === "string"
                      ? game.location
                      : "Location not specified"}
                  </ThemedText>
                </View>
                <View style={styles.gameDetailRow}>
                  <IconSymbol name='calendar' size={16} color='#4CAF50' />
                  <ThemedText variant='caption' style={styles.gameDetailText}>
                    {new Date(game.startTime).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </ThemedText>
                </View>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <ThemedText style={styles.emptyText}>No upcoming games</ThemedText>
            <ThemedText variant='caption' style={styles.emptySubtext}>
              Join a game to see it here
            </ThemedText>
          </View>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <Button
          onPress={() => {
            /* TODO: Implement edit profile */
          }}
          variant='primary'
          size='medium'
          style={styles.editProfileButton}
        >
          Edit Profile
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    padding: 16,
  },
  header: {
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.05,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  profileImageContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
    position: "relative",
  },
  defaultAvatar: {
    width: "100%",
    height: "100%",
    borderRadius: 50,
    backgroundColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
  },
  profileImage: {
    width: "100%",
    height: "100%",
    borderRadius: 50,
  },
  editImageButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#4CAF50",
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#ffffff",
  },
  name: {
    marginBottom: 4,
    textAlign: "center",
  },
  email: {
    color: "#666666",
    textAlign: "center",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 16,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 1,
        },
        shadowOpacity: 0.05,
        shadowRadius: 2.22,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  cardTitle: {
    fontWeight: "600",
  },
  skillLevelContainer: {
    marginTop: 8,
  },
  skillBadge: {
    backgroundColor: "#E8F5E9",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  skillLevelText: {
    color: "#4CAF50",
    fontWeight: "600",
  },
  skillLevelDescription: {
    color: "#666666",
  },
  gameItem: {
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  gameHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  gameTitle: {
    fontWeight: "600",
  },
  gameDate: {
    color: "#666666",
  },
  gameDetails: {
    gap: 6,
  },
  gameDetailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  gameDetailText: {
    color: "#666666",
  },
  emptyState: {
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontWeight: "500",
    marginBottom: 4,
  },
  emptySubtext: {
    color: "#666666",
    textAlign: "center",
  },
  buttonContainer: {
    paddingVertical: 16,
    alignItems: "center",
  },
  editProfileButton: {
    minWidth: 200,
  },
});
