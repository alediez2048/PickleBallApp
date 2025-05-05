import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { mockApi } from "@/services/mockApi";
import { useAuth } from "@/contexts/AuthContext";

export interface BookedGame {
  id: string;
  gameId: string;
  date: string;
  time: string;
  courtName: string;
  location: {
    address: string;
    area: string;
    city: string;
  };
  skillRating: number;
  price: number;
  status: "upcoming" | "completed" | "cancelled";
}

interface BookedGamesContextType {
  bookedGames: BookedGame[];
  isLoading: boolean;
  error: Error | null;
  refreshBookedGames: () => Promise<void>;
  addBookedGame: (game: Omit<BookedGame, "status">) => Promise<BookedGame>;
  cancelBooking: (gameId: string) => Promise<void>;
  clearAllGames: () => Promise<void>;
}

const BookedGamesContext = createContext<BookedGamesContextType | undefined>(
  undefined
);

export function BookedGamesProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [bookedGames, setBookedGames] = useState<BookedGame[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  const refreshBookedGames = useCallback(async () => {
    if (!user?.email) return;

    setIsLoading(true);
    setError(null);
    try {
      const games = await mockApi.getBookedGames(user.email);
      setBookedGames(games);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Failed to fetch booked games")
      );
    } finally {
      setIsLoading(false);
    }
  }, [user?.email]);

  const addBookedGame = useCallback(
    async (game: Omit<BookedGame, "status">) => {
      if (!user?.email) {
        throw new Error("User not authenticated");
      }

      try {
        const bookedGame = await mockApi.bookGame(user.email, game);
        setBookedGames((prev) => [bookedGame, ...prev]);
        return bookedGame;
      } catch (err) {
        throw err instanceof Error ? err : new Error("Failed to book game");
      }
    },
    [user?.email]
  );

  const cancelBooking = useCallback(
    async (gameId: string) => {
      if (!user?.email) {
        throw new Error("User not authenticated");
      }

      try {
        await mockApi.cancelBooking(user.email, gameId);
        setBookedGames((prev) =>
          prev.map((game) =>
            game.id === gameId
              ? { ...game, status: "cancelled" as const }
              : game
          )
        );
      } catch (err) {
        throw err instanceof Error
          ? err
          : new Error("Failed to cancel booking");
      }
    },
    [user?.email]
  );

  const clearAllGames = useCallback(async () => {
    if (!user?.email) return;

    setIsLoading(true);
    try {
      await mockApi.clearBookedGames(user.email);
      setBookedGames([]);
    } catch (err) {
      throw err instanceof Error ? err : new Error("Failed to clear games");
    } finally {
      setIsLoading(false);
    }
  }, [user?.email]);

  // Load booked games when the user changes
  useEffect(() => {
    refreshBookedGames();
  }, [refreshBookedGames]);

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
}

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
