import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://lvbchrxpfvqrvpjbaooj.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2YmNocnhwZnZxcnZwamJhb29qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg0NTI5MjUsImV4cCI6MjEwNDAyODkyNX0.xzBRfo8YOikFsQT1E41cMkPMYurUuD5iNm7MaaHXopY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
