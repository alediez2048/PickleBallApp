import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { Game, SkillLevel } from '@/types/game';
import { gamesApi, GameFilters } from '@/services/api/games';
import { ApiError } from '@/services/api/client';

// State interface
interface GameState {
  games: Game[];
  loading: boolean;
  error: string | null;
  optimisticUpdates: Map<string, Game>;
  prefetchedGames: Map<string, Game>;
}

// Action types
type GameAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_GAMES'; payload: Game[] }
  | { type: 'ADD_GAME'; payload: Game }
  | { type: 'UPDATE_GAME'; payload: Game }
  | { type: 'DELETE_GAME'; payload: string }
  | { type: 'SET_OPTIMISTIC_UPDATE'; payload: { id: string; game: Game } }
  | { type: 'CLEAR_OPTIMISTIC_UPDATE'; payload: string }
  | { type: 'SET_PREFETCHED_GAME'; payload: { id: string; game: Game } }
  | { type: 'CLEAR_PREFETCHED_GAME'; payload: string };

// Initial state
const initialState: GameState = {
  games: [],
  loading: false,
  error: null,
  optimisticUpdates: new Map(),
  prefetchedGames: new Map(),
};

// Reducer
function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_GAMES':
      return { ...state, games: action.payload };
    case 'ADD_GAME':
      return { ...state, games: [...state.games, action.payload] };
    case 'UPDATE_GAME': {
      const newGames = state.games.map(game => 
        game.id === action.payload.id ? action.payload : game
      );
      const newOptimisticUpdates = new Map(state.optimisticUpdates);
      newOptimisticUpdates.delete(action.payload.id);
      return {
        ...state,
        games: newGames,
        optimisticUpdates: newOptimisticUpdates,
      };
    }
    case 'DELETE_GAME': {
      const newGames = state.games.filter(game => game.id !== action.payload);
      const newOptimisticUpdates = new Map(state.optimisticUpdates);
      newOptimisticUpdates.delete(action.payload);
      return {
        ...state,
        games: newGames,
        optimisticUpdates: newOptimisticUpdates,
      };
    }
    case 'SET_OPTIMISTIC_UPDATE': {
      const newOptimisticUpdates = new Map(state.optimisticUpdates);
      newOptimisticUpdates.set(action.payload.id, action.payload.game);
      return {
        ...state,
        optimisticUpdates: newOptimisticUpdates,
      };
    }
    case 'CLEAR_OPTIMISTIC_UPDATE': {
      const newOptimisticUpdates = new Map(state.optimisticUpdates);
      newOptimisticUpdates.delete(action.payload);
      return {
        ...state,
        optimisticUpdates: newOptimisticUpdates,
      };
    }
    case 'SET_PREFETCHED_GAME': {
      const newPrefetchedGames = new Map(state.prefetchedGames);
      newPrefetchedGames.set(action.payload.id, action.payload.game);
      return {
        ...state,
        prefetchedGames: newPrefetchedGames,
      };
    }
    case 'CLEAR_PREFETCHED_GAME': {
      const newPrefetchedGames = new Map(state.prefetchedGames);
      newPrefetchedGames.delete(action.payload);
      return {
        ...state,
        prefetchedGames: newPrefetchedGames,
      };
    }
    default:
      return state;
  }
}

// Context interface
interface GameContextType extends Omit<GameState, 'optimisticUpdates' | 'prefetchedGames'> {
  fetchGames: (filters?: GameFilters) => Promise<void>;
  createGame: (gameData: Omit<Game, 'id' | 'status'>) => Promise<void>;
  updateGame: (gameId: string, gameData: Partial<Game>) => Promise<void>;
  deleteGame: (gameId: string) => Promise<void>;
  joinGame: (gameId: string) => Promise<void>;
  leaveGame: (gameId: string) => Promise<void>;
  prefetchGame: (gameId: string) => Promise<void>;
  getGame: (gameId: string) => Game | undefined;
}

// Create context
const GameContext = createContext<GameContextType | undefined>(undefined);

