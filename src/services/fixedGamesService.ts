// Service for Fixed Games using Supabase
import { supabase } from "@/libs/supabase";
import { FixedGame, FixedGameInput } from "@/types/fixedGames";

const TABLE_NAME = "fixed_games";

export async function getFixedGames(): Promise<FixedGame[]> {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select(`*, location:location_id(*)`); // Join locations table
  if (error) throw error;
  return data as FixedGame[];
}

export async function getFixedGame(id: string): Promise<FixedGame | null> {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select(`*, location:location_id(*)`)
    .eq("id", id)
    .single();
  if (error) return null;
  return data as FixedGame;
}

export async function createFixedGame(
  input: FixedGameInput
): Promise<FixedGame | null> {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .insert([input])
    .select()
    .single();
  if (error) return null;
  return data as FixedGame;
}

export async function updateFixedGame(
  id: string,
  input: Partial<FixedGameInput>
): Promise<FixedGame | null> {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .update(input)
    .eq("id", id)
    .select()
    .single();
  if (error) {
    console.error("Error updating fixed game:", error);
    return null;
  }
  return data as FixedGame;
}

export async function deleteFixedGame(id: string): Promise<boolean> {
  const { error } = await supabase.from(TABLE_NAME).delete().eq("id", id);
  return !error;
}
