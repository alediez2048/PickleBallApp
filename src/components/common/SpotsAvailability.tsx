import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useGameRegistration } from '@/hooks/useGameRegistration';

interface SpotsAvailabilityProps {
  gameId: string;
  variant?: 'card' | 'detail';
  showLoadingState?: boolean;
  onGameFullStatusChange?: (isFull: boolean) => void;
}

export function SpotsAvailability({ 
  gameId, 
  variant = 'card',
  showLoadingState = true,
  onGameFullStatusChange
}: SpotsAvailabilityProps) {
  const { 
    isLoading, 
    error, 
    isFull, 
    spotsLeft, 
    formatSpotsMessage 
  } = useGameRegistration(gameId);
  
  // Use a ref to track previous isFull value to avoid unnecessary updates
  const prevIsFullRef = useRef<boolean | undefined>(undefined);

  // Report game full status back to parent component only when it changes
  useEffect(() => {
    // Only call the callback if:
    // 1. We have a callback
    // 2. We're not loading or have an error
    // 3. It's the first time (prevIsFullRef.current is undefined) OR the value has changed
    if (
      onGameFullStatusChange && 
      !isLoading && 
      !error && 
      (prevIsFullRef.current === undefined || prevIsFullRef.current !== isFull)
    ) {
      prevIsFullRef.current = isFull;
      onGameFullStatusChange(isFull);
    }
  }, [onGameFullStatusChange, isFull, isLoading, error]);

  if (!showLoadingState && isLoading) {
    return null;
  }

  return (
    <View style={[
      styles.container,
      variant === 'detail' && styles.detailContainer
    ]}>
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#666666" />
          <Text style={styles.loadingText}>Checking availability...</Text>
        </View>
      ) : error ? (
        <Text style={styles.errorText}>Unable to check availability</Text>
      ) : (
        <View style={styles.contentContainer}>
          <Text style={[
            styles.label,
            variant === 'detail' && styles.detailLabel
          ]}>
            Spots Available
          </Text>
          <Text style={[
            styles.value,
            isFull && styles.fullValue,
            variant === 'detail' && styles.detailValue
          ]}>
            {formatSpotsMessage()}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 8,
  },
  detailContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    color: '#666666',
    fontSize: 14,
  },
  errorText: {
    color: '#F44336',
    fontSize: 14,
  },
  contentContainer: {
    gap: 4,
  },
  label: {
    fontSize: 12,
    color: '#666666',
  },
  detailLabel: {
    fontSize: 14,
  },
  value: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  fullValue: {
    color: '#F44336',
  },
  detailValue: {
    fontSize: 18,
  },
}); 