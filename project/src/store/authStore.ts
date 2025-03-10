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
  checkUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      
      checkUser: async () => {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            set({ 
              user: { id: user.id, email: user.email || '' }, 
              isAuthenticated: true,
              isLoading: false 
            });
          } else {
            set({ user: null, isAuthenticated: false, isLoading: false });
          }
        } catch (error) {
          console.error('Error checking user:', error);
          set({ user: null, isAuthenticated: false, isLoading: false });
        }
      },
      
      login: async (email: string, password: string) => {
        try {
          set({ isLoading: true, error: null });
          const { data: { user }, error } = await supabase.auth.signInWithPassword({
            email,
            password
          });

          if (error) throw error;
          if (user) {
            set({ 
              user: { id: user.id, email: user.email || '' },
              isAuthenticated: true,
              error: null
            });
          }
        } catch (error) {
          console.error('Login error:', error);
          set({ 
            error: 'Login failed. Please check your credentials.',
            isAuthenticated: false
          });
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
          set({ isLoading: true, error: null });
          await supabase.auth.signOut();
          set({ user: null, isAuthenticated: false });
        } catch (error) {
          console.error('Logout error:', error);
          set({ error: 'Logout failed.' });
        } finally {
          set({ isLoading: false });
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