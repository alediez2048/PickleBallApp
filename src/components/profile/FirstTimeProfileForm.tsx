import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { Button } from '@components/common/ui/Button';
import { TextInput } from '@components/common/ui/TextInput';
import { ThemedText } from '@components/ThemedText';
import { useAuth } from '@/contexts/AuthContext';
import { Profile, ProfileStatus, MembershipTier } from '@/types/profile';
import { SkillLevel } from '@/types/game';
import { validateProfile } from '@/utils/validation/profileValidation';
import { TermsModal } from './TermsModal';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { FirstTimeProfileData } from '@/services/mockApi';

interface FirstTimeProfileFormProps {
  onComplete: () => void;
}

const SKILL_LEVELS: { value: SkillLevel; label: string; description: string }[] = [
  {
    value: SkillLevel.Beginner,
    label: 'Beginner',
    description: 'New to pickleball or played a few times. Learning basic rules and shots.',
  },
  {
    value: SkillLevel.Intermediate,
    label: 'Intermediate',
    description: 'Comfortable with basic shots and rules. Starting to develop strategy.',
  },
  {
    value: SkillLevel.Advanced,
    label: 'Advanced',
    description: 'Experienced player with strong shots and strategy. Competitive play.',
  },
  {
    value: SkillLevel.Open,
    label: 'Open',
    description: 'Highly skilled player. Tournament experience. All shots and strategies mastered.',
  },
];

const PLAY_STYLES = [
  { value: 'singles' as const, label: 'Singles' },
  { value: 'doubles' as const, label: 'Doubles' },
  { value: 'both' as const, label: 'Both' },
] as const;

type PlayStyle = typeof PLAY_STYLES[number]['value'];

interface FormData {
  displayName: string;
  phoneNumber: string;
  dateOfBirth: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  skillLevel: SkillLevel;
  playingExperience: number;
  preferredPlayStyle: PlayStyle[];
  waiverAccepted: boolean;
  termsAccepted: boolean;
  privacyPolicyAccepted: boolean;
}

