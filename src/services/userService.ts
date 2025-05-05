import { supabase } from '@/libs/supabase'

export const createUserProfile = async (userId: string, extraData: any) => {
  return await supabase.from('users').insert([
    {
      id: userId,
      ...extraData, // name, phone, etc.
    },
  ])
}

export const updateUserProfile = async (userId: string, updates: Record<string, any>) => {
  return await supabase
    .from('users') // Asegúrate de que esta sea la tabla correcta
    .update(updates)
    .eq('id', userId)
}

export const getUserProfile = async (userId: string) => {
  return await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()
}