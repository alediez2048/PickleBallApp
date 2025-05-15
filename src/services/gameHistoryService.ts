import { supabase } from '@/libs/supabase'

// Create a new game history record
export const createGameHistory = async (gameHistoryData: any) => {
  // gameHistoryData should match the game_history table structure
  return await supabase.from('game_history').insert([gameHistoryData]);
};

// List all game history records
export const listGameHistory = async () => {
  return await supabase.from('game_history').select('*').order('date', { ascending: false });
};

// Update a game history record by id
export const updateGameHistory = async (gameHistoryId: string, updates: Record<string, any>) => {
  return await supabase.from('game_history').update(updates).eq('id', gameHistoryId);
};

// Delete a game history record by id
export const deleteGameHistory = async (gameHistoryId: string) => {
  return await supabase.from('game_history').delete().eq('id', gameHistoryId);
};
