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

export const resendConfirmationEmail = async (email: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password: "fake-password",
  });

  if (error) {
    if (error.message.includes("User already registered")) {
      console.log("Confirmation email re-sent (if needed).");
    } else {
      console.error("Error:", error.message);
    }
  } else {
    console.log("Email sent successfully:", data);
  }
  return true
};
