import { useQuery, useMutation, useQueryClient, QueryKey } from '@tanstack/react-query';
import { supabase } from '../config/supabase';
import * as courtService from '../services/courtService';
import * as bookingService from '../services/bookingService';
import * as gameService from '../services/gameService';

// Generic hook for Supabase queries
export function useSupabaseQuery<T>(
  key: QueryKey, 
  queryFn: () => Promise<{ [key: string]: T, error: any }>,
  options = {}
) {
  return useQuery({
    queryKey: key,
    queryFn: async () => {
      const result = await queryFn();
      if (result.error) {
        throw result.error;
      }
      // Return the first non-error property
      const dataKey = Object.keys(result).find(key => key !== 'error');
      return dataKey ? result[dataKey] as T : null;
    },
    ...options,
  });
}

// Hook for fetching courts
export function useCourts() {
  return useSupabaseQuery(['courts'], async () => {
    return await courtService.getCourts();
  });
}

// Hook for fetching a single court
export function useCourt(id: string) {
  return useSupabaseQuery(['court', id], async () => {
    return await courtService.getCourtById(id);
  });
}

// Hook for fetching available courts
export function useAvailableCourts(startTime: string, endTime: string) {
  return useSupabaseQuery(['availableCourts', startTime, endTime], async () => {
    return await courtService.getAvailableCourts(startTime, endTime);
  });
}

// Hook for fetching user bookings
export function useUserBookings(userId: string) {
  return useSupabaseQuery(['bookings', userId], async () => {
    return await bookingService.getUserBookings(userId);
  });
}

// Hook for fetching a single booking
export function useBooking(id: string) {
  return useSupabaseQuery(['booking', id], async () => {
    return await bookingService.getBookingById(id);
  });
}

// Hook for fetching games
export function useGames(filters?: Parameters<typeof gameService.getGames>[0]) {
  return useSupabaseQuery(['games', filters], async () => {
    return await gameService.getGames(filters);
  });
}

// Hook for fetching a single game
export function useGame(id: string) {
  return useSupabaseQuery(['game', id], async () => {
    return await gameService.getGameById(id);
  });
}

// Mutation hook for creating a booking
export function useCreateBooking() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (bookingData: Parameters<typeof bookingService.createBooking>[0]) => {
      const { booking, error } = await bookingService.createBooking(bookingData);
      if (error) throw error;
      return booking;
    },
    onSuccess: (data) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['availableCourts'] });
    },
  });
}

// Mutation hook for updating a booking
export function useUpdateBooking() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { 
      id: string; 
      updates: Parameters<typeof bookingService.updateBooking>[1];
    }) => {
      const { booking, error } = await bookingService.updateBooking(id, updates);
      if (error) throw error;
      return booking;
    },
    onSuccess: (data, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['booking', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}

// Mutation hook for canceling a booking
export function useCancelBooking() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { booking, error } = await bookingService.cancelBooking(id);
      if (error) throw error;
      return booking;
    },
    onSuccess: (data, id) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['booking', id] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}

// Mutation hook for creating a game
export function useCreateGame() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (gameData: Parameters<typeof gameService.createGame>[0]) => {
      const { game, error } = await gameService.createGame(gameData);
      if (error) throw error;
      return game;
    },
    onSuccess: (data) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['games'] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}

// Mutation hook for joining a game
export function useJoinGame() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      gameId, 
      userId, 
      team 
    }: { 
      gameId: string; 
      userId: string; 
      team?: 'A' | 'B';
    }) => {
      const { success, error, participant } = await gameService.joinGame(gameId, userId, team);
      if (!success) throw new Error(error);
      return participant;
    },
    onSuccess: (data, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['game', variables.gameId] });
      queryClient.invalidateQueries({ queryKey: ['games'] });
    },
  });
}

// Mutation hook for leaving a game
export function useLeaveGame() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ gameId, userId }: { gameId: string; userId: string }) => {
      const { success, error } = await gameService.leaveGame(gameId, userId);
      if (!success) throw new Error(error);
      return { gameId, userId };
    },
    onSuccess: (data) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['game', data.gameId] });
      queryClient.invalidateQueries({ queryKey: ['games'] });
    },
  });
}

// Mutation hook for creating a court
export function useCreateCourt() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (courtData: Parameters<typeof courtService.createCourt>[0]) => {
      const { court, error } = await courtService.createCourt(courtData);
      if (error) throw error;
      return court;
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['courts'] });
    },
  });
} 