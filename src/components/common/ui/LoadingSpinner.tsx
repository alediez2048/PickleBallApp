import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { ThemedText } from '@components/ThemedText';

interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  message?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'large',
  message,
}) => {
  return (
    <View className="flex-1 items-center justify-center">
      <ActivityIndicator size={size} color="#2E7D32" />
      {message && (
        <ThemedText className="mt-2 text-center text-gray-600 dark:text-gray-300">
          {message}
        </ThemedText>
      )}
    </View>
  );
}; 