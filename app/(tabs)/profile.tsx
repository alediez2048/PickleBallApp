import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Modal, Alert, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useUserProfile } from '@/contexts/selectors/authSelectors';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useUpcomingGames } from '@/contexts/selectors/gameSelectors';
import { Button } from '@/components/common/ui/Button';
import { SkillLevel } from '@/types/game';
import { useAuth } from '@/contexts/AuthContext';

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
  const [isSkillModalVisible, setIsSkillModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [updatingSkill, setUpdatingSkill] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState<string | undefined>(user?.skillLevel);
  const upcomingGames = useUpcomingGames();

  // Update selected skill when user profile changes
  React.useEffect(() => {
    if (!updatingSkill) {
      setSelectedSkill(user?.skillLevel);
    }
  }, [user?.skillLevel, updatingSkill]);

  // Reset states when modal is closed
  const handleCloseModal = React.useCallback(() => {
    setIsSkillModalVisible(false);
    setUpdatingSkill(false);
    setSelectedSkill(user?.skillLevel);
  }, [user?.skillLevel]);

  const showErrorAlert = React.useCallback((errorMessage: string, hasUpcomingGames: boolean) => {
    if (hasUpcomingGames) {
      Alert.alert(
        'Cannot Update Skill Level',
        'You have upcoming games booked. You must complete or cancel your existing games before changing your skill level.',
        [
          {
            text: 'View My Games',
            onPress: handleCloseModal,
            style: 'default'
          },
          {
            text: 'Cancel',
            onPress: handleCloseModal,
            style: 'cancel'
          }
        ],
        { 
          cancelable: false,
          onDismiss: handleCloseModal 
        }
      );
    } else {
      Alert.alert(
        'Error',
        errorMessage,
        [
          {
            text: 'OK',
            onPress: handleCloseModal
          }
        ],
        { 
          cancelable: false,
          onDismiss: handleCloseModal 
        }
      );
    }
  }, [handleCloseModal]);

  const handleSkillLevelSelect = React.useCallback(async (skillLevel: string) => {
    if (skillLevel === user?.skillLevel) {
      handleCloseModal();
      return;
    }

    try {
      setUpdatingSkill(true);
      await updateProfile({ skillLevel });
      handleCloseModal();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update skill level. Please try again.';
      Alert.alert(
        'Error',
        errorMessage,
        [
          {
            text: 'OK',
            onPress: handleCloseModal
          }
        ]
      );
    } finally {
      setUpdatingSkill(false);
      setSelectedSkill(user?.skillLevel);
    }
  }, [user?.skillLevel, updateProfile, handleCloseModal]);

  const openSkillModal = React.useCallback(() => {
    if (upcomingGames.length > 0) {
      Alert.alert(
        'Cannot Update Skill Level',
        'You have upcoming games booked. You must complete or cancel your existing games before changing your skill level.',
        [
          {
            text: 'View My Games',
            style: 'default'
          },
          {
            text: 'OK',
            style: 'cancel'
          }
        ]
      );
      return;
    }
    
    if (updatingSkill) {
      return;
    }
    
    setIsSkillModalVisible(true);
  }, [updatingSkill, upcomingGames.length]);

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
    <View style={styles.container}>
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
            size="sm"
            onPress={openSkillModal}
            disabled={updatingSkill || upcomingGames.length > 0}
            style={[
              upcomingGames.length > 0 && styles.disabledEditButton
            ]}
          >
            {upcomingGames.length > 0 ? 'Locked' : updatingSkill ? 'Updating...' : 'Edit'}
          </Button>
        </View>
        <View style={styles.skillLevelInfo}>
          <Text style={styles.sectionContent}>
            {user?.skillLevel || 'Not set'}
            {updatingSkill && ' (Updating...)'}
          </Text>
          {upcomingGames.length > 0 && (
            <Text style={styles.skillLevelLockMessage}>
              Cannot change skill level while you have upcoming games
            </Text>
          )}
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
        {user.gamesPlayed && user.gamesPlayed.length > 0 ? (
          <View style={styles.recentGames}>
            <Text style={styles.recentGamesTitle}>Recent Games</Text>
            {user.gamesPlayed.slice(0, 3).map((game, index) => (
              <View key={game.id} style={styles.recentGame}>
                <View>
                  <Text style={[
                    styles.gameResult,
                    { color: game.result === 'win' ? '#4CAF50' : '#F44336' }
                  ]}>
                    {game.result === 'win' ? 'Won' : 'Lost'}
                  </Text>
                  <Text style={styles.gameScore}>{game.score}</Text>
                </View>
                <Text style={styles.gameDate}>
                  {new Date(game.date).toLocaleDateString()}
                </Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.sectionContent}>No games played yet</Text>
        )}
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

      <View style={[styles.section, styles.signOutSection]}>
        <Button 
          variant="secondary" 
          onPress={signOut}
          size="md"
          style={styles.signOutButton}
        >
          Sign Out
        </Button>
      </View>

      <Modal
        visible={isSkillModalVisible}
        transparent
        animationType="slide"
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Skill Level</Text>
              <TouchableOpacity 
                onPress={handleCloseModal}
                style={[styles.closeButton, updatingSkill && styles.disabledButton]}
                disabled={updatingSkill}
              >
                <IconSymbol name="xmark" size={24} color={updatingSkill ? '#999999' : '#666666'} />
              </TouchableOpacity>
            </View>
            {SKILL_LEVELS.map((level) => (
              <TouchableOpacity
                key={level.value}
                style={[
                  styles.skillOption,
                  user?.skillLevel === level.value && styles.selectedSkill,
                  updatingSkill && styles.disabledSkillOption
                ]}
                onPress={() => !updatingSkill && handleSkillLevelSelect(level.value)}
                disabled={updatingSkill}
              >
                <Text style={[
                  styles.skillOptionText,
                  user?.skillLevel === level.value && styles.selectedSkillText,
                  updatingSkill && styles.disabledSkillText
                ]}>
                  {level.label}
                </Text>
                {user?.skillLevel === level.value && (
                  <IconSymbol 
                    name="checkmark" 
                    size={20} 
                    color={updatingSkill ? '#999999' : '#4CAF50'} 
                  />
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
    marginBottom: 30,
    backgroundColor: '#f5f5f5',
    padding: 20,
    borderRadius: 12,
    marginHorizontal: -20,
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
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
      web: {
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.25)',
      },
    }),
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
    marginBottom: 25,
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
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
    width: '100%',
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
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
    flexDirection: 'column',
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
}); 