import { supabase } from '@/libs/supabase'

// Create a new location
export const createLocation = async (locationData: any) => {
  // locationData should match the locations table structure
  return await supabase.from('locations').insert([locationData]);
};

// List all locations
export const listLocations = async () => {
  return await supabase.from('locations').select('*').order('name', { ascending: true });
};

// Update a location by id
export const updateLocation = async (locationId: string, updates: Record<string, any>) => {
  return await supabase.from('locations').update(updates).eq('id', locationId);
};

// Delete a location by id
export const deleteLocation = async (locationId: string) => {
  return await supabase.from('locations').delete().eq('id', locationId);
};

// Get a single location by id
export const getLocation = async (locationId: string) => {
  return await supabase.from('locations').select('*').eq('id', locationId).single();
};
