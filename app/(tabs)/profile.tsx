import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Image, Modal, Alert, Platform, SafeAreaView, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useUserProfile } from '@/contexts/selectors/authSelectors';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useUpcomingGames } from '@/contexts/selectors/gameSelectors';
import { Button } from '@/components/common/ui/Button';
import { SkillLevel } from '@/types/game';
import { useAuth } from '@/contexts/AuthContext';
import { FirstTimeProfileForm } from '@/components/profile/FirstTimeProfileForm';
import { useRouter } from 'expo-router';
import { MembershipManagementSection } from '@/components/membership/MembershipManagementSection';
import { MembershipPlan } from '@/types/membership';
import { ThemedText } from '@/components/ThemedText';

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
  membership?: MembershipPlan;
}

const SKILL_LEVELS = [
  {
    value: 'Beginner',
    label: 'Beginner',
    description: 'New to pickleball or playing for less than 6 months',
  },
  {
    value: 'Intermediate',
    label: 'Intermediate',
    description: 'Comfortable with basic shots and rules, playing for 6 months to 2 years',
  },
  {
    value: 'Advanced',
    label: 'Advanced',
    description: 'Experienced player with strong shot control and strategy',
  },
  {
    value: 'Open',
    label: 'Open',
    description: 'Competitive player with tournament experience',
  },
];

