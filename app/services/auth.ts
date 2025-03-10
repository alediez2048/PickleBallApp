import { supabase } from '../config/supabase';

// Sign up with email and password
export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  return { data, error };
}

// Sign in with email and password
export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
}

// Sign out
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

// Get current session
export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  return { session: data.session, error };
}

// Get current user
export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  return { user, error };
}

// Reset password
export async function resetPassword(email: string) {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: 'pickleballapp://reset-password',
  });
  return { data, error };
}

// Update user
export async function updateUser(updates: { email?: string; password?: string; data?: object }) {
  const { data, error } = await supabase.auth.updateUser(updates);
  return { data, error };
}

// Create or update user profile
export async function upsertProfile(profile: {
  id: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  skill_level?: 'beginner' | 'intermediate' | 'advanced' | 'pro';
}) {
  const { data, error } = await supabase
    .from('profiles')
    .upsert(profile)
    .select();
  
  return { profile: data?.[0], error };
}

// Get user profile
export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  return { profile: data, error };
} 