import { createClient } from "@supabase/supabase-js";

// Load environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

// Initialize Supabase client
const supabase = createClient(supabaseUrl as string, supabaseAnonKey as string);

// ... existing code ...
