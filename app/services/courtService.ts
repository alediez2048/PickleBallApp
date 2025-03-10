import { supabase } from '../config/supabase';

export type Court = {
  id: string;
  name: string;
  location: string;
  indoor: boolean;
  available: boolean;
  created_at: string;
  updated_at: string;
};

// Get all courts
export async function getCourts() {
  const { data, error } = await supabase
    .from('courts')
    .select('*')
    .order('name');
  
  return { courts: data as Court[], error };
}

// Get court by ID
export async function getCourtById(id: string) {
  const { data, error } = await supabase
    .from('courts')
    .select('*')
    .eq('id', id)
    .single();
  
  return { court: data as Court, error };
}

// Get available courts for a specific time slot
export async function getAvailableCourts(startTime: string, endTime: string) {
  const { data, error } = await supabase
    .from('courts')
    .select('*')
    .eq('available', true)
    .order('name');
  
  if (error) {
    return { courts: [], error };
  }
  
  // Check for overlapping bookings
  const { data: bookings, error: bookingsError } = await supabase
    .from('bookings')
    .select('court_id')
    .or(`start_time.lte.${endTime},end_time.gte.${startTime}`)
    .in('status', ['pending', 'confirmed']);
  
  if (bookingsError) {
    return { courts: data as Court[], error: bookingsError };
  }
  
  // Filter out courts with overlapping bookings
  const bookedCourtIds = bookings.map(booking => booking.court_id);
  const availableCourts = data.filter(court => !bookedCourtIds.includes(court.id));
  
  return { courts: availableCourts as Court[], error: null };
}

// Create a new court (admin only)
export async function createCourt(court: Omit<Court, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('courts')
    .insert([court])
    .select();
  
  return { court: data?.[0] as Court, error };
}

// Update a court (admin only)
export async function updateCourt(id: string, updates: Partial<Omit<Court, 'id' | 'created_at' | 'updated_at'>>) {
  const { data, error } = await supabase
    .from('courts')
    .update(updates)
    .eq('id', id)
    .select();
  
  return { court: data?.[0] as Court, error };
}

// Delete a court (admin only)
export async function deleteCourt(id: string) {
  const { error } = await supabase
    .from('courts')
    .delete()
    .eq('id', id);
  
  return { error };
} 