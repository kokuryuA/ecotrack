import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';

interface User {
  id: string;
  email: string;
  phone_number?: string;
  created_at?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, phoneNumber: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      
      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          
          if (error) throw error;
          
          if (data.user) {
            const { data: userData, error: userError } = await supabase
              .from('users')
              .select('*')
              .eq('id', data.user.id)
              .single();

            if (userError) throw userError;

            set({ 
              user: userData,
              isAuthenticated: true
            });
          }
        } catch (error: any) {
          set({ error: error.message });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },
      
      signup: async (email, password, phoneNumber) => {
        set({ isLoading: true, error: null });
        try {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
          });
          
          if (error) throw error;
          
          if (data.user) {
            const { error: profileError } = await supabase
              .from('users')
              .update({ phone_number: phoneNumber })
              .eq('id', data.user.id);

            if (profileError) throw profileError;

            set({ 
              user: {
                id: data.user.id,
                email: data.user.email!,
                phone_number: phoneNumber,
                created_at: data.user.created_at
              },
              isAuthenticated: true
            });
          }
        } catch (error: any) {
          set({ error: error.message });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },
      
      logout: async () => {
        try {
          const { error } = await supabase.auth.signOut();
          if (error) throw error;
          
          set({ 
            user: null,
            isAuthenticated: false
          });
        } catch (error: any) {
          set({ error: error.message });
          throw error;
        }
      },
      
      setUser: (user) => {
        set({ user });
      },
      
      setIsAuthenticated: (isAuthenticated) => {
        set({ isAuthenticated });
      },
      
      clearError: () => set({ error: null })
    }),
    {
      name: 'energy-auth-storage',
      partialize: (state) => ({ 
        user: state.user,
        isAuthenticated: state.isAuthenticated
      }),
    }
  )
);