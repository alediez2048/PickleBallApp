import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
} from "react";
import { Game, SkillLevel, GameFilters, User } from "@/types/games";
import {
  createGame,
  listGames,
  updateGame,
  deleteGame,
} from "@/services/gamesService";

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
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_GAMES"; payload: Game[] }
  | { type: "ADD_GAME"; payload: Game }
  | { type: "UPDATE_GAME"; payload: Game }
  | { type: "DELETE_GAME"; payload: string }
  | { type: "SET_OPTIMISTIC_UPDATE"; payload: { id: string; game: Game } }
  | { type: "CLEAR_OPTIMISTIC_UPDATE"; payload: string }
  | { type: "SET_PREFETCHED_GAME"; payload: { id: string; game: Game } }
  | { type: "CLEAR_PREFETCHED_GAME"; payload: string };

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
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload };
    case "SET_GAMES":
      return { ...state, games: action.payload };
    case "ADD_GAME":
      return { ...state, games: [...state.games, action.payload] };
    case "UPDATE_GAME": {
      const newGames = state.games.map((game) =>
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
    case "DELETE_GAME": {
      const newGames = state.games.filter((game) => game.id !== action.payload);
      const newOptimisticUpdates = new Map(state.optimisticUpdates);
      newOptimisticUpdates.delete(action.payload);
      return {
        ...state,
        games: newGames,
        optimisticUpdates: newOptimisticUpdates,
      };
    }
    case "SET_OPTIMISTIC_UPDATE": {
      const newOptimisticUpdates = new Map(state.optimisticUpdates);
      newOptimisticUpdates.set(action.payload.id, action.payload.game);
      return {
        ...state,
        optimisticUpdates: newOptimisticUpdates,
      };
    }
    case "CLEAR_OPTIMISTIC_UPDATE": {
      const newOptimisticUpdates = new Map(state.optimisticUpdates);
      newOptimisticUpdates.delete(action.payload);
      return {
        ...state,
        optimisticUpdates: newOptimisticUpdates,
      };
    }
    case "SET_PREFETCHED_GAME": {
      const newPrefetchedGames = new Map(state.prefetchedGames);
      newPrefetchedGames.set(action.payload.id, action.payload.game);
      return {
        ...state,
        prefetchedGames: newPrefetchedGames,
      };
    }
    case "CLEAR_PREFETCHED_GAME": {
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
interface GameContextType
  extends Omit<GameState, "optimisticUpdates" | "prefetchedGames"> {
  fetchGames: () => Promise<void>;
  createGame: (gameData: Omit<Game, "id" | "status">) => Promise<void>;
  updateGame: (gameId: string, gameData: Partial<Game>) => Promise<void>;
  deleteGame: (gameId: string) => Promise<void>;
  joinGame: (gameId: string, user: User) => Promise<void>;
  leaveGame: (gameId: string, user: User) => Promise<void>;
  prefetchGame: (gameId: string) => Promise<void>;
  getGame: (gameId: string) => Game | undefined;
}

// Create context
const GameContext = createContext<GameContextType | undefined>(undefined);

// Provider component
export const GameProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  // Handle error and set error state
  const handleError = async (error: any) => {
    const message = error?.message || "An unexpected error occurred";
    dispatch({ type: "SET_ERROR", payload: message });
  };

  // Get a game by id, considering optimistic and prefetched updates
  const getGame = useCallback(
    (gameId: string): Game | undefined => {
      const optimisticGame = state.optimisticUpdates.get(gameId);
      if (optimisticGame) return optimisticGame;
      const prefetchedGame = state.prefetchedGames.get(gameId);
      if (prefetchedGame) return prefetchedGame;
      return state.games.find((game) => game.id === gameId);
    },
    [state.games, state.optimisticUpdates, state.prefetchedGames]
  );

  // Prefetch a game by id
  const prefetchGame = useCallback(async (gameId: string) => {
    try {
      const { data, error } = await listGames();
      if (error) throw error;
      const found = data?.find((g: Game) => g.id === gameId);
      if (found) {
        dispatch({
          type: "SET_PREFETCHED_GAME",
          payload: { id: gameId, game: found },
        });
      }
    } catch (error) {
      console.error("Error prefetching game:", error);
    }
  }, []);

  // Fetch games for the next 7 days
  const fetchGames = useCallback(async () => {
    dispatch({ type: "SET_LOADING", payload: true });
    dispatch({ type: "SET_ERROR", payload: null });
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const endDate = new Date(today);
      endDate.setDate(today.getDate() + 7);
      const startDateStr = today.toISOString().split("T")[0];
      const endDateStr = endDate.toISOString().split("T")[0];
      const { data, error } = await listGames({
        startDate: startDateStr,
        endDate: endDateStr,
      });
      if (error) throw error;
      dispatch({ type: "SET_GAMES", payload: data || [] });
    } catch (error) {
      await handleError(error);
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, []);

  // Create a new game
  const createGameHandler = useCallback(
    async (gameData: Omit<Game, "id" | "status">) => {
      dispatch({ type: "SET_LOADING", payload: true });
      dispatch({ type: "SET_ERROR", payload: null });
      try {
        const cleanGameData: Omit<Game, "id" | "created_at" | "updated_at"> = {
          ...gameData,
          status: "upcoming",
        };
        const { data, error } = await createGame(cleanGameData);
        if (error || !data || !data[0]) {
          throw error || new Error("No data returned");
        }
        dispatch({ type: "ADD_GAME", payload: data[0] });
        return data[0];
      } catch (error) {
        await handleError(error);
        throw error;
      } finally {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    },
    []
  );

  // Update a game by id
  const updateGameHandler = useCallback(
    async (gameId: string, gameData: Partial<Game>) => {
      const currentGame = getGame(gameId);
      if (!currentGame) throw new Error("Game not found");
      const optimisticGame = { ...currentGame, ...gameData };
      dispatch({
        type: "SET_OPTIMISTIC_UPDATE",
        payload: { id: gameId, game: optimisticGame },
      });
      try {
        const { data, error } = await updateGame(gameId, gameData);
        if (error || !data || !data[0])
          throw error || new Error("No data returned");
        dispatch({ type: "UPDATE_GAME", payload: data[0] });
      } catch (error) {
        dispatch({ type: "CLEAR_OPTIMISTIC_UPDATE", payload: gameId });
        await handleError(error);
        throw error;
      }
    },
    [getGame]
  );

  // Delete a game by id
  const deleteGameHandler = useCallback(
    async (gameId: string) => {
      const deletedGame = getGame(gameId);
      if (deletedGame) {
        dispatch({
          type: "SET_OPTIMISTIC_UPDATE",
          payload: {
            id: gameId,
            game: { ...deletedGame, status: "cancelled" },
          },
        });
      }
      try {
        const { error } = await deleteGame(gameId);
        if (error) throw error;
        dispatch({ type: "DELETE_GAME", payload: gameId });
      } catch (error) {
        dispatch({ type: "CLEAR_OPTIMISTIC_UPDATE", payload: gameId });
        await handleError(error);
        throw error;
      }
    },
    [getGame]
  );

  // Join a game with skill level and max players restriction
  const joinGame = useCallback(
    async (gameId: string, user: User) => {
      const currentGame = getGame(gameId);
      if (!currentGame) throw new Error("Game not found");
      // Check if user is already in players
      if (currentGame.players.some((p) => p.id === user.id)) {
        throw new Error("User already joined this game");
      }
      // Check max players
      if (currentGame.registered_count >= currentGame.max_players) {
        throw new Error("Game is full");
      }
      // Check skill level
      if (user.skill_level !== currentGame.skill_level) {
        throw new Error("Skill level does not match");
      }
      const updatedPlayers = [...currentGame.players, user];
      const optimisticGame = {
        ...currentGame,
        players: updatedPlayers,
        registered_count: currentGame.registered_count + 1,
      };
      dispatch({
        type: "SET_OPTIMISTIC_UPDATE",
        payload: { id: gameId, game: optimisticGame },
      });
      try {
        const { data, error } = await updateGame(gameId, {
          players: updatedPlayers,
          registered_count: optimisticGame.registered_count,
        });
        if (error || !data || !data[0])
          throw error || new Error("No data returned");
        dispatch({ type: "UPDATE_GAME", payload: data[0] });
      } catch (error) {
        dispatch({ type: "CLEAR_OPTIMISTIC_UPDATE", payload: gameId });
        await handleError(error);
        throw error;
      }
    },
    [getGame]
  );

  // Leave a game (remove user from players and decrement registered_count)
  const leaveGame = useCallback(
    async (gameId: string, user: User) => {
      const currentGame = getGame(gameId);
      if (!currentGame) throw new Error("Game not found");
      // Remove user from players
      const updatedPlayers = currentGame.players.filter(
        (p) => p.id !== user.id
      );
      if (updatedPlayers.length === currentGame.players.length) {
        throw new Error("User is not part of this game");
      }
      const optimisticGame = {
        ...currentGame,
        players: updatedPlayers,
        registered_count: Math.max(currentGame.registered_count - 1, 0),
      };
      dispatch({
        type: "SET_OPTIMISTIC_UPDATE",
        payload: { id: gameId, game: optimisticGame },
      });
      try {
        const { data, error } = await updateGame(gameId, {
          players: updatedPlayers,
          registered_count: optimisticGame.registered_count,
        });
        if (error || !data || !data[0])
          throw error || new Error("No data returned");
        dispatch({ type: "UPDATE_GAME", payload: data[0] });
      } catch (error) {
        dispatch({ type: "CLEAR_OPTIMISTIC_UPDATE", payload: gameId });
        await handleError(error);
        throw error;
      }
    },
    [getGame]
  );

  const value = {
    games: state.games,
    loading: state.loading,
    error: state.error,
    fetchGames,
    createGame: createGameHandler,
    updateGame: updateGameHandler,
    deleteGame: deleteGameHandler,
    joinGame,
    leaveGame,
    prefetchGame,
    getGame,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

// Hook for using the context
export function useGames() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error("useGames must be used within a GameProvider");
  }
  return context;
}
