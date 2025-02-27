import React from 'react';
import { ReactNode } from 'react';
import renderer from 'react-test-renderer';
import { GameList } from '../GameList';
import type { Game, Location } from '@/types/game';

// Mock the required components
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  return {
    ...RN,
    View: 'View',
  };
});

// Mock expo-image
jest.mock('expo-image', () => 'Image');

// Create a mock structure factory to replace JSX
const createMockElement = (type: string, props: Record<string, any> = {}, key?: string): any => {
  return {
    type,
    props,
    key
  };
};

// Mock FlashList with a fixed implementation that avoids using JSX
jest.mock('@shopify/flash-list', () => {
  return {
    FlashList: (props: any) => {
      // We're returning a structure instead of JSX
      if (props.data && props.data.length > 0) {
        return createMockElement('View', {
          testID: props.testID || 'flash-list',
          children: [
            props.ListHeaderComponent && createMockElement('View', { 
              children: props.ListHeaderComponent 
            }),
            ...(props.data.map((item: any, index: number) => 
              createMockElement('View', {
                testID: 'list-item-container',
                children: props.renderItem({ item, index })
              }, item.id || index.toString())
            )),
            props.onEndReached && createMockElement('View', {
              testID: 'end-reached',
              onTouchEnd: props.onEndReached
            }),
            props.onRefresh && createMockElement('View', {
              testID: 'refresh-control',
              onTouchEnd: props.onRefresh
            })
          ].filter(Boolean)
        });
      }
      
      return createMockElement('View', {
        testID: props.testID || 'flash-list-empty',
        children: [
          props.ListEmptyComponent,
          props.onRefresh && createMockElement('View', {
            testID: 'refresh-control',
            onTouchEnd: props.onRefresh
          })
        ].filter(Boolean)
      });
    }
  };
});

// Mock the contexts
jest.mock('@/contexts/GameContext', () => ({
  useGames: () => ({
    games: [],
    loading: false,
    error: null,
    prefetchGame: jest.fn(),
  }),
  GameProvider: ({ children }: { children: ReactNode }) => children,
}));

jest.mock('@/contexts/UIContext', () => ({
  UIProvider: ({ children }: { children: ReactNode }) => children,
}));

// Mock ThemedText
jest.mock('@/components/ThemedText', () => ({
  ThemedText: (props: any) => createMockElement('View', {
    testID: 'themed-text',
    style: props.style,
    ...props,
    children: props.children
  }),
}));

// Mock LoadingSpinner
jest.mock('../LoadingSpinner', () => ({
  LoadingSpinner: (props: { message?: string }) => createMockElement('View', {
    testID: 'loading-spinner',
    children: props.message ? createMockElement('View', {
      testID: 'loading-message',
      children: props.message
    }) : null
  }),
}));

const mockLocation: Location = {
  id: '1',
  name: 'Test Location',
  address: '123 Test St',
  city: 'Test City',
  state: 'TS',
  zipCode: '12345',
  coordinates: {
    latitude: 37.7749,
    longitude: -122.4194,
  },
};

const createMockGame = (id: string): Game => {
  // Create a fixed date for testing
  const startDate = new Date('2023-01-01T10:00:00.000Z');
  const endDate = new Date('2023-01-01T12:00:00.000Z');
  
  return {
    id,
    title: `Game ${id}`,
    description: `Game ${id} description`,
    startTime: startDate.toISOString(),
    endTime: endDate.toISOString(),
    location: mockLocation,
    host: {
      id: '1',
      name: 'Host 1',
      email: 'host1@example.com',
      skillLevel: 'Intermediate' as const,
    },
    players: [],
    registeredCount: 4,
    maxPlayers: 8,
    skillLevel: 'Intermediate' as const,
    price: 10,
    imageUrl: 'https://example.com/image1.jpg',
    status: 'Upcoming' as const,
    createdAt: new Date('2023-01-01T09:00:00.000Z').toISOString(),
    updatedAt: new Date('2023-01-01T09:00:00.000Z').toISOString(),
  };
};

describe('GameList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Create a consistent date for snapshots
    const mockDate = new Date('2023-01-01T12:00:00.000Z');
    jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any);
  });
  
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders correctly with empty list', () => {
    const emptyComponent = <div data-testid="empty-list" />;
    
    const tree = renderer
      .create(
        <GameList
          data={[]}
          ListEmptyComponent={emptyComponent}
        />
      )
      .toJSON();
    
    expect(tree).toMatchSnapshot('empty list');
  });

  it('renders list of games', () => {
    const games = [
      createMockGame('1'),
      createMockGame('2'),
    ];

    const tree = renderer
      .create(<GameList data={games} />)
      .toJSON();
    
    expect(tree).toMatchSnapshot('game list with items');
  });

  it('shows loading state', () => {
    const tree = renderer
      .create(<GameList loading={true} />)
      .toJSON();
    
    expect(tree).toMatchSnapshot('loading state');
  });

  it('shows error state', () => {
    const errorMessage = 'Failed to load games';
    
    const tree = renderer
      .create(<GameList error={errorMessage} />)
      .toJSON();
    
    expect(tree).toMatchSnapshot('error state');
  });

  it('renders with header component', () => {
    const headerComponent = <div data-testid="header-component" />;
    
    const tree = renderer
      .create(
        <GameList 
          data={[createMockGame('1')]} 
          ListHeaderComponent={headerComponent}
        />
      )
      .toJSON();
    
    expect(tree).toMatchSnapshot('with header component');
  });

  it('renders with refresh and end reached handlers', () => {
    const onRefresh = jest.fn();
    const onEndReached = jest.fn();
    
    const tree = renderer
      .create(
        <GameList 
          data={[createMockGame('1')]} 
          onRefresh={onRefresh}
          onEndReached={onEndReached}
        />
      )
      .toJSON();
    
    expect(tree).toMatchSnapshot('with refresh and end reached handlers');
  });
});

export const SkillLevel = {
  Beginner: 'Beginner',
  Intermediate: 'Intermediate',
  Advanced: 'Advanced',
  AllLevels: 'All Levels'
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