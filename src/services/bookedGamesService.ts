import { supabase } from '@/libs/supabase';
import { BookedGame } from '@/types/bookedGames';


// Create a new booked game
export const createBookedGame = async (
  bookedGameData: any
) => {
   const { data, error } = await supabase.from('booked_games').insert([bookedGameData]).select();

  if (error) {
    console.error('Error creating game:', error);
    return null;
  }

  return data?.[0];
};

// List all booked games with optional filters
export const listBookedGames = async (options?: {
  userId?: string;
  dateRange?: { startDate: string; endDate: string };
  status?: string;
}) => {
  let query = supabase
    .from('booked_games')
    .select(`
      *,
      location:location_id(*),
      game:game_id(*)
    `)
    .order('date', { ascending: true });

  if (options?.userId) {
    query = query.eq('user_id', options.userId);
  }
  if (options?.dateRange) {
    query = query.gte('date', options.dateRange.startDate).lte('date', options.dateRange.endDate);
  }
  if (options?.status) {
    query = query.eq('status', options.status);
  }

  return await query;
};

// Update a booked game by id
export const updateBookedGame = async (bookedGameId: string, updates: Record<string, any>) => {
  return await supabase.from('booked_games').update(updates).eq('id', bookedGameId);
};

// Delete a booked game by id
export const deleteBookedGame = async (bookedGameId: string) => {
  return await supabase.from('booked_games').delete().eq('id', bookedGameId);
};
