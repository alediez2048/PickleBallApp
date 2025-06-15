import { supabase } from '@/libs/supabase'

// Create a new booked game
export const createBookedGame = async (bookedGameData: any) => {
  // bookedGameData should match the booked_games table structure
  return await supabase.from('booked_games').insert([bookedGameData]);
};

// List all booked games
export const listBookedGames = async () => {
  return await supabase.from('booked_games')
     .select(`
      *,
      location:location_id(*),
      game:game_id(*)
    `)
  .order('date', { ascending: true });
};

// Update a booked game by id
export const updateBookedGame = async (bookedGameId: string, updates: Record<string, any>) => {
  return await supabase.from('booked_games').update(updates).eq('id', bookedGameId);
};

// Delete a booked game by id
export const deleteBookedGame = async (bookedGameId: string) => {
  return await supabase.from('booked_games').delete().eq('id', bookedGameId);
};
