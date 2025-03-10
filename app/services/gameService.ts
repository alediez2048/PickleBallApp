import { supabase } from '../config/supabase';

export type Game = {
  id: string;
  booking_id: string;
  game_type: 'singles' | 'doubles';
  max_players: number;
  current_players: number;
  skill_level: 'beginner' | 'intermediate' | 'advanced' | 'pro' | 'any';
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
};

export type GameParticipant = {
  id: string;
  game_id: string;
  user_id: string;
  team: 'A' | 'B' | null;
  joined_at: string;
};

// Get all games
export async function getGames(filters?: {
  status?: Game['status'];
  skill_level?: Game['skill_level'];
  game_type?: Game['game_type'];
}) {
  let query = supabase
    .from('games')
    .select(`
      *,
      bookings(
        start_time,
        end_time,
        courts(name, location)
      ),
      game_participants(
        user_id,
        team,
        profiles(username, avatar_url, skill_level)
      )
    `);
  
  // Apply filters if provided
  if (filters?.status) {
    query = query.eq('status', filters.status);
  }
  
  if (filters?.skill_level) {
    query = query.eq('skill_level', filters.skill_level);
  }
  
  if (filters?.game_type) {
    query = query.eq('game_type', filters.game_type);
  }
  
  // Only show games that are not full
  query = query.lt('current_players', 'max_players');
  
  // Order by start time
  query = query.order('created_at', { ascending: false });
  
  const { data, error } = await query;
  
  return { games: data, error };
}

// Get game by ID with related data
export async function getGameById(id: string) {
  const { data, error } = await supabase
    .from('games')
    .select(`
      *,
      bookings(
        start_time,
        end_time,
        courts(name, location)
      ),
      game_participants(
        id,
        user_id,
        team,
        joined_at,
        profiles(username, avatar_url, skill_level)
      )
    `)
    .eq('id', id)
    .single();
  
  return { game: data, error };
}

// Create a new game
export async function createGame(game: Omit<Game, 'id' | 'current_players' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('games')
    .insert([game])
    .select();
  
  return { game: data?.[0] as Game, error };
}

// Update a game
export async function updateGame(id: string, updates: Partial<Omit<Game, 'id' | 'current_players' | 'created_at' | 'updated_at'>>) {
  const { data, error } = await supabase
    .from('games')
    .update(updates)
    .eq('id', id)
    .select();
  
  return { game: data?.[0] as Game, error };
}

// Cancel a game
export async function cancelGame(id: string) {
  const { data, error } = await supabase
    .from('games')
    .update({ status: 'cancelled' })
    .eq('id', id)
    .select();
  
  return { game: data?.[0] as Game, error };
}

// Join a game
export async function joinGame(gameId: string, userId: string, team?: 'A' | 'B') {
  // First check if the game is full
  const { data: game, error: gameError } = await supabase
    .from('games')
    .select('current_players, max_players')
    .eq('id', gameId)
    .single();
  
  if (gameError) {
    return { success: false, error: gameError.message };
  }
  
  if (game.current_players >= game.max_players) {
    return { success: false, error: 'Game is already full' };
  }
  
  // Try to join the game
  const { data, error } = await supabase
    .from('game_participants')
    .insert([{ 
      game_id: gameId, 
      user_id: userId,
      team
    }])
    .select();
  
  if (error) {
    // Check if it's a unique constraint violation (user already joined)
    if (error.code === '23505') {
      return { success: false, error: 'You have already joined this game' };
    }
    return { success: false, error: error.message };
  }
  
  return { success: true, participant: data?.[0] as GameParticipant };
}

// Leave a game
export async function leaveGame(gameId: string, userId: string) {
  const { error } = await supabase
    .from('game_participants')
    .delete()
    .match({ game_id: gameId, user_id: userId });
  
  if (error) {
    return { success: false, error: error.message };
  }
  
  return { success: true };
}

// Set player team
export async function setPlayerTeam(participantId: string, team: 'A' | 'B' | null) {
  const { data, error } = await supabase
    .from('game_participants')
    .update({ team })
    .eq('id', participantId)
    .select();
  
  if (error) {
    return { success: false, error: error.message };
  }
  
  return { success: true, participant: data?.[0] as GameParticipant };
} 