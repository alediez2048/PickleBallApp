import React from 'react';
import { ThemedView } from '@components/ThemedView';
import { ThemedText } from '@components/ThemedText';

export default function ExploreScreen() {
  return (
    <ThemedView className="flex-1 items-center justify-center">
      <ThemedText className="text-xl font-bold">
        Explore Games
      </ThemedText>
      <ThemedText className="mt-2 text-center px-4">
        Find and join pickleball games in your area
      </ThemedText>
    </ThemedView>
  );
}
