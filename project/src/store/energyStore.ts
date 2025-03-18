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
  created_at: string;
  start_date: string;
  end_date: string;
  appliances: Appliances;
  time_series_predictions: number[];
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
        .eq("email", user.email)
        .single();

      let userId = existingUser?.id;

      if (!existingUser) {
        const { data: newUser, error: createError } = await supabase
          .from("users")
          .insert([{ auth_user_id: user.id, email: user.email }])
          .select()
          .single();

        if (createError) {
          if (createError.code === "23505") {
            const { data: retryUser } = await supabase
              .from("users")
              .select("id")
              .eq("email", user.email)
              .single();
            userId = retryUser?.id;
          } else {
            throw createError;
          }
        } else {
          userId = newUser.id;
        }
      }

      if (!userId) throw new Error("Could not get or create user");

      // Calculate consumption and generate time series predictions
      const consumption = calculateConsumption(data);
      const days = calculateDays(data.start_date, data.end_date);
      const dailyConsumption = consumption / days;
      const timeSeriesPredictions = generateTimeSeriesPredictions(
        dailyConsumption,
        days
      );

      // Create prediction with time series data
      const { data: prediction, error } = await supabase
        .from("predictions")
        .insert([
          {
            user_id: userId,
            ...data,
            consumption,
            days,
            total_appliances: calculateTotalAppliances(data.appliances),
            time_series_predictions: timeSeriesPredictions,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      set({ prediction });
      return prediction;
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
