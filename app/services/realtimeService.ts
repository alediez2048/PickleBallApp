import { supabase } from '../config/supabase';
import { useEffect, useState } from 'react';
import { RealtimeChannel } from '@supabase/supabase-js';

// Hook for real-time game updates
export function useGameUpdates(gameId: string) {
  const [game, setGame] = useState<any>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    // Initial fetch
    fetchGameData();

    // Set up real-time subscription
    const gameSubscription = supabase
      .channel(`game_${gameId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'games',
        filter: `id=eq.${gameId}`,
      }, (payload) => {
        setGame(payload.new);
      })
      .subscribe();

    const participantsSubscription = supabase
      .channel(`participants_${gameId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'game_participants',
        filter: `game_id=eq.${gameId}`,
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          fetchParticipants();
        } else if (payload.eventType === 'DELETE') {
          setParticipants(prev => prev.filter(p => p.id !== payload.old.id));
        } else if (payload.eventType === 'UPDATE') {
          setParticipants(prev => 
            prev.map(p => p.id === payload.new.id ? { ...p, ...payload.new } : p)
          );
        }
      })
      .subscribe();

    // Cleanup
    return () => {
      supabase.removeChannel(gameSubscription);
      supabase.removeChannel(participantsSubscription);
    };
  }, [gameId]);

  async function fetchGameData() {
    try {
      setLoading(true);
      
      // Fetch game details
      const { data: gameData, error: gameError } = await supabase
        .from('games')
        .select(`
          *,
          bookings(
            start_time,
            end_time,
            courts(name, location)
          )
        `)
        .eq('id', gameId)
        .single();
      
      if (gameError) throw gameError;
      setGame(gameData);
      
      await fetchParticipants();
      
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }
  
  async function fetchParticipants() {
    try {
      // Fetch participants
      const { data: participantsData, error: participantsError } = await supabase
        .from('game_participants')
        .select(`
          *,
          profiles(id, username, avatar_url, skill_level)
        `)
        .eq('game_id', gameId);
      
      if (participantsError) throw participantsError;
      setParticipants(participantsData);
    } catch (err) {
      setError(err);
    }
  }

  return { 
    game, 
    participants, 
    loading, 
    error, 
    refetch: fetchGameData,
    refetchParticipants: fetchParticipants
  };
}

// Hook for real-time booking updates
export function useBookingUpdates(bookingId: string) {
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    // Initial fetch
    fetchBookingData();

    // Set up real-time subscription
    const bookingSubscription = supabase
      .channel(`booking_${bookingId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'bookings',
        filter: `id=eq.${bookingId}`,
      }, (payload) => {
        setBooking((prev: any) => ({ ...prev, ...payload.new }));
      })
      .subscribe();

    // Cleanup
    return () => {
      supabase.removeChannel(bookingSubscription);
    };
  }, [bookingId]);

  async function fetchBookingData() {
    try {
      setLoading(true);
      
      // Fetch booking details
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          courts(name, location),
          games(id, game_type, max_players, current_players, status)
        `)
        .eq('id', bookingId)
        .single();
      
      if (error) throw error;
      setBooking(data);
      
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }

  return { booking, loading, error, refetch: fetchBookingData };
}

// Function to create a custom channel subscription
export function createSubscription(
  channelName: string,
  table: string,
  filter: string,
  callback: (payload: any) => void
): { channel: RealtimeChannel; unsubscribe: () => void } {
  const channel = supabase
    .channel(channelName)
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table,
      filter,
    }, callback)
    .subscribe();

  return {
    channel,
    unsubscribe: () => supabase.removeChannel(channel),
  };
} 