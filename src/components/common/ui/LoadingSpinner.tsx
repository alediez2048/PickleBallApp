import React from 'react';
import { ActivityIndicator, View, StyleSheet, SafeAreaView } from 'react-native';
import { ThemedText } from '@components/ThemedText';
import { useThemedColor } from '@/contexts/selectors/uiSelectors';
import { LogBox } from 'react-native';

interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  message?: string;
  color?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'large',
  message,
  color,
}) => {
  const spinnerColor = color || useThemedColor('primary');

  return (
    <SafeAreaView style={styles.container} testID="loading-spinner">
      <View style={styles.content}>
        <ActivityIndicator size={size} color={spinnerColor} />
        {message && (
          <ThemedText style={styles.message}>
            {message}
          </ThemedText>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  message: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
});

LogBox.ignoreLogs(['Warning: Each child in a list should have a unique "key" prop']); 