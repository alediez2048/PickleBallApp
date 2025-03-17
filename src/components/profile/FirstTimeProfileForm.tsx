import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
  Dimensions,
  LayoutChangeEvent,
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
import { DatePicker } from '@/components/common/ui/DatePicker';
import { Picker } from '@/components/common/ui/Picker';
import { US_STATES } from '@/data/states';
import { COUNTRIES } from '@/data/countries';

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
  preferredPlayStyle: PlayStyle[];
  waiverAccepted: boolean;
  termsAccepted: boolean;
  privacyPolicyAccepted: boolean;
}

export function FirstTimeProfileForm({
  onComplete,
}: FirstTimeProfileFormProps) {
  console.debug('[FirstTimeProfileForm] Component mounting', Platform.OS);

  const { user, updateFirstTimeProfile } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState<FormData>({
    displayName: '',
    phoneNumber: '',
    dateOfBirth: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US', // Default to US
    preferredPlayStyle: [],
    waiverAccepted: false,
    termsAccepted: false,
    privacyPolicyAccepted: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeModal, setActiveModal] = useState<'terms' | 'privacy' | 'waiver' | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<SkillLevel>(SkillLevel.Beginner);
  const [showSkillDescription, setShowSkillDescription] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const layoutMeasured = useRef(false);

  console.debug('[FirstTimeProfileForm] Component mounted', { platform: Platform.OS });

  useEffect(() => {
    console.log('[Profile] First time profile form mounted');
    
    // Initialize form with user data if available
    if (user) {
      setForm(prevForm => ({
        ...prevForm,
        displayName: user.name || '',
        phoneNumber: user.phoneNumber || '',
        dateOfBirth: user.dateOfBirth || '',
        address: user.address?.street || '',
        city: user.address?.city || '',
        state: user.address?.state || '',
        zipCode: user.address?.zipCode || '',
        country: 'US', // Default to US
      }));
      
      if (user.skillLevel) {
        const skillLevelEnum = Object.values(SkillLevel).find(
          level => level.toLowerCase() === user.skillLevel?.toLowerCase()
        );
        if (skillLevelEnum) {
          setSelectedSkill(skillLevelEnum);
        }
      }
    }
  }, [user]);

  const onLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    if (!layoutMeasured.current) {
      console.debug('[FirstTimeProfileForm] Initial form layout measured', {
        width,
        height,
        platform: Platform.OS,
        isVisible: true
      });
      layoutMeasured.current = true;
    }
  };

  const handleSubmit = async () => {
    console.debug('[FirstTimeProfileForm] Starting form submission', {
      platform: Platform.OS,
      formData: form
    });

    try {
      console.log('[Profile] Starting profile update', { formData: form });
      setIsSubmitting(true);
      setError(null);

      // Validate required fields
      if (!form.displayName?.trim()) {
        console.debug('[FirstTimeProfileForm] Validation failed: displayName required');
        setError('Display name is required');
        return;
      }

      if (!form.phoneNumber?.trim()) {
        console.debug('[FirstTimeProfileForm] Validation failed: phoneNumber required');
        setError('Phone number is required');
        return;
      }

      if (!form.dateOfBirth) {
        console.debug('[FirstTimeProfileForm] Validation failed - missing date of birth');
        setError('Date of birth is required');
        return;
      }

      const profileData: FirstTimeProfileData = {
        displayName: form.displayName.trim(),
        phoneNumber: form.phoneNumber.trim(),
        dateOfBirth: form.dateOfBirth,
        address: {
          address: form.address.trim(),
          city: form.city.trim(),
          state: form.state.trim(),
          zipCode: form.zipCode.trim(),
          country: form.country
        },
        skillLevel: selectedSkill,
        playingExperience: "0", // We're removing this field from the UI
        preferredPlayStyle: form.preferredPlayStyle,
        membershipTier: 'free',
        preferences: {
          notifications: true,
          emailUpdates: true,
          matchAlerts: true
        },
        waiverAccepted: form.waiverAccepted,
        waiverSignedAt: new Date().toISOString(),
        termsAccepted: form.termsAccepted,
        termsAcceptedAt: new Date().toISOString(),
        privacyPolicyAccepted: form.privacyPolicyAccepted,
        privacyPolicyAcceptedAt: new Date().toISOString(),
        hasCompletedProfile: true
      };

      console.debug('[FirstTimeProfileForm] Calling updateFirstTimeProfile', {
        profileData: JSON.stringify(profileData, null, 2)
      });

      await updateFirstTimeProfile(profileData);
      
      console.log('[Profile] Profile update successful');
      onComplete();
    } catch (err) {
      console.error('[Profile] Profile update failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to update profile');
      Alert.alert(
        'Error',
        'Failed to update profile. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTermsAccept = async () => {
    const now = new Date().toISOString();
    switch (activeModal) {
      case 'terms':
        setForm(prev => ({ ...prev, termsAccepted: true, termsAcceptedAt: now }));
        break;
      case 'privacy':
        setForm(prev => ({ ...prev, privacyPolicyAccepted: true, privacyPolicyAcceptedAt: now }));
        break;
      case 'waiver':
        setForm(prev => ({ ...prev, waiverAccepted: true, waiverSignedAt: now }));
        break;
    }
    setActiveModal(null);
  };

  const handlePlayStyleToggle = (style: PlayStyle) => {
    setForm(prev => {
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
    <View 
      style={styles.container}
      onLayout={onLayout}
    >
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
                value={form.displayName}
                onChangeText={(text) => setForm(prev => ({ ...prev, displayName: text }))}
                error={errors.displayName}
                autoCapitalize="words"
                editable={!isSubmitting}
              />

              <TextInput
                label="Phone Number"
                value={form.phoneNumber}
                onChangeText={(text) => setForm(prev => ({ ...prev, phoneNumber: text }))}
                error={errors.phoneNumber}
                keyboardType="phone-pad"
                editable={!isSubmitting}
              />

              <DatePicker
                label="Date of Birth"
                value={form.dateOfBirth}
                onChangeText={(text) => setForm(prev => ({ ...prev, dateOfBirth: text }))}
                error={errors.dateOfBirth}
                editable={!isSubmitting}
                maximumDate={new Date()} // Can't select future dates
              />

              <TextInput
                label="Address"
                value={form.address}
                onChangeText={(text) => setForm(prev => ({ ...prev, address: text }))}
                error={errors.address}
                editable={!isSubmitting}
              />

              <View style={styles.row}>
                <View style={styles.halfWidth}>
                  <TextInput
                    label="City"
                    value={form.city}
                    onChangeText={(text) => setForm(prev => ({ ...prev, city: text }))}
                    error={errors.city}
                    editable={!isSubmitting}
                  />
                </View>
                <View style={styles.halfWidth}>
                  <Picker
                    label="State"
                    value={form.state}
                    onValueChange={(value) => setForm(prev => ({ ...prev, state: value }))}
                    items={US_STATES}
                    error={errors.state}
                    editable={!isSubmitting}
                    placeholder="Select State"
                  />
                </View>
              </View>

              <View style={styles.row}>
                <View style={styles.halfWidth}>
                  <TextInput
                    label="ZIP Code"
                    value={form.zipCode}
                    onChangeText={(text) => setForm(prev => ({ ...prev, zipCode: text }))}
                    error={errors.zipCode}
                    keyboardType="numeric"
                    editable={!isSubmitting}
                  />
                </View>
                <View style={styles.halfWidth}>
                  <Picker
                    label="Country"
                    value={form.country}
                    onValueChange={(value) => setForm(prev => ({ ...prev, country: value }))}
                    items={COUNTRIES}
                    error={errors.country}
                    editable={!isSubmitting}
                  />
                </View>
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
                        form.preferredPlayStyle.includes(style.value) && styles.selectedPlayStyleButton,
                      ]}
                      onPress={() => handlePlayStyleToggle(style.value as PlayStyle)}
                    >
                      <ThemedText
                        style={[
                          styles.playStyleButtonText,
                          form.preferredPlayStyle.includes(style.value) && styles.selectedPlayStyleButtonText,
                        ]}
                      >
                        {style.label}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Legal Agreements */}
              <View style={styles.section}>
                <ThemedText variant="subtitle" style={styles.sectionTitle}>
                  Legal Agreements
                </ThemedText>
                
                <View style={styles.legalContainer}>
                  <TouchableOpacity
                    style={[styles.legalButton, form.termsAccepted && styles.acceptedLegalButton]}
                    onPress={() => setActiveModal('terms')}
                  >
                    <IconSymbol
                      name={form.termsAccepted ? 'checkmark' : 'person.fill'}
                      size={24}
                      color={form.termsAccepted ? '#4CAF50' : '#666666'}
                    />
                    <ThemedText style={styles.legalButtonText}>
                      Accept Terms & Conditions
                    </ThemedText>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.legalButton, form.privacyPolicyAccepted && styles.acceptedLegalButton]}
                    onPress={() => setActiveModal('privacy')}
                  >
                    <IconSymbol
                      name={form.privacyPolicyAccepted ? 'checkmark' : 'person.fill'}
                      size={24}
                      color={form.privacyPolicyAccepted ? '#4CAF50' : '#666666'}
                    />
                    <ThemedText style={styles.legalButtonText}>
                      Accept Privacy Policy
                    </ThemedText>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.legalButton, form.waiverAccepted && styles.acceptedLegalButton]}
                    onPress={() => setActiveModal('waiver')}
                  >
                    <IconSymbol
                      name={form.waiverAccepted ? 'checkmark' : 'person.fill'}
                      size={24}
                      color={form.waiverAccepted ? '#4CAF50' : '#666666'}
                    />
                    <ThemedText style={styles.legalButtonText}>
                      Accept Liability Waiver
                    </ThemedText>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <View style={styles.actions}>
              <Button
                onPress={handleSubmit}
                disabled={isSubmitting}
                loading={isSubmitting}
                style={styles.submitButton}
              >
                {isSubmitting ? 'Saving...' : 'Complete Profile'}
              </Button>
            </View>
          </View>
        </ScrollView>

        <TermsModal
          visible={activeModal !== null}
          type={activeModal || 'terms'}
          onAccept={handleTermsAccept}
          onClose={() => setActiveModal(null)}
        />
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
    width: '100%',
  },
  content: {
    padding: 24,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 24,
    textAlign: 'center',
  },
  form: {
    gap: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  halfWidth: {
    flex: 1,
  },
  actions: {
    marginTop: 24,
  },
  submitButton: {
    width: '100%',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    marginBottom: 16,
    fontSize: 18,
    fontWeight: '600',
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