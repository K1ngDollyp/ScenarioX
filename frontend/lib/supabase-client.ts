import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://lvbchrxpfvqrvpjbaooj.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2YmNocnhwZnZxcnZwamJhb29qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg2MTQ0MDAsImV4cCI6MjA1NDE5MDQwMH0.placeholder';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
