import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  createBookedGame as createBookedGameService,
  listBookedGames as listBookedGamesService,
  updateBookedGame as updateBookedGameService,
} from "@services/bookedGamesService";
import { BookedGame } from "@/types/bookedGames";

interface BookedGamesContextType {
  bookedGames: BookedGame[];
  isLoading: boolean;
  error: Error | null;
  refreshBookedGames: () => Promise<void>;
  addBookedGame: (game: Omit<BookedGame, "id">) => Promise<BookedGame | null>;
  cancelBooking: (gameId: string) => Promise<void>;
  clearAllGames: () => Promise<void>;
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
      const { data, error: createError } = await createBookedGameService({
        ...game,
      });
      console.log("Adding booked game:", game);
      console.log("createError booked game:", createError);
      if (createError) throw createError;
      if (data && data[0]) {
        setBookedGames((prev) => [data[0], ...prev]);
        return data[0];
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

export function useUpcomingBookedGames() {
  const { bookedGames } = useBookedGames();
  return bookedGames
    .filter((game) => game.status === "upcoming")
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}
