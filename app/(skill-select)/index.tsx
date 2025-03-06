import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useAuth } from '@/contexts/AuthContext';
import { SkillLevel } from '@/types/game';

interface SkillLevelOption {
  value: SkillLevel;
  label: string;
  description: string;
  rules: string[];
  icon: 'person.fill' | 'person.2.fill' | 'trophy.fill' | 'star.fill';
  color: string;
}

const SKILL_LEVELS: SkillLevelOption[] = [
  {
    value: SkillLevel.Beginner,
    label: 'Beginner',
    description: 'New to pickleball or played a few times. Learning basic rules and shots.',
    rules: [
      'Access to beginner-friendly games',
      'Matched with other beginners',
      'Instructional games available',
    ],
    icon: 'person.fill',
    color: '#4CAF50',
  },
  {
    value: SkillLevel.Intermediate,
    label: 'Intermediate',
    description: 'Comfortable with basic shots and rules. Starting to develop strategy.',
    rules: [
      'Access to intermediate games',
      'Can join some advanced games',
      'Mixed skill level games available',
    ],
    icon: 'person.2.fill',
    color: '#2196F3',
  },
  {
    value: SkillLevel.Advanced,
    label: 'Advanced',
    description: 'Experienced player with strong shots and strategy. Competitive play.',
    rules: [
      'Access to advanced games',
      'Competitive matches',
      'Tournament eligibility',
    ],
    icon: 'trophy.fill',
    color: '#F44336',
  },
  {
    value: SkillLevel.Open,
    label: 'Open',
    description: 'Highly skilled player. Tournament experience. All shots and strategies mastered.',
    rules: [
      'Access to all game levels',
      'Priority for tournaments',
      'Can host competitive games',
    ],
    icon: 'star.fill',
    color: '#9C27B0',
  },
];

export default function SkillSelectScreen() {
  const [selectedSkill, setSelectedSkill] = useState<SkillLevel | null>(null);
  const [expandedSkill, setExpandedSkill] = useState<SkillLevel | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const { updateProfile } = useAuth();
  const router = useRouter();

  const handleSkillSelect = (skill: SkillLevel) => {
    setSelectedSkill(skill);
    setExpandedSkill(skill);
  };

  const handleConfirm = async () => {
    if (!selectedSkill) {
      Alert.alert(
        'Selection Required',
        'Please select your skill level to continue.',
        [{ text: 'OK' }]
      );
      return;
    }

    setIsUpdating(true);
    try {
      await updateProfile({ skillLevel: selectedSkill });
      router.replace('/(tabs)/explore');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update skill level';
      Alert.alert(
        'Error',
        errorMessage,
        [
          {
            text: 'Try Again',
            onPress: () => handleConfirm(),
            style: 'default',
          },
          {
            text: 'Cancel',
            style: 'cancel',
          },
        ]
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const toggleExpanded = (skill: SkillLevel) => {
    setExpandedSkill(expandedSkill === skill ? null : skill);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Select Your Skill Level</Text>
        <Text style={styles.subtitle}>
          Choose the level that best matches your current abilities.
          This helps us match you with appropriate games.
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.skillList}>
          {SKILL_LEVELS.map((skill) => (
            <View key={skill.value} style={styles.skillCard}>
              <TouchableOpacity
                style={[
                  styles.skillHeader,
                  selectedSkill === skill.value && styles.selectedSkill,
                  { borderColor: skill.color + '40' },
                ]}
                onPress={() => handleSkillSelect(skill.value)}
              >
                <View style={styles.skillTitleContainer}>
                  <IconSymbol
                    name={skill.icon}
                    size={24}
                    color={skill.color}
                    style={styles.skillIcon}
                  />
                  <View style={styles.textContainer}>
                    <Text style={styles.skillLabel}>{skill.label}</Text>
                    <Text style={styles.skillDescription} numberOfLines={expandedSkill === skill.value ? undefined : 2}>
                      {skill.description}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.expandButton}
                  onPress={() => toggleExpanded(skill.value)}
                >
                  <IconSymbol
                    name={expandedSkill === skill.value ? 'chevron.down' : 'chevron.down'}
                    size={20}
                    color="#666666"
                    style={[
                      styles.expandIcon,
                      expandedSkill === skill.value && styles.expandedIcon,
                    ]}
                  />
                </TouchableOpacity>
              </TouchableOpacity>

              {expandedSkill === skill.value && (
                <View style={styles.rulesContainer}>
                  <Text style={styles.rulesTitle}>Booking Rules:</Text>
                  {skill.rules.map((rule, index) => (
                    <View key={index} style={styles.ruleItem}>
                      <View style={[styles.ruleBullet, { backgroundColor: skill.color }]} />
                      <Text style={styles.ruleText}>{rule}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.confirmButton,
            (!selectedSkill || isUpdating) && styles.disabledButton,
          ]}
          onPress={handleConfirm}
          disabled={!selectedSkill || isUpdating}
        >
          {isUpdating ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.confirmButtonText}>
              {selectedSkill ? 'Confirm Selection' : 'Select a Skill Level'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    padding: 24,
    paddingTop: Platform.OS === 'ios' ? 80 : 60,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    lineHeight: 22,
  },
  content: {
    flex: 1,
    paddingTop: 10,
  },
  skillList: {
    padding: 16,
    paddingTop: 8,
    gap: 16,
  },
  skillCard: {
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  skillHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  selectedSkill: {
    borderColor: '#4CAF50',
    backgroundColor: '#F1F8E9',
  },
  skillTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingRight: 16,
  },
  skillIcon: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  skillLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  skillDescription: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  textContainer: {
    flex: 1,
    marginRight: 8,
  },
  expandButton: {
    padding: 8,
    marginLeft: 4,
    minWidth: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  expandIcon: {
    transform: [{ rotate: '-90deg' }],
  },
  expandedIcon: {
    transform: [{ rotate: '0deg' }],
  },
  rulesContainer: {
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  rulesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ruleBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 8,
  },
  ruleText: {
    fontSize: 14,
    color: '#666666',
    flex: 1,
  },
  footer: {
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  confirmButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    backgroundColor: '#E0E0E0',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
}); 