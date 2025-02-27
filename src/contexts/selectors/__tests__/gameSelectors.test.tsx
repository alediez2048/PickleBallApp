import React from 'react';
import renderer from 'react-test-renderer';
import { GameProvider } from '../../GameContext';
import * as gameSelectors from '../gameSelectors';
import { Game, GameStatus, SkillLevel } from '@/types/game';

// Mock data
const mockGames: Game[] = [
  {
    id: '1',
    title: 'Game 1',
    description: 'Test game description',
    startTime: '2024-03-25T10:00:00',
    endTime: '2024-03-25T12:00:00',
    location: {
      id: '1',
      name: 'Court 1',
      address: '123 Main St',
      city: 'Test City',
      state: 'TS',
      zipCode: '12345',
      coordinates: { latitude: 0, longitude: 0 },
    },
    maxPlayers: 4,
    registeredCount: 2,
    players: [],
    skillLevel: SkillLevel.Beginner,
    price: 10,
    host: {
      id: '1',
      name: 'Host 1',
      email: 'host1@test.com',
      skillLevel: SkillLevel.Intermediate,
    },
    status: GameStatus.Upcoming,
    createdAt: '2024-03-20T10:00:00',
    updatedAt: '2024-03-20T10:00:00',
  },
];

// Mock GameContext
jest.mock('../../GameContext', () => ({
  GameProvider: ({ children }: { children: React.ReactNode }) => children,
  useGames: () => ({
    games: mockGames,
    getGame: (id: string) => mockGames.find(game => game.id === id),
    isLoading: false,
    loadMore: jest.fn(),
  }),
}));

// Components to test the hooks
interface GameByIdProps {
  id: string;
}

const GameByIdComponent: React.FC<GameByIdProps> = ({ id }) => {
  const game = gameSelectors.useGameById(id);
  return <div data-testid="game-by-id">{game ? game.title : 'Not found'}</div>;
};

interface GamesByStatusProps {
  status: GameStatus;
}

const GamesByStatusComponent: React.FC<GamesByStatusProps> = ({ status }) => {
  const games = gameSelectors.useGamesByStatus(status);
  return (
    <div data-testid="games-by-status">
      {games.map(game => <div key={game.id}>{game.title}</div>)}
    </div>
  );
};

interface GamesBySkillLevelProps {
  skillLevel: SkillLevel;
}

const GamesBySkillLevelComponent: React.FC<GamesBySkillLevelProps> = ({ skillLevel }) => {
  const games = gameSelectors.useGamesBySkillLevel(skillLevel);
  return (
    <div data-testid="games-by-skill">
      {games.map(game => <div key={game.id}>{game.title}</div>)}
    </div>
  );
};

const GameStatsComponent: React.FC = () => {
  const stats = gameSelectors.useGameStats();
  return (
    <div data-testid="game-stats">
      <div>Total: {stats.total}</div>
      <div>Upcoming: {stats.upcoming}</div>
      <div>In Progress: {stats.inProgress}</div>
      <div>Completed: {stats.completed}</div>
      <div>Cancelled: {stats.cancelled}</div>
      <div>Average Price: {stats.averagePrice}</div>
    </div>
  );
};

interface FilteredGamesProps {
  filters: {
    status?: GameStatus;
    skillLevel?: SkillLevel;
    minPrice?: number;
    maxPrice?: number;
    dateRange?: { start: Date; end: Date };
  };
}

const FilteredGamesComponent: React.FC<FilteredGamesProps> = ({ filters }) => {
  const games = gameSelectors.useFilteredGames(filters);
  return (
    <div data-testid="filtered-games">
      {games.map(game => <div key={game.id}>{game.title}</div>)}
    </div>
  );
};

interface PaginatedGamesProps {
  page: number;
  pageSize: number;
}

const PaginatedGamesComponent: React.FC<PaginatedGamesProps> = ({ page, pageSize }) => {
  const pagination = gameSelectors.usePaginatedGames(page, pageSize);
  return (
    <div data-testid="paginated-games">
      <div>Page: {pagination.currentPage}</div>
      <div>Total Pages: {pagination.totalPages}</div>
      <div>
        {pagination.games.map(game => <div key={game.id}>{game.title}</div>)}
      </div>
    </div>
  );
};

describe('Game Selectors', () => {
  describe('useGameById', () => {
    it('returns the correct game by id', () => {
      const tree = renderer.create(<GameByIdComponent id="1" />).toJSON();
      expect(tree).toMatchSnapshot();
    });

    it('returns undefined for non-existent game', () => {
      const tree = renderer.create(<GameByIdComponent id="999" />).toJSON();
      expect(tree).toMatchSnapshot();
    });
  });

  describe('useGamesByStatus', () => {
    it('filters games by status', () => {
      const tree = renderer.create(<GamesByStatusComponent status={GameStatus.Upcoming} />).toJSON();
      expect(tree).toMatchSnapshot();
    });
  });

  describe('useGamesBySkillLevel', () => {
    it('filters games by skill level', () => {
      const tree = renderer.create(<GamesBySkillLevelComponent skillLevel={SkillLevel.Beginner} />).toJSON();
      expect(tree).toMatchSnapshot();
    });
  });

  describe('useGameStats', () => {
    it('calculates correct game statistics', () => {
      const tree = renderer.create(<GameStatsComponent />).toJSON();
      expect(tree).toMatchSnapshot();
    });
  });

  describe('useFilteredGames', () => {
    it('filters games based on multiple criteria', () => {
      const filters = {
        status: GameStatus.Upcoming,
        skillLevel: SkillLevel.Beginner,
        minPrice: 5,
        maxPrice: 15,
      };
      const tree = renderer.create(<FilteredGamesComponent filters={filters} />).toJSON();
      expect(tree).toMatchSnapshot();
    });

    it('returns empty array when no games match filters', () => {
      const filters = {
        minPrice: 100,
      };
      const tree = renderer.create(<FilteredGamesComponent filters={filters} />).toJSON();
      expect(tree).toMatchSnapshot();
    });
  });

  describe('usePaginatedGames', () => {
    it('returns correct pagination data', () => {
      const tree = renderer.create(<PaginatedGamesComponent page={1} pageSize={10} />).toJSON();
      expect(tree).toMatchSnapshot();
    });
  });
}); 