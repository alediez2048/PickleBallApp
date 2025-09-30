import { supabase } from "@/libs/supabase";

export const createGame = async (gameData: any) => {
  const { data, error } = await supabase
    .from("games")
    .insert([gameData])
    .select();

  if (error) {
    console.error("Error creating game:", error);
    return null;
  }

  return data?.[0];
};

// List all games with optional date range
export const listGames = async (dateRange?: {
  startDate: string;
  endDate: string;
}) => {
  let query = supabase
    .from("games")
    .select(`*, location:location_id(*)`)
    .order("start_time", { ascending: true });
  if (dateRange) {
    query = query
      .gte("start_time", dateRange.startDate)
      .lte("start_time", dateRange.endDate);
  }
  return await query;
};

// Update a game by id
export const updateGame = async (
  gameId: string,
  updates: Record<string, any>
) => {
  return await supabase.from("games").update(updates).eq("id", gameId);
};

// Delete a game by id
export const deleteGame = async (gameId: string) => {
  return await supabase.from("games").delete().eq("id", gameId);
};

// Get a single game by id
export const getGame = async (gameId: string) => {
  const { data, error } = await supabase
    .from("games")
    .select("*, location:location_id(*)")
    .eq("id", gameId);

  if (error) {
    console.error("Error fetching game:", error);
    return null;
  }

  return data?.[0] || null;
};
