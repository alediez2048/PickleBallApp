import React from 'react';
import { Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { View } from 'react-native';

export const TabBarBackground: React.FC = () => {
  if (Platform.OS === 'ios') {
    return (
      <BlurView
        className="absolute inset-0"
        intensity={80}
        tint="light"
      />
    );
  }

  return (
    <View className="absolute inset-0 bg-white dark:bg-gray-900" />
  );
}; 