export function FirstTimeProfileForm({
  onComplete,
}: FirstTimeProfileFormProps) {
  const { user, updateFirstTimeProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    displayName: '',
    phoneNumber: '',
    dateOfBirth: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    skillLevel: SkillLevel.Beginner,
    playingExperience: 0,
    preferredPlayStyle: [],
    waiverAccepted: false,
    termsAccepted: false,
    privacyPolicyAccepted: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeModal, setActiveModal] = useState<'terms' | 'privacy' | 'waiver' | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<SkillLevel>(SkillLevel.Beginner);
  const [showSkillDescription, setShowSkillDescription] = useState(false);

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      console.debug('[FirstTimeProfileForm] Submitting profile data:', formData);

      await updateFirstTimeProfile({
        displayName: formData.displayName,
        phoneNumber: formData.phoneNumber,
        dateOfBirth: formData.dateOfBirth,
        address: {
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          country: formData.country,
        },
        skillLevel: formData.skillLevel,
        playingExperience: formData.playingExperience,
        preferredPlayStyle: formData.preferredPlayStyle,
        waiverAccepted: formData.waiverAccepted,
        termsAccepted: formData.termsAccepted,
        privacyPolicyAccepted: formData.privacyPolicyAccepted,
      });

      console.debug('[FirstTimeProfileForm] Profile updated successfully');
      onComplete();
    } catch (error) {
      console.error('[FirstTimeProfileForm] Error updating profile:', error);
      Alert.alert(
        'Error',
        'Failed to update profile. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleTermsAccept = async () => {
    const now = new Date().toISOString();
    switch (activeModal) {
      case 'terms':
        setFormData(prev => ({ ...prev, termsAccepted: true, termsAcceptedAt: now }));
        break;
      case 'privacy':
        setFormData(prev => ({ ...prev, privacyPolicyAccepted: true, privacyPolicyAcceptedAt: now }));
        break;
      case 'waiver':
        setFormData(prev => ({ ...prev, waiverAccepted: true, waiverSignedAt: now }));
        break;
    }
    setActiveModal(null);
  };

  const handlePlayStyleToggle = (style: PlayStyle) => {
    setFormData(prev => {
      const newPlayStyles = prev.preferredPlayStyle.includes(style)
        ? prev.preferredPlayStyle.filter(s => s !== style)
        : [...prev.preferredPlayStyle, style];
      return {
        ...prev,
        preferredPlayStyle: newPlayStyles,
      };
    });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <ThemedText variant="title" style={styles.title}>
            Complete Your Profile
          </ThemedText>
          <ThemedText variant="subtitle" style={styles.subtitle}>
            Tell us a bit about yourself to get started
          </ThemedText>

          <View style={styles.form}>
            <TextInput
              label="Display Name"
              value={formData.displayName}
              onChangeText={(text) => setFormData(prev => ({ ...prev, displayName: text }))}
              error={errors.displayName}
              autoCapitalize="words"
              editable={!isLoading}
            />

            <TextInput
              label="Phone Number"
              value={formData.phoneNumber}
              onChangeText={(text) => setFormData(prev => ({ ...prev, phoneNumber: text }))}
              error={errors.phoneNumber}
              keyboardType="phone-pad"
              editable={!isLoading}
            />

            <TextInput
              label="Date of Birth"
              value={formData.dateOfBirth}
              onChangeText={(text) => setFormData(prev => ({ ...prev, dateOfBirth: text }))}
              error={errors.dateOfBirth}
              placeholder="YYYY-MM-DD"
              editable={!isLoading}
            />

            <TextInput
              label="Address"
              value={formData.address}
              onChangeText={(text) => setFormData(prev => ({ ...prev, address: text }))}
              error={errors.address}
              editable={!isLoading}
            />

            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <TextInput
                  label="City"
                  value={formData.city}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, city: text }))}
                  error={errors.city}
                  editable={!isLoading}
                />
              </View>
              <View style={styles.halfWidth}>
                <TextInput
                  label="State"
                  value={formData.state}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, state: text }))}
                  error={errors.state}
                  editable={!isLoading}
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <TextInput
                  label="ZIP Code"
                  value={formData.zipCode}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, zipCode: text }))}
                  error={errors.zipCode}
                  keyboardType="numeric"
                  editable={!isLoading}
                />
              </View>
              <View style={styles.halfWidth}>
                <TextInput
                  label="Country"
                  value={formData.country}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, country: text }))}
                  error={errors.country}
                  editable={!isLoading}
                />
              </View>
            </View>

            {/* Skill Level Selection */}
            <View style={styles.section}>
              <ThemedText variant="subtitle" style={styles.sectionTitle}>
                Playing Experience
              </ThemedText>
              
              <View style={styles.skillLevelContainer}>
                <ThemedText variant="body">Skill Level</ThemedText>
                <View style={styles.skillButtonsContainer}>
                  {SKILL_LEVELS.map((level) => (
                    <TouchableOpacity
                      key={level.value}
                      style={[
                        styles.skillButton,
                        selectedSkill === level.value && styles.selectedSkillButton,
                      ]}
                      onPress={() => setSelectedSkill(level.value)}
                    >
                      <ThemedText
                        style={[
                          styles.skillButtonText,
                          selectedSkill === level.value && styles.selectedSkillButtonText,
                        ]}
                      >
                        {level.label}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </View>
                
                <TouchableOpacity
                  style={styles.infoButton}
                  onPress={() => setShowSkillDescription(!showSkillDescription)}
                >
                  <IconSymbol
                    name={showSkillDescription ? 'checkmark' : 'person.fill'}
                    size={20}
                    color="#666666"
                  />
                  <ThemedText variant="caption" style={styles.infoButtonText}>
                    {showSkillDescription ? 'Hide Description' : 'What\'s my level?'}
                  </ThemedText>
                </TouchableOpacity>

                {showSkillDescription && (
                  <View style={styles.skillDescription}>
                    <ThemedText variant="body">
                      {SKILL_LEVELS.find(level => level.value === selectedSkill)?.description}
                    </ThemedText>
                  </View>
                )}
              </View>

              {/* Playing Experience */}
              <View style={styles.experienceContainer}>
                <ThemedText variant="body">Playing Experience</ThemedText>
                <TextInput
                  label="Months of Experience"
                  value={formData.playingExperience.toString()}
                  onChangeText={(text) => 
                    setFormData(prev => ({ 
                      ...prev, 
                      playingExperience: parseInt(text) || 0 
                    }))
                  }
                  keyboardType="numeric"
                  error={errors.playingExperience}
                  editable={!isLoading}
                />
              </View>

              {/* Preferred Play Style */}
              <View style={styles.playStyleContainer}>
                <ThemedText variant="body">Preferred Play Style</ThemedText>
                <View style={styles.playStyleButtons}>
                  {PLAY_STYLES.map((style) => (
                    <TouchableOpacity
                      key={style.value}
                      style={[
                        styles.playStyleButton,
                        formData.preferredPlayStyle.includes(style.value) && styles.selectedPlayStyleButton,
                      ]}
                      onPress={() => handlePlayStyleToggle(style.value as PlayStyle)}
                    >
                      <ThemedText
                        style={[
                          styles.playStyleButtonText,
                          formData.preferredPlayStyle.includes(style.value) && styles.selectedPlayStyleButtonText,
                        ]}
                      >
                        {style.label}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            {/* Legal Agreements */}
            <View style={styles.section}>
              <ThemedText variant="subtitle" style={styles.sectionTitle}>
                Legal Agreements
              </ThemedText>
              
              <View style={styles.legalContainer}>
                <TouchableOpacity
                  style={[styles.legalButton, formData.termsAccepted && styles.acceptedLegalButton]}
                  onPress={() => setActiveModal('terms')}
                >
                  <IconSymbol
                    name={formData.termsAccepted ? 'checkmark' : 'person.fill'}
                    size={24}
                    color={formData.termsAccepted ? '#4CAF50' : '#666666'}
                  />
                  <ThemedText style={styles.legalButtonText}>
                    Accept Terms & Conditions
                  </ThemedText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.legalButton, formData.privacyPolicyAccepted && styles.acceptedLegalButton]}
                  onPress={() => setActiveModal('privacy')}
                >
                  <IconSymbol
                    name={formData.privacyPolicyAccepted ? 'checkmark' : 'person.fill'}
                    size={24}
                    color={formData.privacyPolicyAccepted ? '#4CAF50' : '#666666'}
                  />
                  <ThemedText style={styles.legalButtonText}>
                    Accept Privacy Policy
                  </ThemedText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.legalButton, formData.waiverAccepted && styles.acceptedLegalButton]}
                  onPress={() => setActiveModal('waiver')}
                >
                  <IconSymbol
                    name={formData.waiverAccepted ? 'checkmark' : 'person.fill'}
                    size={24}
                    color={formData.waiverAccepted ? '#4CAF50' : '#666666'}
                  />
                  <ThemedText style={styles.legalButtonText}>
                    Accept Liability Waiver
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <Button
            variant="primary"
            size="large"
            onPress={handleSubmit}
            loading={isLoading}
            disabled={isLoading || !formData.termsAccepted || !formData.privacyPolicyAccepted || !formData.waiverAccepted}
            style={styles.submitButton}
          >
            Complete Profile
          </Button>
        </View>
      </ScrollView>

      <TermsModal
        visible={activeModal !== null}
        onClose={() => setActiveModal(null)}
        onAccept={handleTermsAccept}
        type={activeModal || 'terms'}
        isLoading={isLoading}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 24,
    paddingBottom: 48,
  },
  title: {
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    marginBottom: 32,
    textAlign: 'center',
    color: '#666',
  },
  form: {
    gap: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  submitButton: {
    marginTop: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    marginBottom: 16,
    fontSize: 18,
    fontWeight: '600',
  },
  skillLevelContainer: {
    marginBottom: 24,
  },
  skillButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  skillButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  selectedSkillButton: {
    borderColor: '#4CAF50',
    backgroundColor: '#4CAF50',
  },
  skillButtonText: {
    color: '#666666',
  },
  selectedSkillButtonText: {
    color: '#fff',
  },
  infoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    padding: 8,
  },
  infoButtonText: {
    marginLeft: 8,
    color: '#666666',
  },
  skillDescription: {
    marginTop: 8,
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  experienceContainer: {
    marginBottom: 24,
  },
  playStyleContainer: {
    marginBottom: 24,
  },
  playStyleButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  playStyleButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  selectedPlayStyleButton: {
    borderColor: '#4CAF50',
    backgroundColor: '#4CAF50',
  },
  playStyleButtonText: {
    color: '#666666',
  },
  selectedPlayStyleButtonText: {
    color: '#fff',
  },
  legalContainer: {
    gap: 16,
  },
  legalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  acceptedLegalButton: {
    borderColor: '#4CAF50',
    backgroundColor: '#f0fff0',
  },
  legalButtonText: {
    marginLeft: 12,
    color: '#666666',
  },
}); 