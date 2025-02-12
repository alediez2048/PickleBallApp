import React from 'react';
import { Stack } from 'expo-router';
import { ProfileTestScreen } from '@/components/screens/profile/ProfileTestScreen';

export default function ProfileTest() {
  return (
    <>
      <Stack.Screen
        options={{
          title: 'Profile Test',
          headerBackTitle: 'Back',
        }}
      />
      <ProfileTestScreen />
    </>
  );
} 