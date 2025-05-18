// Context for Fixed Games CRUD operations
import React, { createContext, useContext, useState, useCallback } from "react";
import {
  getFixedGames,
  getFixedGame,
  createFixedGame,
  updateFixedGame,
  deleteFixedGame,
} from "@/services/fixedGamesService";
import { FixedGame, FixedGameInput } from "@/types/fixedGames";

interface FixedGamesContextProps {
  fixedGames: FixedGame[];
  loading: boolean;
  fetchFixedGames: () => Promise<void>;
  getFixedGame: (id: string) => Promise<FixedGame | null>;
  createFixedGame: (input: FixedGameInput) => Promise<FixedGame | null>;
  updateFixedGame: (
    id: string,
    input: Partial<FixedGameInput>
  ) => Promise<boolean>;
  deleteFixedGame: (id: string) => Promise<boolean>;
}

const FixedGamesContext = createContext<FixedGamesContextProps | undefined>(
  undefined
);

export const FixedGamesProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [fixedGames, setFixedGames] = useState<FixedGame[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchFixedGames = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getFixedGames();
      setFixedGames(data);
    } finally {
      setLoading(false);
    }
  }, []);

  const getFixedGameById = async (id: string) => {
    return await getFixedGame(id);
  };

  const create = async (input: FixedGameInput) => {
    setLoading(true);
    try {
      const created = await createFixedGame(input);
      if (created) await fetchFixedGames();
      return created;
    } finally {
      setLoading(false);
    }
  };

  const update = async (id: string, input: Partial<FixedGameInput>) => {
    setLoading(true);
    try {
      const ok = await updateFixedGame(id, input);
      if (ok) await fetchFixedGames();
      return ok;
    } finally {
      setLoading(false);
    }
  };

  const remove = async (id: string) => {
    setLoading(true);
    try {
      const ok = await deleteFixedGame(id);
      if (ok) await fetchFixedGames();
      return ok;
    } finally {
      setLoading(false);
    }
  };

  return (
    <FixedGamesContext.Provider
      value={{
        fixedGames,
        loading,
        fetchFixedGames,
        getFixedGame: getFixedGameById,
        createFixedGame: create,
        updateFixedGame: update,
        deleteFixedGame: remove,
      }}
    >
      {children}
    </FixedGamesContext.Provider>
  );
};

export function useFixedGames() {
  const ctx = useContext(FixedGamesContext);
  if (!ctx)
    throw new Error("useFixedGames must be used within FixedGamesProvider");
  return ctx;
}
