// Service for Fixed Games using Supabase
import { supabase } from "@/libs/supabase";
import { FixedGame, FixedGameInput } from "@/types/fixedGames";

const TABLE_NAME = "fixed_games";

export async function getFixedGames(): Promise<FixedGame[]> {
  const { data, error } = await supabase.from(TABLE_NAME).select("*");
  if (error) throw error;
  return data as FixedGame[];
}

export async function getFixedGame(id: string): Promise<FixedGame | null> {
  const { data, error } = await supabase.from(TABLE_NAME).select("*").eq("id", id).single();
  if (error) return null;
  return data as FixedGame;
}

export async function createFixedGame(input: FixedGameInput): Promise<FixedGame | null> {
  const { data, error } = await supabase.from(TABLE_NAME).insert([input]).select().single();
  if (error) return null;
  return data as FixedGame;
}

export async function updateFixedGame(id: string, input: Partial<FixedGameInput>): Promise<boolean> {
  const { error } = await supabase.from(TABLE_NAME).update(input).eq("id", id);
  return !error;
}

export async function deleteFixedGame(id: string): Promise<boolean> {
  const { error } = await supabase.from(TABLE_NAME).delete().eq("id", id);
  return !error;
}
