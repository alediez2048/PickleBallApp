import { supabase } from '@/libs/supabase'

export const signUpWithEmail = async (email: string, password: string) => {
  return await supabase.auth.signUp({
    email,
    password,
  })
}

export const signInWithEmail = async (email: string, password: string) => {
  return await supabase.auth.signInWithPassword({
    email,
    password,
  })
}

export const getSession = async () => {
  return await supabase.auth.getSession()
}

export const logout = async () => {
  return await supabase.auth.signOut()
}