export default function ProfileScreen() {
  const user = useUserProfile() as UserProfile;
  const { updateProfile, signOut, updateMembership } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isProfileFormVisible, setIsProfileFormVisible] = useState(false);
  const [isSkillModalVisible, setIsSkillModalVisible] = useState(false);
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

  const handleSkillUpdate = async (newSkillLevel: string) => {
    try {
      setIsLoading(true);
      await updateProfile({ skillLevel: newSkillLevel });
      setIsSkillModalVisible(false);
    } catch (error) {
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to update skill level'
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <ThemedText>Loading...</ThemedText>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
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
              <View style={styles.defaultAvatar}>
                <IconSymbol name="person.fill" size={48} color="#FFFFFF" />
              </View>
            )}
            <View style={styles.editImageButton}>
              <IconSymbol name="pencil" size={14} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
          <ThemedText variant="title" style={styles.name}>{user.name}</ThemedText>
          <ThemedText variant="caption" style={styles.email}>{user.email}</ThemedText>
        </View>

        {/* Skill Level Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <ThemedText variant="subtitle" style={styles.cardTitle}>Skill Level</ThemedText>
            <Button 
              variant="outline" 
              size="small"
              onPress={() => setIsSkillModalVisible(true)}
            >
              Edit
            </Button>
          </View>
          <View style={styles.skillLevelContainer}>
            <View style={styles.skillBadge}>
              <ThemedText style={styles.skillLevelText}>
                {user.skillLevel || 'Not set'}
              </ThemedText>
            </View>
            <ThemedText variant="caption" style={styles.skillLevelDescription}>
              {SKILL_LEVELS.find(level => level.value === user.skillLevel)?.description || 'Please set your skill level'}
            </ThemedText>
          </View>
        </View>

        {/* Membership Card */}
        <View style={styles.card}>
          <MembershipManagementSection
            currentPlan={user?.membership}
            onUpdatePlan={updateMembership}
          />
        </View>

        {/* Profile Information Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <ThemedText variant="subtitle" style={styles.cardTitle}>Profile Information</ThemedText>
            <Button 
              variant="outline" 
              size="small"
              onPress={() => setIsProfileFormVisible(true)}
            >
              Edit
            </Button>
          </View>
          <View style={styles.profileInfo}>
            <View style={styles.infoRow}>
              <ThemedText variant="caption" style={styles.infoLabel}>Phone</ThemedText>
              <ThemedText style={styles.infoValue}>{user?.phoneNumber || 'Not set'}</ThemedText>
            </View>
            <View style={styles.divider} />
            
            <View style={styles.infoRow}>
              <ThemedText variant="caption" style={styles.infoLabel}>Date of Birth</ThemedText>
              <ThemedText style={styles.infoValue}>{user?.dateOfBirth || 'Not set'}</ThemedText>
            </View>
            <View style={styles.divider} />
            
            <View style={styles.infoRow}>
              <ThemedText variant="caption" style={styles.infoLabel}>Address</ThemedText>
              <ThemedText style={styles.infoValue}>
                {user?.address?.street || 'Not set'}
              </ThemedText>
            </View>
            <View style={styles.divider} />
            
            <View style={styles.infoRow}>
              <ThemedText variant="caption" style={styles.infoLabel}>City</ThemedText>
              <ThemedText style={styles.infoValue}>
                {user?.address?.city || 'Not set'}
              </ThemedText>
            </View>
            <View style={styles.divider} />
            
            <View style={styles.infoRow}>
              <ThemedText variant="caption" style={styles.infoLabel}>State</ThemedText>
              <ThemedText style={styles.infoValue}>
                {user?.address?.state || 'Not set'}
              </ThemedText>
            </View>
            <View style={styles.divider} />
            
            <View style={styles.infoRow}>
              <ThemedText variant="caption" style={styles.infoLabel}>ZIP Code</ThemedText>
              <ThemedText style={styles.infoValue}>
                {user?.address?.zipCode || 'Not set'}
              </ThemedText>
            </View>
          </View>
        </View>

        {/* Games Played Card */}
        <View style={styles.card}>
          <ThemedText variant="subtitle" style={styles.cardTitle}>Games History</ThemedText>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <ThemedText style={styles.statNumber}>
                {user.gamesPlayed?.length || 0}
              </ThemedText>
              <ThemedText variant="caption" style={styles.statLabel}>Total Games</ThemedText>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <ThemedText style={[styles.statNumber, styles.winText]}>
                {user.gamesPlayed?.filter(game => game.result === 'win').length || 0}
              </ThemedText>
              <ThemedText variant="caption" style={styles.statLabel}>Wins</ThemedText>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <ThemedText style={[styles.statNumber, styles.lossText]}>
                {user.gamesPlayed?.filter(game => game.result === 'loss').length || 0}
              </ThemedText>
              <ThemedText variant="caption" style={styles.statLabel}>Losses</ThemedText>
            </View>
          </View>
        </View>

        {/* Sign Out Button */}
        <View style={styles.signOutContainer}>
          <Button 
            variant="outline" 
            onPress={signOut}
            size="large"
            fullWidth
          >
            Sign Out
          </Button>
        </View>
      </ScrollView>

      {/* Profile Form Modal */}
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
              <ThemedText variant="title" style={styles.modalTitle}>Update Profile</ThemedText>
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

      {/* Skill Level Modal */}
      <Modal
        visible={isSkillModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsSkillModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText variant="title" style={styles.modalTitle}>Update Skill Level</ThemedText>
              <TouchableOpacity
                onPress={() => setIsSkillModalVisible(false)}
                style={styles.closeButton}
              >
                <IconSymbol name="xmark" size={24} color="#666666" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalScroll}>
              {SKILL_LEVELS.map((level) => (
                <TouchableOpacity
                  key={level.value}
                  style={[
                    styles.skillOption,
                    user.skillLevel === level.value && styles.selectedSkill,
                  ]}
                  onPress={() => handleSkillUpdate(level.value)}
                  disabled={isLoading}
                >
                  <View style={styles.skillOptionContent}>
                    <ThemedText style={styles.skillOptionText}>{level.label}</ThemedText>
                    <ThemedText variant="caption" style={styles.skillDescription}>{level.description}</ThemedText>
                  </View>
                  {user.skillLevel === level.value && (
                    <IconSymbol name="checkmark" size={20} color="#4CAF50" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  header: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
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
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    position: 'relative',
  },
  defaultAvatar: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
  },
  editImageButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#4CAF50',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  name: {
    marginBottom: 4,
    textAlign: 'center',
  },
  email: {
    color: '#666666',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontWeight: '600',
  },
  skillLevelContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
  },
  skillBadge: {
    backgroundColor: '#E8F5E9',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  skillLevelText: {
    color: '#4CAF50',
    fontWeight: '600',
    fontSize: 16,
  },
  skillLevelDescription: {
    color: '#666666',
  },
  profileInfo: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoLabel: {
    color: '#666666',
  },
  infoValue: {
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    width: '100%',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 8,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  winText: {
    color: '#4CAF50',
  },
  lossText: {
    color: '#F44336',
  },
  statLabel: {
    color: '#666666',
  },
  signOutContainer: {
    marginTop: 8,
    marginBottom: 24,
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
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    flex: 1,
    textAlign: 'center',
  },
  closeButton: {
    padding: 8,
  },
  modalScroll: {
    padding: 16,
  },
  skillOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
    marginBottom: 12,
  },
  skillOptionContent: {
    flex: 1,
    paddingRight: 8,
  },
  selectedSkill: {
    backgroundColor: '#E8F5E9',
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  skillOptionText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  skillDescription: {
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
    padding: 16,
    maxHeight: '90%',
  },
  modalCloseButton: {
    padding: 8,
  },
  profileFormScroll: {
    maxHeight: '90%',
  },
}); 