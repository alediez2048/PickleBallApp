import React from 'react';
import { StyleSheet } from 'react-native';
import { ThemedView } from '../common/ThemedView';
import { ThemedText } from '../common/ThemedText';

export const HomeScreen: React.FC = () => {
  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>Welcome to PicklePass</ThemedText>
      <ThemedText style={styles.subtitle}>
        Find and join pickleball games near you
      </ThemedText>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
}); 