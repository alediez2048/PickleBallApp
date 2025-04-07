import { supabase } from '@/libs/supabase'

export const createUserProfile = async (userId: string, extraData: any) => {
  return await supabase.from('users').insert([
    {
      id: userId,
      ...extraData, // name, phone, etc.
    },
  ])
}