// Provider component
export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  const handleError = (error: unknown) => {
    const message = error instanceof ApiError 
      ? error.message 
      : 'An unexpected error occurred';
    dispatch({ type: 'SET_ERROR', payload: message });
  };

  const getGame = useCallback((gameId: string): Game | undefined => {
    // Check optimistic updates first
    const optimisticGame = state.optimisticUpdates.get(gameId);
    if (optimisticGame) return optimisticGame;

    // Then check prefetched games
    const prefetchedGame = state.prefetchedGames.get(gameId);
    if (prefetchedGame) return prefetchedGame;

    // Finally check regular games
    return state.games.find(game => game.id === gameId);
  }, [state.games, state.optimisticUpdates, state.prefetchedGames]);

  const prefetchGame = useCallback(async (gameId: string) => {
    try {
      const response = await gamesApi.getGame(gameId);
      dispatch({ 
        type: 'SET_PREFETCHED_GAME', 
        payload: { id: gameId, game: response.data } 
      });
    } catch (error) {
      console.error('Error prefetching game:', error);
    }
  }, []);

  const fetchGames = useCallback(async (filters?: GameFilters) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    try {
      const response = await gamesApi.getGames(filters);
      dispatch({ type: 'SET_GAMES', payload: response.data });
    } catch (error) {
      handleError(error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const createGame = useCallback(async (gameData: Omit<Game, 'id' | 'status'>) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    try {
      const response = await gamesApi.createGame(gameData);
      dispatch({ type: 'ADD_GAME', payload: response.data });
    } catch (error) {
      handleError(error);
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const updateGame = useCallback(async (gameId: string, gameData: Partial<Game>) => {
    const currentGame = getGame(gameId);
    if (!currentGame) throw new Error('Game not found');

    // Apply optimistic update
    const optimisticGame = { ...currentGame, ...gameData };
    dispatch({ 
      type: 'SET_OPTIMISTIC_UPDATE', 
      payload: { id: gameId, game: optimisticGame } 
    });

    try {
      const response = await gamesApi.updateGame(gameId, gameData);
      dispatch({ type: 'UPDATE_GAME', payload: response.data });
    } catch (error) {
      // Revert optimistic update
      dispatch({ type: 'CLEAR_OPTIMISTIC_UPDATE', payload: gameId });
      handleError(error);
      throw error;
    }
  }, [getGame]);

  const deleteGame = useCallback(async (gameId: string) => {
    // Optimistically remove the game
    const deletedGame = getGame(gameId);
    if (deletedGame) {
      dispatch({ 
        type: 'SET_OPTIMISTIC_UPDATE', 
        payload: { id: gameId, game: { ...deletedGame, status: 'Cancelled' } } 
      });
    }

    try {
      await gamesApi.deleteGame(gameId);
      dispatch({ type: 'DELETE_GAME', payload: gameId });
    } catch (error) {
      // Revert optimistic update
      dispatch({ type: 'CLEAR_OPTIMISTIC_UPDATE', payload: gameId });
      handleError(error);
      throw error;
    }
  }, [getGame]);

  const joinGame = useCallback(async (gameId: string) => {
    const currentGame = getGame(gameId);
    if (!currentGame) throw new Error('Game not found');

    // Apply optimistic update
    const optimisticGame = { 
      ...currentGame, 
      currentPlayers: currentGame.currentPlayers + 1 
    };
    dispatch({ 
      type: 'SET_OPTIMISTIC_UPDATE', 
      payload: { id: gameId, game: optimisticGame } 
    });

    try {
      const response = await gamesApi.joinGame(gameId);
      dispatch({ type: 'UPDATE_GAME', payload: response.data });
    } catch (error) {
      // Revert optimistic update
      dispatch({ type: 'CLEAR_OPTIMISTIC_UPDATE', payload: gameId });
      handleError(error);
      throw error;
    }
  }, [getGame]);

  const leaveGame = useCallback(async (gameId: string) => {
    const currentGame = getGame(gameId);
    if (!currentGame) throw new Error('Game not found');

    // Apply optimistic update
    const optimisticGame = { 
      ...currentGame, 
      currentPlayers: currentGame.currentPlayers - 1 
    };
    dispatch({ 
      type: 'SET_OPTIMISTIC_UPDATE', 
      payload: { id: gameId, game: optimisticGame } 
    });

    try {
      const response = await gamesApi.leaveGame(gameId);
      dispatch({ type: 'UPDATE_GAME', payload: response.data });
    } catch (error) {
      // Revert optimistic update
      dispatch({ type: 'CLEAR_OPTIMISTIC_UPDATE', payload: gameId });
      handleError(error);
      throw error;
    }
  }, [getGame]);

  const value = {
    games: state.games,
    loading: state.loading,
    error: state.error,
    fetchGames,
    createGame,
    updateGame,
    deleteGame,
    joinGame,
    leaveGame,
    prefetchGame,
    getGame,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

// Hook for using the context
export function useGames() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGames must be used within a GameProvider');
  }
  return context;
} 