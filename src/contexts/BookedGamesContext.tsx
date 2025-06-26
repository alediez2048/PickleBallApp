import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  createBookedGame as createBookedGameService,
  listBookedGames as listBookedGamesService,
  updateBookedGame as updateBookedGameService,
} from "@services/bookedGamesService";
import { getGame, updateGame } from "@services/gamesService";

import { BookedGame } from "@/types/bookedGames";
import { User } from "@/types/games";

interface BookedGamesContextType {
  bookedGames: BookedGame[];
  isLoading: boolean;
  error: Error | null;
  refreshBookedGames: () => Promise<void>;
  addBookedGame: (game: Omit<BookedGame, "id">) => Promise<BookedGame | null>;
  cancelBooking: (gameId: string) => Promise<void>;
  clearAllGames: () => Promise<void>;
  listBookedGamesForUser: () => Promise<BookedGame[]>;
}

const BookedGamesContext = createContext<BookedGamesContextType | undefined>(
  undefined
);

export const BookedGamesProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [bookedGames, setBookedGames] = useState<BookedGame[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  const refreshBookedGames = async () => {
    if (!user?.email) return;
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await listBookedGamesService();
      if (fetchError) throw fetchError;
      setBookedGames(data || []);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Failed to fetch booked games")
      );
    } finally {
      setIsLoading(false);
    }
  };

  const addBookedGame = async (game: Omit<BookedGame, "id">) => {
    if (!user?.email) throw new Error("User not authenticated");
    try {
      // Fetch the current game details first
      const currentGameData = await getGame(game.game_id);
      if (!currentGameData) throw new Error("Game not found");

      // Prepare the new player object using User type
      const newPlayer: User = {
        id: user.id,
        email: user.email,
        name: user.display_name || user.name || "",
        skill_level: currentGameData.skill_level,
        phone_number: user.phone_number || "",
      };

      // Prepare the updated players array
      const updatedPlayers: User[] = [
        ...(currentGameData.players || []),
        newPlayer,
      ];

      // Register the booked game
      const bookedGame = await createBookedGameService({ ...game });
      if (bookedGame) {
        await updateGame(bookedGame.game_id, {
          registered_count: updatedPlayers.length,
          players: updatedPlayers,
        });

        setBookedGames((prev) => [bookedGame, ...prev]);
        return bookedGame;
      }
      return null;
    } catch (err) {
      console.error("Error adding booked game:", err);
      throw err instanceof Error ? err : new Error("Failed to book game");
    }
  };

  const cancelBooking = async (gameId: string) => {
    if (!user?.email) throw new Error("User not authenticated");
    try {
      await updateBookedGameService(gameId, { status: "cancelled" });
      setBookedGames((prev) =>
        prev.map((game) =>
          game.id === gameId ? { ...game, status: "cancelled" as const } : game
        )
      );
    } catch (err) {
      throw err instanceof Error ? err : new Error("Failed to cancel booking");
    }
  };

  const clearAllGames = async () => {
    if (!user?.email) return;
    setIsLoading(true);
    try {
      setBookedGames([]);
    } catch (err) {
      throw err instanceof Error ? err : new Error("Failed to clear games");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Fetch upcoming booked games for the current user in the next 7 days
   */
  const listBookedGamesForUser = async () => {
    if (!user?.id) return [];
    const today = new Date();
    const startDate = today.toISOString().split("T")[0];
    const endDateObj = new Date(today);
    endDateObj.setDate(today.getDate() + 7);
    const endDate = endDateObj.toISOString().split("T")[0];
    const { data, error } = await listBookedGamesService({
      userId: user.id,
      dateRange: { startDate, endDate },
      status: "upcoming",
    });
    if (error) {
      console.error("Error fetching upcoming booked games for user:", error);
      return [];
    }
    return data || [];
  };

  useEffect(() => {
    refreshBookedGames();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.email]);

  return (
    <BookedGamesContext.Provider
      value={{
        bookedGames,
        isLoading,
        error,
        refreshBookedGames,
        addBookedGame,
        cancelBooking,
        clearAllGames,
        listBookedGamesForUser,
      }}
    >
      {children}
    </BookedGamesContext.Provider>
  );
};

export function useBookedGames() {
  const context = useContext(BookedGamesContext);
  if (context === undefined) {
    throw new Error("useBookedGames must be used within a BookedGamesProvider");
  }
  return context;
}
