import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { View, ViewStyle } from 'react-native';
import { GameList } from '../GameList';
import { Game } from '@/types/game';
import { GameProvider } from '@/contexts/GameContext';
import { mockGame } from '@/utils/test/mockData';

interface MockImageProps {
  source: string;
  style?: ViewStyle;
  testID?: string;
}

interface MockFlashListProps {
  data: Game[];
  renderItem: (info: { item: Game; index: number }) => React.ReactElement;
  ListEmptyComponent?: React.ReactElement;
}

// Mock expo-image
jest.mock('expo-image', () => ({
  Image: ({ source, style, testID }: MockImageProps) => (
    <View testID={testID || 'mock-image'} style={style} />
  ),
}));

// Mock FlashList since it's not compatible with JSDOM
jest.mock('@shopify/flash-list', () => {
  const MockFlashList = ({ data, renderItem, ListEmptyComponent }: MockFlashListProps) => (
    <View testID="flash-list">
      {data.length === 0 && ListEmptyComponent}
      {data.map((item: Game, index: number) => (
        <View key={index}>{renderItem({ item, index })}</View>
      ))}
    </View>
  );
  
  return { FlashList: MockFlashList };
});

describe('GameList', () => {
  const mockGames = [mockGame];

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <GameProvider>{children}</GameProvider>
  );

  it('renders list of games with images', () => {
    const { getByText, getByTestId } = render(
      <GameList data={mockGames} />,
      { wrapper }
    );

    expect(getByText('Game 1')).toBeTruthy();
    expect(getByText('0/4 players • Intermediate')).toBeTruthy();
    expect(getByTestId('mock-image')).toBeTruthy();
    expect(getByText('Court 1 • Test City, TS')).toBeTruthy();
  });

  it('shows loading state', () => {
    const { getByTestId } = render(
      <GameList loading={true} />,
      { wrapper }
    );

    expect(getByTestId('loading-spinner')).toBeTruthy();
  });

  it('shows error state', () => {
    const errorMessage = 'Failed to load games';
    const { getByText } = render(
      <GameList error={errorMessage} />,
      { wrapper }
    );

    expect(getByText(errorMessage)).toBeTruthy();
  });

  it('shows empty state when no games', () => {
    const { getByText } = render(
      <GameList data={[]} />,
      { wrapper }
    );

    expect(getByText('No games found')).toBeTruthy();
  });

  it('handles game press', () => {
    const onGamePress = jest.fn();
    const { getByText } = render(
      <GameList data={mockGames} onGamePress={onGamePress} />,
      { wrapper }
    );

    fireEvent.press(getByText('Game 1'));
    expect(onGamePress).toHaveBeenCalledWith(mockGames[0]);
  });

  it('handles scroll events', () => {
    const onEndReached = jest.fn();
    const { getByTestId } = render(
      <GameList data={mockGames} onEndReached={onEndReached} />,
      { wrapper }
    );

    fireEvent.scroll(getByTestId('flash-list'), {
      nativeEvent: {
        contentOffset: { y: 500 },
        contentSize: { height: 500, width: 100 },
        layoutMeasurement: { height: 100, width: 100 },
      },
    });

    expect(onEndReached).toHaveBeenCalled();
  });

  it('uses context data when no data prop provided', () => {
    const mockContextGames = [
      {
        ...mockGame,
        id: '2',
        title: 'Context Game',
      },
    ];

    jest.spyOn(require('@/contexts/GameContext'), 'useGames').mockReturnValue({
      games: mockContextGames,
      loading: false,
      error: null,
      prefetchGame: jest.fn(),
    });

    const { getByText } = render(
      <GameList />,
      { wrapper }
    );

    expect(getByText('Context Game')).toBeTruthy();
  });

  it('prefetches next batch of games', () => {
    const prefetchGame = jest.fn();
    jest.spyOn(require('@/contexts/GameContext'), 'useGames').mockReturnValue({
      games: mockGames,
      loading: false,
      error: null,
      prefetchGame,
    });

    render(
      <GameList data={mockGames} prefetchCount={2} />,
      { wrapper }
    );

    expect(prefetchGame).toHaveBeenCalledWith(mockGames[0].id);
  });

  it('memoizes list items correctly', () => {
    const { rerender, getByText } = render(
      <GameList data={mockGames} />,
      { wrapper }
    );

    const initialGame = getByText('Game 1').parent;
    
    // Rerender with same data
    rerender(<GameList data={mockGames} />);
    
    const rerenderedGame = getByText('Game 1').parent;
    
    // The component instance should be the same due to memoization
    expect(initialGame).toBe(rerenderedGame);
  });
});

export const SkillLevel = {
  Beginner: 'Beginner',
  Intermediate: 'Intermediate',
  Advanced: 'Advanced',
  AllLevels: 'All Levels'
} as const;

export const GameStatus = {
  Scheduled: 'scheduled',
  InProgress: 'in-progress',
  Completed: 'completed',
  Cancelled: 'cancelled'
} as const;

export type AppRoutes = {
  '/(tabs)/': undefined;
  '/(tabs)/home': undefined;
  '/(tabs)/games': { category?: string };
  '/games/[id]': { id: string };
  '/games/create': undefined;
  '/activity/[id]': { id: string };
  '/(auth)/login': undefined;
  '/(auth)/register': undefined;
  '/(auth)/forgot-password': undefined;
}; 