import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tuhyjyuzbpkhjkqkqdkr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR1aHlqeXV6YnBraGprcWtxZGtyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQyODQ3NDQsImV4cCI6MjA1OTg2MDc0NH0.OWOREyjk0YPpEj_3aHzZq9hxaUMfCla6rMbeYABMz78';

export const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      flowType: 'PKCE',
      autoRefreshToken: true,
      detectSessionInUrl: true,
      persistSession: true
    }
  });