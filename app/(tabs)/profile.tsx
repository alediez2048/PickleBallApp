import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Modal, Alert, Platform, SafeAreaView, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useUserProfile } from '@/contexts/selectors/authSelectors';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useUpcomingGames } from '@/contexts/selectors/gameSelectors';
import { Button } from '@/components/common/ui/Button';
import { SkillLevel } from '@/types/game';
import { useAuth } from '@/contexts/AuthContext';
import { FirstTimeProfileForm } from '@/components/profile/FirstTimeProfileForm';
import { useRouter } from 'expo-router';

interface GameHistory {
  id: string;
  date: string;
  result: 'win' | 'loss';
  score: string;
  opponent: string;
}

interface UserProfile {
  id?: string;
  email?: string;
  name?: string;
  isVerified?: boolean;
  skillLevel?: string;
  profileImage?: string | {
    uri: string;
    base64: string;
    timestamp: number;
  };
  gamesPlayed?: GameHistory[];
  phoneNumber?: string;
  dateOfBirth?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  };
}

const SKILL_LEVELS = [
  { value: SkillLevel.Beginner, label: 'Beginner' },
  { value: SkillLevel.Intermediate, label: 'Intermediate' },
  { value: SkillLevel.Advanced, label: 'Advanced' },
  { value: SkillLevel.Open, label: 'Open' },
];

export default function ProfileScreen() {
  const user = useUserProfile() as UserProfile;
  const { updateProfile, signOut } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isProfileFormVisible, setIsProfileFormVisible] = useState(false);
  const upcomingGames = useUpcomingGames();
  const router = useRouter();

  const handleImagePick = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please allow access to your photo library to change profile picture.');
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
          throw new Error('Failed to get image data');
        }

        const imageData = {
          uri: imageUri,
          base64: `data:image/jpeg;base64,${base64Data}`,
          timestamp: Date.now()
        };

        await updateProfile({ profileImage: imageData });
        setRefreshKey(Date.now());
      }
    } catch (error) {
      console.error('Image pick error:', error);
      Alert.alert('Error', 'Failed to update profile picture. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getImageSource = (profileImage: UserProfile['profileImage']) => {
    if (!profileImage) return undefined;
    
    if (typeof profileImage === 'string') {
      return { uri: profileImage };
    }
    
    return { uri: profileImage.base64 };
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.profileImageContainer}
            onPress={handleImagePick}
            accessibilityLabel="Change profile picture"
          >
            {user?.profileImage ? (
              <Image 
                source={getImageSource(user.profileImage)}
                style={styles.profileImage}
                key={refreshKey}
              />
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
              size="small"
              onPress={() => router.push('/(skill-select)')}
              style={styles.editButton}
            >
              Edit
            </Button>
          </View>
          <View style={styles.skillLevelInfo}>
            <Text style={styles.skillLevelValue}>
              {user.skillLevel || 'Not set'}
            </Text>
            <Text style={styles.skillLevelDescription}>
              {SKILL_LEVELS.find(level => level.value === user.skillLevel)?.label || 'Please set your skill level'}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Profile Information</Text>
            <Button 
              variant="secondary" 
              size="small"
              onPress={() => setIsProfileFormVisible(true)}
              style={styles.editButton}
            >
              Edit
            </Button>
          </View>
          <View style={styles.profileInfo}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Phone:</Text>
              <Text style={styles.infoValue}>{user?.phoneNumber || 'Not set'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Date of Birth:</Text>
              <Text style={styles.infoValue}>{user?.dateOfBirth || 'Not set'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Address:</Text>
              <Text style={styles.infoValue}>
                {user?.address?.street || 'Not set'}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>City:</Text>
              <Text style={styles.infoValue}>
                {user?.address?.city || 'Not set'}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>State:</Text>
              <Text style={styles.infoValue}>
                {user?.address?.state || 'Not set'}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>ZIP Code:</Text>
              <Text style={styles.infoValue}>
                {user?.address?.zipCode || 'Not set'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Games Played</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {user.gamesPlayed?.length || 0}
              </Text>
              <Text style={styles.statLabel}>Total Games</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {user.gamesPlayed?.filter(game => game.result === 'win').length || 0}
              </Text>
              <Text style={styles.statLabel}>Wins</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {user.gamesPlayed?.filter(game => game.result === 'loss').length || 0}
              </Text>
              <Text style={styles.statLabel}>Losses</Text>
            </View>
          </View>
        </View>

        <View style={[styles.section, styles.signOutSection]}>
          <Button 
            variant="secondary" 
            onPress={signOut}
            size="medium"
            fullWidth
            style={styles.signOutButton}
          >
            Sign Out
          </Button>
        </View>
      </ScrollView>

      <Modal
        visible={isProfileFormVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsProfileFormVisible(false)}
      >
        <SafeAreaView style={styles.profileFormOverlay}>
          <View style={styles.profileFormContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity
                onPress={() => setIsProfileFormVisible(false)}
                style={styles.modalCloseButton}
              >
                <IconSymbol name="xmark" size={24} color="#666666" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Update Profile</Text>
            </View>
            <ScrollView style={styles.profileFormScroll}>
              <FirstTimeProfileForm onComplete={() => {
                setIsProfileFormVisible(false);
                // Force a refresh of the profile data
                setRefreshKey(prev => prev + 1);
              }} />
            </ScrollView>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  profileImageContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
      },
    }),
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  editButton: {
    minWidth: 80,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  email: {
    fontSize: 16,
    color: '#666666',
  },
  section: {
    padding: 16,
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  sectionContent: {
    fontSize: 16,
    color: '#666666',
  },
  gameItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#fff',
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  gameTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
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
    backgroundColor: '#f5f5f5',
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
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#666666',
  },
  recentGames: {
    width: '100%',
  },
  recentGamesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  recentGame: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  gameResult: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  gameScore: {
    fontSize: 14,
    color: '#666666',
  },
  signOutSection: {
    marginTop: 0,
    paddingHorizontal: 0,
    width: '100%',
  },
  signOutButton: {
    marginTop: 8,
  },
  disabledSkillOption: {
    opacity: 0.5,
  },
  disabledSkillText: {
    color: '#999999',
  },
  disabledButton: {
    opacity: 0.5,
  },
  skillLevelInfo: {
    padding: 8,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
  },
  skillLevelLockMessage: {
    fontSize: 12,
    marginTop: 4,
    color: '#666666',
    fontStyle: 'italic',
  },
  disabledEditButton: {
    backgroundColor: '#E0E0E0',
    opacity: 0.5,
    borderColor: '#CCCCCC',
  },
  profileInfo: {
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  infoValue: {
    fontSize: 16,
    color: '#666666',
  },
  profileFormOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  profileFormContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalCloseButton: {
    padding: 8,
  },
  profileFormScroll: {
    maxHeight: '80%',
  },
  skillLevelValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  skillLevelDescription: {
    fontSize: 14,
    color: '#666666',
  },
}); 