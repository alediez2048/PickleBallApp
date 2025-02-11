import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { View, Text, Pressable } from 'react-native';
import { GameProvider, useGames } from '../GameContext';
import { Game, SkillLevel, GameStatus } from '@/types/game';

// Test component that uses game context
const TestComponent: React.FC = () => {
  const { games, loading, error, fetchGames, createGame } = useGames();
  return (
    <View>
      <Pressable testID="fetch-games" onPress={() => fetchGames()}>
        <Text>Fetch Games</Text>
      </Pressable>
      <Pressable
        testID="create-game"
        onPress={() =>
          createGame({
            title: 'Test Game',
            date: new Date(),
            location: {
              id: '1',
              name: 'Test Court',
              address: '123 Test St',
              city: 'Test City',
              state: 'CA',
              zipCode: '12345',
              coordinates: {
                latitude: 37.7749,
                longitude: -122.4194,
              },
            },
            maxPlayers: 4,
            currentPlayers: 1,
            skillLevel: SkillLevel.Intermediate,
            price: 10,
            host: {
              id: '1',
              name: 'Test User',
              email: 'test@example.com',
              skillLevel: SkillLevel.Intermediate,
              rating: 4.5,
            },
          })
        }
      >
        <Text>Create Game</Text>
      </Pressable>
      <Text testID="loading-state">{loading ? 'loading' : 'not-loading'}</Text>
      <Text testID="error-state">{error || 'no-error'}</Text>
      <Text testID="games-count">{games.length}</Text>
    </View>
  );
};

describe('GameContext', () => {
  it('provides initial state', () => {
    const { getByTestId } = render(
      <GameProvider>
        <TestComponent />
      </GameProvider>
    );

    expect(getByTestId('loading-state')).toHaveTextContent('not-loading');
    expect(getByTestId('error-state')).toHaveTextContent('no-error');
    expect(getByTestId('games-count')).toHaveTextContent('0');
  });

  it('handles loading state during fetch', async () => {
    const { getByTestId } = render(
      <GameProvider>
        <TestComponent />
      </GameProvider>
    );

    fireEvent.press(getByTestId('fetch-games'));

    expect(getByTestId('loading-state')).toHaveTextContent('loading');

    await waitFor(() => {
      expect(getByTestId('loading-state')).toHaveTextContent('not-loading');
    });
  });

  it('handles loading state during create', async () => {
    const { getByTestId } = render(
      <GameProvider>
        <TestComponent />
      </GameProvider>
    );

    fireEvent.press(getByTestId('create-game'));

    expect(getByTestId('loading-state')).toHaveTextContent('loading');

    await waitFor(() => {
      expect(getByTestId('loading-state')).toHaveTextContent('not-loading');
    });
  });
}); 