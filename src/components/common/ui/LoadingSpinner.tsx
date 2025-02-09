import React from 'react';
import { ActivityIndicator, View, StyleSheet, SafeAreaView } from 'react-native';
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
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <ActivityIndicator size={size} color="#2E7D32" />
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