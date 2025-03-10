import React from 'react';
import { View, StyleSheet } from 'react-native';
import SupabaseTest from '../components/SupabaseTest';
import { SupabaseProvider } from '../contexts/SupabaseProvider';

export default function SupabaseTestScreen() {
  return (
    <SupabaseProvider>
      <View style={styles.container}>
        <SupabaseTest />
      </View>
    </SupabaseProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
}); 