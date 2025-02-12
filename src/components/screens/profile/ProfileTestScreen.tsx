import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Button } from '@/components/common/ui/Button';
import { Profile, ProfileVisibility } from '@/types/profile';
import { SkillLevel } from '@/types/game';
import { validateProfile, validateProfileUpdate } from '@/utils/validation/profileValidation';

export function ProfileTestScreen() {
  const [validationResults, setValidationResults] = useState<string[]>([]);

  const testValidProfile = () => {
    const profile: Profile = {
      id: '1',
      userId: 'user1',
      displayName: 'John Doe',
      bio: 'Pickleball enthusiast',
      skillLevel: SkillLevel.Intermediate,
      location: {
        city: 'San Francisco',
        state: 'CA'
      },
      avatarUrl: 'https://example.com/avatar.jpg',
      visibility: ProfileVisibility.Public,
      stats: {
        gamesPlayed: 10,
        gamesWon: 7,
        totalPlayTime: 600
      },
      preferences: {
        notifications: true,
        emailUpdates: false
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const result = validateProfile(profile);
    setValidationResults([
      'Testing Valid Profile:',
      `Has Errors: ${result.hasErrors()}`,
      ...result.getErrors().map(error => `${error.field}: ${error.message}`)
    ]);
  };

  const testInvalidProfile = () => {
    const profile: Profile = {
      id: '1',
      userId: 'user1',
      displayName: '', // Invalid: empty name
      bio: 'a'.repeat(501), // Invalid: too long
      skillLevel: SkillLevel.Intermediate,
      avatarUrl: 'invalid-url', // Invalid: bad URL
      visibility: ProfileVisibility.Public,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const result = validateProfile(profile);
    setValidationResults([
      'Testing Invalid Profile:',
      `Has Errors: ${result.hasErrors()}`,
      ...result.getErrors().map(error => `${error.field}: ${error.message}`)
    ]);
  };

  const testProfileUpdate = () => {
    const update = {
      displayName: 'Jane Doe',
      bio: 'Updated bio',
      skillLevel: SkillLevel.Advanced
    };

    const result = validateProfileUpdate(update);
    setValidationResults([
      'Testing Profile Update:',
      `Has Errors: ${result.hasErrors()}`,
      ...result.getErrors().map(error => `${error.field}: ${error.message}`)
    ]);
  };

  return (
    <ScrollView>
      <ThemedView style={styles.container}>
        <ThemedText style={styles.title}>Profile Test Screen</ThemedText>
        
        <View style={styles.buttonContainer}>
          <Button onPress={testValidProfile}>
            Test Valid Profile
          </Button>
          
          <Button onPress={testInvalidProfile}>
            Test Invalid Profile
          </Button>
          
          <Button onPress={testProfileUpdate}>
            Test Profile Update
          </Button>
        </View>

        <ThemedView style={styles.results}>
          <ThemedText style={styles.resultsTitle}>Validation Results:</ThemedText>
          {validationResults.map((result, index) => (
            <ThemedText key={index} style={styles.resultText}>
              {result}
            </ThemedText>
          ))}
        </ThemedView>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  buttonContainer: {
    gap: 12,
    marginBottom: 20,
  },
  results: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  resultText: {
    fontSize: 14,
    marginBottom: 4,
  },
}); 