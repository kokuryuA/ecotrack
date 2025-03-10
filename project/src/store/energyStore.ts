import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { useAuthStore } from './authStore';

interface Appliances {
  [key: string]: number;
}

interface PredictionRequest {
  appliances: Appliances;
  start_date: string;
  end_date: string;
}

interface PredictionResponse {
  id: string;
  user_id: string;
  consumption: number;
  days: number;
  total_appliances: number;
  created_at: string;
  start_date: string;
  end_date: string;
  appliances: Appliances;
}

interface ForecastResponse {
  id: string;
  prediction_id: string;
  consumption: number;
  trend: 'increase' | 'decrease' | 'stable';
  percentage_change: number;
  created_at: string;
}

interface EnergyStore {
  loading: boolean;
  prediction: PredictionResponse | null;
  forecast: ForecastResponse | null;
  predictionHistory: PredictionResponse[];
  setLoading: (loading: boolean) => void;
  fetchPrediction: (data: PredictionRequest) => Promise<void>;
  fetchForecast: () => Promise<void>;
  fetchPredictionHistory: () => Promise<void>;
}

export const useEnergyStore = create<EnergyStore>((set, get) => ({
  loading: false,
  prediction: null,
  forecast: null,
  predictionHistory: [],
  
  setLoading: (loading) => set({ loading }),
  
  fetchPrediction: async (data: PredictionRequest) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      console.log('Auth User:', user);
      if (!user) throw new Error('No authenticated user');

      // First check if user exists in users table
      const { data: existingUser, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('email', user.email)
        .single();

      let userId = existingUser?.id;

      if (!existingUser) {
        // Create user if doesn't exist
        const { data: newUser, error: createError } = await supabase
          .from('users')
          .insert([
            {
              auth_user_id: user.id,
              email: user.email
            }
          ])
          .select()
          .single();

        if (createError) {
          // If creation failed due to duplicate, try fetching again
          if (createError.code === '23505') {
            const { data: retryUser } = await supabase
              .from('users')
              .select('id')
              .eq('email', user.email)
              .single();
            userId = retryUser?.id;
          } else {
            throw createError;
          }
        } else {
          userId = newUser.id;
        }
      }

      if (!userId) throw new Error('Could not get or create user');

      // Now create prediction
      const { data: prediction, error } = await supabase
        .from('predictions')
        .insert([
          {
            user_id: userId,
            ...data,
            consumption: calculateConsumption(data),
            days: calculateDays(data.start_date, data.end_date),
            total_appliances: calculateTotalAppliances(data.appliances)
          }
        ])
        .select()
        .single();

      if (error) throw error;
      set({ prediction });
      return prediction;
    } catch (error) {
      console.error('Error creating prediction:', error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  
  fetchForecast: async () => {
    const { prediction } = get();
    const { user } = useAuthStore.getState();
    
    if (!prediction || !user) {
      console.error('Cannot fetch forecast without prediction or user');
      return;
    }
    
    try {
      const forecastData = generateForecast(prediction);
      const { data: forecast, error } = await supabase
        .from('forecasts')
        .insert([{
          user_id: user.id,
          prediction_id: prediction.id,
          ...forecastData
        }])
        .select()
        .single();

      if (error) throw error;
      set({ forecast });
      return forecast;
    } catch (error) {
      console.error('Error creating forecast:', error);
      throw error;
    }
  },
  
  fetchPredictionHistory: async () => {
    try {
      set({ loading: true });
      const { data: { user } } = await supabase.auth.getUser();
      console.log('Fetching history for user:', user);
      if (!user) return;

      // Get the user's ID from the users table
      const { data: dbUser, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('email', user.email)
        .single();

      console.log('Found DB user:', dbUser);
      if (userError) {
        console.error('Error finding user:', userError);
        return;
      }

      if (!dbUser) {
        console.log('No DB user found');
        return;
      }

      const { data, error } = await supabase
        .from('predictions')
        .select('*')
        .eq('user_id', dbUser.id)
        .order('created_at', { ascending: false });

      console.log('Predictions found:', data);
      if (error) {
        console.error('Error fetching predictions:', error);
        throw error;
      }

      set({ predictionHistory: data || [] });
    } catch (error) {
      console.error('Error fetching prediction history:', error);
      set({ predictionHistory: [] });
    } finally {
      set({ loading: false });
    }
  }
}));

// Helper functions
const calculateConsumption = (data: PredictionRequest): number => {
  const days = calculateDays(data.start_date, data.end_date);
  let baseConsumption = 0;
  
  for (const [type, count] of Object.entries(data.appliances)) {
    const dailyFactor = ENERGY_FACTORS[type as keyof typeof ENERGY_FACTORS] || ENERGY_FACTORS.default;
    baseConsumption += dailyFactor * count * days;
  }
  
  // Add randomness (±15%)
  const randomness = 0.85 + Math.random() * 0.3;
  return baseConsumption * randomness;
};

const calculateDays = (startDate: string, endDate: string): number => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
};

const calculateTotalAppliances = (appliances: Appliances): number => {
  return Object.values(appliances).reduce((sum, count) => sum + count, 0);
};

const generateForecast = (prediction: PredictionResponse) => {
  // Generate a trend factor (-10% to +20%)
  const trendFactor = 0.9 + Math.random() * 0.3;
  const consumption = prediction.consumption * trendFactor;
  const percentageChange = ((consumption - prediction.consumption) / prediction.consumption) * 100;
  
  let trend: 'increase' | 'decrease' | 'stable';
  if (percentageChange > 2) trend = 'increase';
  else if (percentageChange < -2) trend = 'decrease';
  else trend = 'stable';
  
  return {
    consumption,
    trend,
    percentage_change: percentageChange
  };
};

const ENERGY_FACTORS = {
  lightbulbs: 0.3,
  tvs: 2.5,
  computers: 1.8,
  fans: 0.5,
  refrigerators: 4.5,
  washingMachines: 1.2,
  coffeeMakers: 0.4,
  smartphones: 0.1,
  default: 1.0
} as const;