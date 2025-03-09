import axios from "axios";
import { createClient } from "@supabase/supabase-js";

const API_BASE_URL = "http://localhost:8000";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Initialize Supabase client
const SUPABASE_URL = "https://prswyoxpkjmnfxaavkud.supabase.co"; // Replace with your Supabase URL
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InByc3d5b3hwamtubmZ4YWF2a3VkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTUxMjY3NjgsImV4cCI6MjAyMDcwMjc2OH0.y75000000000000000000000000000000000000000000000000"; // Replace with your Supabase anon key
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const handleSignup = async (email: string, password: string) => {
  const {
    data: { user },
    error,
  } = await supabase.auth.signUp({ email, password });

  if (error) {
    console.error("Signup error:", error);
  } else {
    // Redirect to another page after successful signup
    window.location.href = "/dashboard"; // Adjust the path as needed
  }
};
const handleLogin = async (email: string, password: string) => {
  const {
    data: { user },
    error,
  } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    console.error("Login error:", error);
  } else {
    // Redirect to another page after successful login
    window.location.href = "/dashboard"; // Adjust the path as needed
  }
};
