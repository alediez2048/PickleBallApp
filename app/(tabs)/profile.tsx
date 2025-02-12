import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Modal, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useUserProfile } from '@/contexts/selectors/authSelectors';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useUpcomingGames } from '@/contexts/selectors/gameSelectors';
import { Button } from '@/components/common/ui/Button';
import { SkillLevel } from '@/types/game';
import { useAuth } from '@/contexts/AuthContext';

const SKILL_LEVELS = [
  { id: 'beginner', value: SkillLevel.Beginner, label: 'Beginner' },
  { id: 'intermediate', value: SkillLevel.Intermediate, label: 'Intermediate' },
  { id: 'advanced', value: SkillLevel.Advanced, label: 'Advanced' },
  { id: 'all-levels', value: SkillLevel.AllLevels, label: 'All Levels' },
];

export default function ProfileScreen() {
  const user = useUserProfile();
  const { updateProfile } = useAuth();
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isSkillModalVisible, setIsSkillModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const upcomingGames = useUpcomingGames();

  const handleImagePick = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please allow access to your photo library to change profile picture.');
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled && result.assets[0]) {
        setIsLoading(true);
        const imageUri = result.assets[0].uri;
        await updateProfile({ profileImage: imageUri });
        setProfileImage(imageUri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile picture. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkillLevelSelect = async (skillLevel: string) => {
    try {
      setIsLoading(true);
      await updateProfile({ skillLevel });
      setIsSkillModalVisible(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to update skill level. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user || isLoading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.profileImageContainer}
          onPress={handleImagePick}
          accessibilityLabel="Change profile picture"
        >
          {profileImage ? (
            <Image source={{ uri: profileImage }} style={styles.profileImage} />
          ) : (
            <IconSymbol name="person.fill" size={60} color="#666666" />
          )}
          <View style={styles.editButton}>
            <IconSymbol name="pencil" size={20} color="#666666" />
          </View>
        </TouchableOpacity>
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.email}>{user.email}</Text>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Skill Level</Text>
          <Button 
            variant="secondary" 
            size="sm"
            onPress={() => setIsSkillModalVisible(true)}
          >
            Edit
          </Button>
        </View>
        <Text style={styles.sectionContent}>{user.skillLevel || 'Not set'}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Upcoming Games</Text>
        {upcomingGames.length > 0 ? (
          upcomingGames.slice(0, 3).map(game => (
            <View key={game.id} style={styles.gameItem}>
              <Text style={styles.gameTitle}>{game.title}</Text>
              <Text style={styles.gameDate}>
                {new Date(game.startTime).toLocaleDateString()}
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.sectionContent}>No upcoming games</Text>
        )}
      </View>

      <Modal
        visible={isSkillModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsSkillModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Skill Level</Text>
              <TouchableOpacity 
                onPress={() => setIsSkillModalVisible(false)}
                style={styles.closeButton}
              >
                <IconSymbol name="xmark" size={24} color="#666666" />
              </TouchableOpacity>
            </View>
            {SKILL_LEVELS.map((level) => (
              <TouchableOpacity
                key={level.id}
                style={[
                  styles.skillOption,
                  user.skillLevel === level.value && styles.selectedSkill
                ]}
                onPress={() => handleSkillLevelSelect(level.value)}
              >
                <Text style={[
                  styles.skillOptionText,
                  user.skillLevel === level.value && styles.selectedSkillText
                ]}>
                  {level.label}
                </Text>
                {user.skillLevel === level.value && (
                  <IconSymbol name="checkmark" size={20} color="#4CAF50" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
    paddingVertical: 20,
  },
  profileImageContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    overflow: 'hidden',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  editButton: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  email: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 20,
  },
  section: {
    marginBottom: 30,
    backgroundColor: '#f8f8f8',
    padding: 15,
    borderRadius: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  sectionContent: {
    fontSize: 16,
    color: '#666666',
  },
  gameItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  gameTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  gameDate: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 8,
  },
  skillOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  selectedSkill: {
    backgroundColor: '#E8F5E9',
  },
  skillOptionText: {
    fontSize: 16,
    color: '#333333',
  },
  selectedSkillText: {
    color: '#4CAF50',
    fontWeight: '500',
  },
}); 