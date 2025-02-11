import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { View } from 'react-native';
import { GameList } from '../GameList';
import { Game, GameStatus, SkillLevel } from '@/types/game';
import { GameProvider } from '@/contexts/GameContext';

interface MockFlashListProps {
  data: Game[];
  renderItem: (info: { item: Game; index: number }) => React.ReactElement;
  ListEmptyComponent?: React.ReactElement;
}

// Mock FlashList since it's not compatible with JSDOM
jest.mock('@shopify/flash-list', () => {
  const MockFlashList: React.FC<MockFlashListProps> = ({ data, renderItem, ListEmptyComponent }) => (
    <View testID="flash-list">
      {data.length === 0 && ListEmptyComponent}
      {data.map((item, index) => (
        <View key={index}>{renderItem({ item, index })}</View>
      ))}
    </View>
  );
  
  return { FlashList: MockFlashList };
});

const mockGames: Game[] = [
  {
    id: '1',
    title: 'Game 1',
    date: new Date(),
    location: {
      id: '1',
      name: 'Court 1',
      address: '123 Test St',
      city: 'Test City',
      state: 'TS',
      zipCode: '12345',
      coordinates: { latitude: 0, longitude: 0 },
    },
    maxPlayers: 4,
    currentPlayers: 2,
    skillLevel: SkillLevel.Intermediate,
    price: 10,
    host: {
      id: '1',
      name: 'Host 1',
      email: 'host1@test.com',
      skillLevel: SkillLevel.Intermediate,
    },
    status: GameStatus.Upcoming,
  },
];

describe('GameList', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <GameProvider>{children}</GameProvider>
  );

  it('renders list of games', () => {
    const { getByText } = render(
      <GameList data={mockGames} />,
      { wrapper }
    );

    expect(getByText('Game 1')).toBeTruthy();
    expect(getByText('2/4 players • Intermediate')).toBeTruthy();
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
        ...mockGames[0],
        id: '2',
        title: 'Context Game',
      },
    ];

    jest.spyOn(require('@/contexts/GameContext'), 'useGames').mockReturnValue({
      games: mockContextGames,
      loading: false,
      error: null,
    });

    const { getByText } = render(
      <GameList />,
      { wrapper }
    );

    expect(getByText('Context Game')).toBeTruthy();
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