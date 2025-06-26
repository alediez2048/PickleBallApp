import React, { createContext, useContext, useState } from "react";
import { Game, User } from "@/types/games";
import {
  createGame as createGameService,
  listGames as listGamesService,
  updateGame as updateGameService,
  deleteGame as deleteGameService,
  getGame as getGameService,
} from "@/services/gamesService";

interface GameContextType {
  games: Game[];
  loading: boolean;
  error: string | null;
  fetchGames: () => Promise<void>;
  createGame: (
    gameData: Omit<Game, "id" | "created_at" | "updated_at">
  ) => Promise<Game>;
  updateGame: (gameId: string, gameData: Partial<Game>) => Promise<void>;
  deleteGame: (gameId: string) => Promise<void>;
  joinGame: (gameId: string, user: User) => Promise<void>;
  leaveGame: (gameId: string, user: User) => Promise<void>;
  getGame: (gameId: string) => Game | undefined;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGames = async () => {
    setLoading(true);
    setError(null);
    try {
      // Calculate today and 7 days ahead in ISO format (timestamp)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const startDate = today.toISOString();
      const endDateObj = new Date(today);
      endDateObj.setDate(today.getDate() + 6); // 7 days window (today + 6)
      endDateObj.setHours(23, 59, 59, 999);
      const endDate = endDateObj.toISOString();
      const { data, error } = await listGamesService({ startDate, endDate });
      if (error) throw error;
      setGames(data || []);
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const createGame = async (
    gameData: Omit<Game, "id" | "created_at" | "updated_at">
  ): Promise<Game> => {
    setLoading(true);
    setError(null);
    try {
      const newGame = await createGameService(gameData);
      if (!newGame) throw new Error("Failed to create game");
      setGames((prev) => [...prev, newGame]);
      return newGame;
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateGame = async (gameId: string, gameData: Partial<Game>) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await updateGameService(gameId, gameData);
      if (error || !data || !data[0])
        throw error || new Error("No data returned");
      setGames((prev) => prev.map((g) => (g.id === gameId ? data[0] : g)));
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteGame = async (gameId: string) => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await deleteGameService(gameId);
      if (error) throw error;
      setGames((prev) => prev.filter((g) => g.id !== gameId));
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const joinGame = async (gameId: string, user: User) => {
    const currentGame = games.find((g) => g.id === gameId);
    if (!currentGame) throw new Error("Game not found");
    if (currentGame.players.some((p) => p.id === user.id)) {
      throw new Error("User already joined this game");
    }
    if (currentGame.registered_count >= currentGame.max_players) {
      throw new Error("Game is full");
    }
    if (user.skill_level !== currentGame.skill_level) {
      throw new Error("Skill level does not match");
    }
    const updatedPlayers = [...currentGame.players, user];
    const updatedGame = {
      ...currentGame,
      players: updatedPlayers,
      registered_count: currentGame.registered_count + 1,
    };
    await updateGame(gameId, {
      players: updatedPlayers,
      registered_count: updatedGame.registered_count,
    });
  };

  const leaveGame = async (gameId: string, user: User) => {
    const currentGame = games.find((g) => g.id === gameId);
    if (!currentGame) throw new Error("Game not found");
    const updatedPlayers = currentGame.players.filter((p) => p.id !== user.id);
    if (updatedPlayers.length === currentGame.players.length) {
      throw new Error("User is not part of this game");
    }
    const updatedGame = {
      ...currentGame,
      players: updatedPlayers,
      registered_count: Math.max(currentGame.registered_count - 1, 0),
    };
    await updateGame(gameId, {
      players: updatedPlayers,
      registered_count: updatedGame.registered_count,
    });
  };

  const getGame = (gameId: string) => {
    const found = games.find((g) => g.id === gameId);
    if (found) return found;
    // If not found, fetch from service and update state
    getGameService(gameId).then((game) => {
      if (game) {
        setGames((prev) => {
          if (prev.some((g) => g.id === game.id)) return prev;
          return [...prev, game];
        });
      }
    });
    return undefined;
  };

  return (
    <GameContext.Provider
      value={{
        games,
        loading,
        error,
        fetchGames,
        createGame,
        updateGame,
        deleteGame,
        joinGame,
        leaveGame,
        getGame,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGames = () => {
  const context = useContext(GameContext);
  if (!context) throw new Error("useGames must be used within GameProvider");
  return context;
};
