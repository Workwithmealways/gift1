import { supabase } from './supabaseClient';

// auth.js (updated)
export const loginWithGoogle = async () => {
  return await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: import.meta.env.VITE_REDIRECT_URL,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent'
      }
    }
  });
};


export const loginWithMicrosoft = async () => {
  return await supabase.auth.signInWithOAuth({
    provider: 'azure',
    options: {
      redirectTo: window.location.origin,
      scopes: 'openid email profile'
    }
  });
};

export const logout = async () => {
  return await supabase.auth.signOut();
};

export const registerWithEmail = async (email, password) => {
  return await supabase.auth.signUp({ email, password });
};

export const loginWithEmail = async (email, password) => {
  return await supabase.auth.signInWithPassword({ email, password });
};

export const resetPassword = async (email) => {
  return await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin + '/update-password'
  });
};

export const updatePassword = async (newPassword) => {
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword
  });
  return { data, error };
};
