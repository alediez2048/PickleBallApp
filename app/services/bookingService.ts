import { supabase } from '../config/supabase';

export type Booking = {
  id: string;
  court_id: string;
  user_id: string;
  start_time: string;
  end_time: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  created_at: string;
  updated_at: string;
};

// Get all bookings for a user
export async function getUserBookings(userId: string) {
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      courts(name, location),
      games(id, game_type, max_players, current_players, status)
    `)
    .eq('user_id', userId)
    .order('start_time', { ascending: false });
  
  return { bookings: data, error };
}

// Get booking by ID with related data
export async function getBookingById(id: string) {
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      courts(name, location),
      games(id, game_type, max_players, current_players, status)
    `)
    .eq('id', id)
    .single();
  
  return { booking: data, error };
}

// Create a new booking
export async function createBooking(booking: Omit<Booking, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('bookings')
    .insert([booking])
    .select();
  
  return { booking: data?.[0] as Booking, error };
}

// Update a booking
export async function updateBooking(id: string, updates: Partial<Omit<Booking, 'id' | 'created_at' | 'updated_at'>>) {
  const { data, error } = await supabase
    .from('bookings')
    .update(updates)
    .eq('id', id)
    .select();
  
  return { booking: data?.[0] as Booking, error };
}

// Cancel a booking
export async function cancelBooking(id: string) {
  const { data, error } = await supabase
    .from('bookings')
    .update({ status: 'cancelled' })
    .eq('id', id)
    .select();
  
  return { booking: data?.[0] as Booking, error };
}

// Delete a booking
export async function deleteBooking(id: string) {
  const { error } = await supabase
    .from('bookings')
    .delete()
    .eq('id', id);
  
  return { error };
}

// Check if a court is available for a specific time slot
export async function checkCourtAvailability(courtId: string, startTime: string, endTime: string, excludeBookingId?: string) {
  let query = supabase
    .from('bookings')
    .select('id')
    .eq('court_id', courtId)
    .in('status', ['pending', 'confirmed'])
    .or(`start_time.lte.${endTime},end_time.gte.${startTime}`);
  
  // Exclude the current booking if we're checking for an update
  if (excludeBookingId) {
    query = query.neq('id', excludeBookingId);
  }
  
  const { data, error } = await query;
  
  if (error) {
    return { available: false, error };
  }
  
  return { available: data.length === 0, error: null };
} 