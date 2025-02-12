import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { ThemedText } from '@/components/ThemedText';

interface QuickActionsProps {
  onCreateGame: () => void;
}

export function QuickActions({ onCreateGame }: QuickActionsProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.action} onPress={onCreateGame}>
        <IconSymbol name="person.fill.badge.plus" size={24} color="#4CAF50" />
        <ThemedText style={styles.actionText}>Create Game</ThemedText>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 16,
    gap: 16,
  },
  action: {
    alignItems: 'center',
    gap: 8,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '500',
  },
}); 