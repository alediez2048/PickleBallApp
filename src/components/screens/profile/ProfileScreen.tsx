import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/common/ui/Button';
import { LoadingSpinner } from '@/components/common/ui/LoadingSpinner';
import { useUser } from '@/contexts/selectors/authSelectors';
import { useUpcomingGames } from '@/contexts/selectors/gameSelectors';
import { SkillLevel } from '@/types/game';
import { IconSymbol } from '@/components/ui/IconSymbol';

export function ProfileScreen() {
  const user = useUser();
  const upcomingGames = useUpcomingGames();
  const [isLoading, setIsLoading] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const handleImagePick = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'Please allow access to your photo library to change profile picture.');
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
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  if (!user) {
    return <LoadingSpinner />;
  }

  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.header}>
        <TouchableOpacity onPress={handleImagePick} style={styles.profileImageContainer}>
          {profileImage ? (
            <Image source={{ uri: profileImage }} style={styles.profileImage} />
          ) : (
            <View style={styles.profileImagePlaceholder}>
              <IconSymbol name="person.fill" size={40} color="#666" />
            </View>
          )}
          <View style={styles.editIconContainer}>
            <IconSymbol name="pencil" size={16} color="#fff" />
          </View>
        </TouchableOpacity>

        <ThemedText style={styles.name}>{user.name}</ThemedText>
        <ThemedText style={styles.email}>{user.email}</ThemedText>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Skill Level</ThemedText>
        <ThemedText style={styles.skillLevel}>
          {user.skillLevel || SkillLevel.Beginner}
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Upcoming Games</ThemedText>
        {upcomingGames.length > 0 ? (
          upcomingGames.map(game => (
            <ThemedView key={game.id} style={styles.gameItem}>
              <ThemedText style={styles.gameTitle}>{game.title}</ThemedText>
              <ThemedText style={styles.gameDetails}>
                {new Date(game.startTime).toLocaleDateString()}
              </ThemedText>
            </ThemedView>
          ))
        ) : (
          <ThemedText style={styles.noGames}>No upcoming games</ThemedText>
        )}
      </ThemedView>

      <View style={styles.buttonContainer}>
        <Button
          onPress={() => {/* TODO: Implement edit profile */}}
          variant="secondary"
          size="lg"
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
  },
  header: {
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  profileImageContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
    position: 'relative',
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
  },
  profileImagePlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editIconContainer: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: '#4CAF50',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: '#666',
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  skillLevel: {
    fontSize: 16,
    color: '#666',
  },
  gameItem: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    marginBottom: 8,
  },
  gameTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  gameDetails: {
    fontSize: 14,
    color: '#666',
  },
  noGames: {
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
  },
  buttonContainer: {
    padding: 20,
  },
}); 