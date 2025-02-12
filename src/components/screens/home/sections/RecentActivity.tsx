import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';

interface RecentActivityProps {
  userId: string;
}

export function RecentActivity({ userId }: RecentActivityProps) {
  return (
    <View style={styles.container}>
      <ThemedText style={styles.title}>Recent Activity</ThemedText>
      <View style={styles.activityContainer}>
        <ThemedText style={styles.emptyText}>No recent activity</ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
  },
  activityContainer: {
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    color: '#666666',
  },
}); 