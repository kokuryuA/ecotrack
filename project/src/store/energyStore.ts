import { create } from "zustand";
import { supabase } from "../lib/supabase";
import { useAuthStore } from "./authStore";

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
  historical_values: number[];
  time_series_predictions: number[];
  dates: string[];
  start_date: string;
  end_date: string;
}

interface ForecastResponse {
  id: string;
  prediction_id: string;
  consumption: number;
  trend: "increase" | "decrease" | "stable";
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

const API_URL = "https://ecotrack-api-uw71.onrender.com";

// Helper functions
const calculateConsumption = (data: PredictionRequest): number => {
  const ENERGY_FACTORS = {
    lightbulbs: 0.3,
    tvs: 2.5,
    computers: 1.8,
    fans: 0.5,
    refrigerators: 4.5,
    washingMachines: 1.2,
    coffeeMakers: 0.4,
    smartphones: 0.1,
    default: 1.0,
  };

  const startDate = new Date(data.start_date);
  const endDate = new Date(data.end_date);
  const days = Math.ceil(
    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  let baseConsumption = 0;
  for (const [appliance, count] of Object.entries(data.appliances)) {
    const factor =
      ENERGY_FACTORS[appliance as keyof typeof ENERGY_FACTORS] ||
      ENERGY_FACTORS.default;
    baseConsumption += factor * count * days;
  }

  // Add some randomness (±15%)
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

const generateTimeSeriesPredictions = (
  dailyConsumption: number,
  days: number
): number[] => {
  // Generate historical values with a weekly pattern (same as test_prediction.py)
  const historicalValues = [
    100,
    105,
    102,
    108,
    106,
    110,
    105, // Week 1
    103,
    107,
    104,
    109,
    108,
    112,
    107, // Week 2
    105,
    108,
    106,
    111,
    110,
    115,
    109, // Week 3
  ];

  // Scale the historical values to match the daily consumption
  const scaleFactor = dailyConsumption / 100;
  const scaledHistoricalValues = historicalValues.map((v) => v * scaleFactor);

  // Generate predictions based on the historical pattern
  const predictions = [];
  for (let i = 0; i < days; i++) {
    const baseValue = scaledHistoricalValues[i % 7]; // Use weekly pattern
    const variation = 0.9 + Math.random() * 0.2; // ±10% variation
    predictions.push(baseValue * variation);
  }

  return predictions;
};

const generateForecast = (prediction: PredictionResponse) => {
  // Generate a trend factor (-10% to +20%)
  const trendFactor = 0.9 + Math.random() * 0.3;
  const consumption = prediction.consumption * trendFactor;
  const percentageChange =
    ((consumption - prediction.consumption) / prediction.consumption) * 100;

  let trend: "increase" | "decrease" | "stable";
  if (percentageChange > 2) trend = "increase";
  else if (percentageChange < -2) trend = "decrease";
  else trend = "stable";

  return {
    consumption,
    trend,
    percentage_change: percentageChange,
  };
};

export const useEnergyStore = create<EnergyStore>((set, get) => ({
  loading: false,
  prediction: null,
  forecast: null,
  predictionHistory: [],

  setLoading: (loading) => set({ loading }),

  fetchPrediction: async (data: PredictionRequest) => {
    try {
      set({ loading: true });
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user");

      // Get or create user in the database
      const { data: existingUser, error: userError } = await supabase
        .from("users")
        .select("id")
        .eq("auth_user_id", user.id)
        .single();

      let userId = existingUser?.id;

      if (!existingUser) {
        const { data: newUser, error: createError } = await supabase
          .from("users")
          .insert([
            { 
              email: user.email,
              auth_user_id: user.id,
              auth_provider: 'local'
            }
          ])
          .select()
          .single();

        if (createError) {
          console.error("Error creating user:", createError);
          throw createError;
        }
        userId = newUser.id;
      }

      if (!userId) throw new Error("Could not get or create user");

      // Make API call to backend
      const response = await fetch(`${API_URL}/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch prediction');
      }

      const prediction = await response.json();
      
      // Calculate days before using it
      const days = calculateDays(data.start_date, data.end_date);
      
      // Store prediction in Supabase
      const { data: savedPrediction, error } = await supabase
        .from("predictions")
        .insert([
          {
            user_id: userId,
            appliances: data.appliances,
            start_date: data.start_date,
            end_date: data.end_date,
            consumption: prediction.consumption,
            days: days,
            total_appliances: calculateTotalAppliances(data.appliances),
            historical_values: prediction.historical_values,
            time_series_predictions: prediction.time_series_predictions
          },
        ])
        .select()
        .single();

      if (error) {
        console.error("Error saving prediction:", error);
        throw error;
      }

      set({ prediction: savedPrediction });
      return savedPrediction;
    } catch (error) {
      console.error("Error creating prediction:", error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  fetchForecast: async () => {
    const { prediction } = get();
    const { user } = useAuthStore.getState();

    if (!prediction || !user) {
      console.error("Cannot fetch forecast without prediction or user");
      return;
    }

    try {
      const forecastData = generateForecast(prediction);
      const { data: forecast, error } = await supabase
        .from("forecasts")
        .insert([
          {
            user_id: user.id,
            prediction_id: prediction.id,
            ...forecastData,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      set({ forecast });
      return forecast;
    } catch (error) {
      console.error("Error creating forecast:", error);
      throw error;
    }
  },

  fetchPredictionHistory: async () => {
    try {
      set({ loading: true });
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: dbUser, error: userError } = await supabase
        .from("users")
        .select("id")
        .eq("email", user.email)
        .single();

      if (userError || !dbUser) return;

      const { data, error } = await supabase
        .from("predictions")
        .select("*")
        .eq("user_id", dbUser.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      set({ predictionHistory: data || [] });
    } catch (error) {
      console.error("Error fetching prediction history:", error);
      set({ predictionHistory: [] });
    } finally {
      set({ loading: false });
    }
  },
}));
