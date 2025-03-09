import { createClient } from "@supabase/supabase-js";

// Load environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL; // Ensure this matches your .env variable
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY; // Ensure this matches your .env variable

// Initialize Supabase client
const supabase = createClient(supabaseUrl as string, supabaseAnonKey as string);

// ... existing code ...
