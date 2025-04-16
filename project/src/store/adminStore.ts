import { create } from 'zustand';
import { supabase } from '../lib/supabase';

interface User {
  id: string;
  email: string;
  created_at: string;
  auth_user_id: string;
  phone_number?: string;
  predictions_count?: number;
  role?: string;
  last_sign_in_at?: string | null;
}

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalPredictions: number;
  averagePredictionTime: number;
  userGrowth: number;
  predictionAccuracy: number;
  dailyActiveUsers: number[];
  monthlyPredictions: number[];
}

interface AdminState {
  users: User[];
  stats: AdminStats;
  isLoading: boolean;
  error: string | null;
  selectedUser: User | null;
  isAdmin: boolean;
  checkAdminAccess: () => Promise<void>;
  fetchUsers: () => Promise<void>;
  fetchStats: () => Promise<void>;
  updateUserStatus: (userId: string, isActive: boolean) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  setSelectedUser: (user: User | null) => void;
}

export const useAdminStore = create<AdminState>((set, get) => ({
  users: [],
  stats: {
    totalUsers: 0,
    activeUsers: 0,
    totalPredictions: 0,
    averagePredictionTime: 0,
    userGrowth: 0,
    predictionAccuracy: 0,
    dailyActiveUsers: [],
    monthlyPredictions: []
  },
  isLoading: false,
  error: null,
  selectedUser: null,
  isAdmin: false,

  checkAdminAccess: async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      
      if (user?.email === 'lionelabdelnour5@gmail.com') {
        set({ isAdmin: true });
      } else {
        set({ isAdmin: false, error: 'Access denied: Admin privileges required' });
      }
    } catch (error) {
      console.error('Error checking admin access:', error);
      set({ isAdmin: false, error: 'Failed to verify admin access' });
    }
  },

  fetchUsers: async () => {
    try {
      set({ isLoading: true, error: null });
      
      // Check admin access first
      await get().checkAdminAccess();
      if (!get().isAdmin) return;

      // Fetch users with their prediction counts
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select(`
          *,
          predictions(count)
        `)
        .order('created_at', { ascending: false });

      if (usersError) {
        console.error('Error fetching users:', usersError);
        throw usersError;
      }

      if (!users || users.length === 0) {
        console.log('No users found');
        set({ users: [], isLoading: false });
        return;
      }

      // Get current user's session for comparison
      const { data: { session } } = await supabase.auth.getSession();
      const currentUser = session?.user;

      // Map users with their data
      const usersWithData = users.map(user => ({
        id: user.id,
        auth_user_id: user.auth_user_id,
        email: user.email,
        created_at: user.created_at,
        last_sign_in_at: user.auth_user_id === currentUser?.id ? currentUser?.last_sign_in_at : null,
        phone_number: user.phone_number,
        predictions_count: user.predictions?.length || 0,
        role: user.role || 'user'
      }));

      set({ users: usersWithData, isLoading: false });
    } catch (error) {
      console.error('Error in fetchUsers:', error);
      set({ error: 'Failed to fetch users', isLoading: false });
    }
  },

  fetchStats: async () => {
    try {
      set({ isLoading: true, error: null });

      // Check admin access first
      await get().checkAdminAccess();
      if (!get().isAdmin) return;

      // Get users with their predictions
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select(`
          *,
          predictions(created_at)
        `);

      if (usersError) throw usersError;

      const totalUsers = users?.length || 0;

      // Get predictions
      const allPredictions = users?.flatMap(user => user.predictions || []) || [];
      const totalPredictions = allPredictions.length;

      // Calculate user growth (compared to last month)
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      const lastMonthUsers = users?.filter(user => 
        new Date(user.created_at) < lastMonth
      ).length || 0;

      const userGrowth = lastMonthUsers > 0 ? ((totalUsers - lastMonthUsers) / lastMonthUsers) * 100 : 0;

      // Get daily active users based on predictions
      const dailyActiveUsers = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const startOfDay = new Date(date.setHours(0, 0, 0, 0));
        const endOfDay = new Date(date.setHours(23, 59, 59, 999));
        
        return new Set(
          allPredictions
            .filter(pred => 
              new Date(pred.created_at) >= startOfDay && 
              new Date(pred.created_at) <= endOfDay
            )
            .map(pred => pred.user_id)
        ).size;
      });

      // Get monthly predictions
      const monthlyPredictions = Array.from({ length: 6 }, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
        const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        
        return allPredictions.filter(pred => 
          new Date(pred.created_at) >= startOfMonth && 
          new Date(pred.created_at) <= endOfMonth
        ).length;
      });

      // Calculate active users based on recent predictions
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const activeUsers = new Set(
        allPredictions
          .filter(pred => new Date(pred.created_at) > sevenDaysAgo)
          .map(pred => pred.user_id)
      ).size;

      set({
        stats: {
          totalUsers,
          activeUsers,
          totalPredictions,
          averagePredictionTime: 2.5,
          userGrowth,
          predictionAccuracy: 95.5,
          dailyActiveUsers,
          monthlyPredictions
        },
        isLoading: false
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      set({ error: 'Failed to fetch statistics', isLoading: false });
    }
  },

  updateUserStatus: async (userId: string, isActive: boolean) => {
    try {
      set({ isLoading: true, error: null });
      
      // Check admin access first
      await get().checkAdminAccess();
      if (!get().isAdmin) return;

      const { error } = await supabase
        .from('users')
        .update({ is_active: isActive })
        .eq('id', userId);

      if (error) throw error;

      // Refresh users list
      await get().fetchUsers();
    } catch (error) {
      console.error('Error updating user status:', error);
      set({ error: 'Failed to update user status', isLoading: false });
    }
  },

  deleteUser: async (userId: string) => {
    try {
      set({ isLoading: true, error: null });
      
      // Check admin access first
      await get().checkAdminAccess();
      if (!get().isAdmin) return;

      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      // Refresh users list
      await get().fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      set({ error: 'Failed to delete user', isLoading: false });
    }
  },

  setSelectedUser: (user: User | null) => set({ selectedUser: user })
})); 