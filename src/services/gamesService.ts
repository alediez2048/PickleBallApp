import { supabase } from '@/libs/supabase'

// Create a new game
export const createGame = async (gameData: any) => {
  // gameData should match the games table structure
  return await supabase.from('games').insert([gameData]);
};

// List all games with optional date range
export const listGames = async (dateRange?: { startDate: string; endDate: string }) => {
  let query = supabase.from('games').select('*').order('start_time', { ascending: true });
  if (dateRange) {
    query = query.gte('start_time', dateRange.startDate).lte('start_time', dateRange.endDate);
  }
  return await query;
};

// Update a game by id
export const updateGame = async (gameId: string, updates: Record<string, any>) => {
  return await supabase.from('games').update(updates).eq('id', gameId);
};

// Delete a game by id
export const deleteGame = async (gameId: string) => {
  return await supabase.from('games').delete().eq('id', gameId);
};