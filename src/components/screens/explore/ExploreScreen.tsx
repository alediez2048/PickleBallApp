import React from 'react';
import { StyleSheet } from 'react-native';
import { ThemedView } from '../common/ThemedView';
import { ThemedText } from '../common/ThemedText';

export const ExploreScreen: React.FC = () => {
  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>Explore Games</ThemedText>
      <ThemedText style={styles.subtitle}>
        Discover pickleball games in your area
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