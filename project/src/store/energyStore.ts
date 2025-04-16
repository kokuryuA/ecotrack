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
  hasMoreHistory: boolean;
  setLoading: (loading: boolean) => void;
  fetchPrediction: (data: PredictionRequest) => Promise<void>;
  fetchForecast: () => Promise<void>;
  fetchPredictionHistory: (page?: number) => Promise<void>;
  clearPredictionHistory: () => void;
}

const API_URL = "https://ecotrack-api-uw71.onrender.com";

interface CachedPrediction {
  data: PredictionResponse;
  timestamp: number;
  expiresAt: number;
  input: PredictionRequest;
  user_id: string;
}

const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const MAX_CACHE_SIZE = 100; // Maximum number of cached predictions

class PredictionCache {
  private cache: Map<string, CachedPrediction>;
  private maxSize: number;

  constructor(maxSize: number = MAX_CACHE_SIZE) {
    this.cache = new Map();
    this.maxSize = maxSize;
  }

  private async loadFromDatabase(userId: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user");

      const { data: cachedPredictions, error } = await supabase
        .from('prediction_cache')
        .select('*')
        .eq('user_id', user.id)
        .gt('expires_at', new Date().toISOString());

      if (error) throw error;

      if (cachedPredictions) {
        this.cache = new Map(
          cachedPredictions.map(pred => [
            pred.cache_key,
            {
              data: pred.prediction_data,
              timestamp: new Date(pred.created_at).getTime(),
              expiresAt: new Date(pred.expires_at).getTime(),
              input: pred.input_data,
              user_id: pred.user_id
            }
          ])
        );
      }
    } catch (error) {
      console.error('Error loading cache from database:', error);
      this.cache = new Map();
    }
  }

  private async saveToDatabase(key: string, prediction: CachedPrediction) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user");

      const { error } = await supabase
        .from('prediction_cache')
        .upsert(
          {
            cache_key: key,
            user_id: user.id,
            prediction_data: prediction.data,
            input_data: prediction.input,
            created_at: new Date(prediction.timestamp).toISOString(),
            expires_at: new Date(prediction.expiresAt).toISOString()
          },
          {
            onConflict: 'user_id,cache_key',
            ignoreDuplicates: false
          }
        );

      if (error) throw error;
    } catch (error) {
      console.error('Error saving cache to database:', error);
    }
  }

  private async clearExpiredFromDatabase() {
    try {
      const { error } = await supabase
        .from('prediction_cache')
        .delete()
        .lt('expires_at', new Date().toISOString());

      if (error) throw error;
    } catch (error) {
      console.error('Error clearing expired cache from database:', error);
    }
  }

  async get(key: string, userId: string): Promise<PredictionResponse | null> {
    // Load from database if cache is empty
    if (this.cache.size === 0) {
      await this.loadFromDatabase(userId);
    }

    const cached = this.cache.get(key);
    if (!cached) return null;

    const now = Date.now();
    if (now > cached.expiresAt) {
      this.cache.delete(key);
      await this.clearExpiredFromDatabase();
      return null;
    }

    return cached.data;
  }

  async set(key: string, data: PredictionResponse, input: PredictionRequest, userId: string) {
    const now = Date.now();
    const cachedPrediction: CachedPrediction = {
      data,
      timestamp: now,
      expiresAt: now + CACHE_DURATION,
      input,
      user_id: userId
    };

    // Remove oldest entry if cache is full
    if (this.cache.size >= this.maxSize) {
      const oldestKey = Array.from(this.cache.entries())
        .sort(([, a], [, b]) => a.timestamp - b.timestamp)[0][0];
      this.cache.delete(oldestKey);
    }

    this.cache.set(key, cachedPrediction);
    await this.saveToDatabase(key, cachedPrediction);
  }

  async findSimilarPrediction(input: PredictionRequest, userId: string): Promise<PredictionResponse | null> {
    // Load from database if cache is empty
    if (this.cache.size === 0) {
      await this.loadFromDatabase(userId);
    }

    const now = Date.now();
    for (const [key, cached] of this.cache.entries()) {
      if (now > cached.expiresAt) {
        this.cache.delete(key);
        continue;
      }

      if (this.areInputsSimilar(input, cached.input)) {
        console.log('🟡 Similar Cache Hit:', {
          original: cached.input,
          new: input,
          similarity: 'within 20% difference'
        });
        return cached.data;
      }
    }
    return null;
  }

  private areInputsSimilar(input1: PredictionRequest, input2: PredictionRequest): boolean {
    // Only allow similar if the number of days is the same
    const days1 = Math.ceil((new Date(input1.end_date).getTime() - new Date(input1.start_date).getTime()) / (1000 * 60 * 60 * 24));
    const days2 = Math.ceil((new Date(input2.end_date).getTime() - new Date(input2.start_date).getTime()) / (1000 * 60 * 60 * 24));
    if (days1 !== days2) return false;

    // Check if appliance counts are similar (within 20%)
    const appliances1 = Object.entries(input1.appliances);
    const appliances2 = Object.entries(input2.appliances);

    if (appliances1.length !== appliances2.length) return false;

    for (const [key, count1] of appliances1) {
      const count2 = input2.appliances[key];
      if (count2 === undefined) return false;
      
      const diff = Math.abs(count1 - count2);
      const maxDiff = Math.max(count1, count2) * 0.2; // 20% difference allowed
      if (diff > maxDiff) return false;
    }

    return true;
  }

  clear() {
    this.cache.clear();
  }
}

const predictionCache = new PredictionCache();

// Memoized calculation functions
const memoizedCalculateConsumption = (() => {
  const cache = new Map<string, number>();
  return (data: PredictionRequest): number => {
    const cacheKey = JSON.stringify(data);
    if (cache.has(cacheKey)) {
      return cache.get(cacheKey)!;
    }
    
  const ENERGY_FACTORS = {
      lightbulbs: 0.3 * 24, // kWh per day (24 hours)
      tvs: 2.5 * 6, // kWh per day (assumed 6 hours usage)
      computers: 1.8 * 8, // kWh per day (assumed 8 hours usage)
      fans: 0.5 * 12, // kWh per day (assumed 12 hours usage)
      refrigerators: 4.5 * 24, // kWh per day (24 hours)
      washingMachines: 1.2 * 2, // kWh per day (assumed 2 hours usage)
      coffeeMakers: 0.4 * 1, // kWh per day (assumed 1 hour usage)
      smartphones: 0.1 * 12, // kWh per day (assumed 12 hours charging)
      default: 1.0 * 24, // kWh per day
  };

  const startDate = new Date(data.start_date);
  const endDate = new Date(data.end_date);
  const days = Math.ceil(
    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );

    // Calculate daily consumption for each appliance
    let dailyConsumption = 0;
  for (const [appliance, count] of Object.entries(data.appliances)) {
    const factor =
      ENERGY_FACTORS[appliance as keyof typeof ENERGY_FACTORS] ||
      ENERGY_FACTORS.default;
      dailyConsumption += factor * count;
    }

    // Calculate total consumption for the entire period
    const totalConsumption = dailyConsumption * days;

    // Add seasonal variation (±10% based on month)
    const month = startDate.getMonth();
    const seasonalFactor = 1 + Math.sin((month / 12) * 2 * Math.PI) * 0.1;

    // Add some daily randomness (±15%)
  const randomness = 0.85 + Math.random() * 0.3;

    // Calculate final consumption with all factors
    const result = totalConsumption * seasonalFactor * randomness;
    cache.set(cacheKey, result);
    return result;
  };
})();

const calculateDays = (startDate: string, endDate: string): number => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
};

const calculateTotalAppliances = (appliances: Appliances): number => {
  return Object.values(appliances).reduce((sum, count) => sum + count, 0);
};

// Optimized time series generation
const generateTimeSeriesPredictions = (
  dailyConsumption: number,
  days: number,
  startDate: string
): number[] => {
  const start = new Date(startDate);
  const weeklyPattern = [100, 105, 102, 108, 106, 110, 105];
  const scaleFactor = dailyConsumption / 100;
  
  return Array.from({ length: days }, (_, i) => {
    const currentDate = new Date(start);
    currentDate.setDate(currentDate.getDate() + i);
    
    // Weekly pattern
    const dayOfWeek = currentDate.getDay();
    const baseValue = weeklyPattern[dayOfWeek] * scaleFactor;
    
    // Seasonal variation (±10%)
    const month = currentDate.getMonth();
    const seasonalFactor = 1 + Math.sin((month / 12) * 2 * Math.PI) * 0.1;
    
    // Daily random variation (±10%)
    const dailyVariation = 0.9 + Math.random() * 0.2;
    
    return baseValue * seasonalFactor * dailyVariation;
  });
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

const MAX_RETRIES = 3;
const TIMEOUT_DURATION = 30000; // 30 seconds
const RETRY_DELAY = 5000; // 5 seconds between retries

const fetchWithRetry = async (url: string, options: RequestInit, retries = 0): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
    console.log(`⏱️ Request timed out after ${TIMEOUT_DURATION/1000} seconds`);
  }, TIMEOUT_DURATION);

  try {
    console.log(`🔄 Attempt ${retries + 1}/${MAX_RETRIES} to fetch prediction`);
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      console.log(`⏱️ Request aborted after ${TIMEOUT_DURATION/1000} seconds`);
      if (retries < MAX_RETRIES) {
        console.log(`⏳ Waiting ${RETRY_DELAY/1000} seconds before retry...`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        return fetchWithRetry(url, options, retries + 1);
      }
      throw new Error(`Request timed out after ${MAX_RETRIES} retries`);
    }
    
    if (retries < MAX_RETRIES) {
      console.log(`⚠️ Error: ${error.message}. Retrying in ${RETRY_DELAY/1000} seconds...`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return fetchWithRetry(url, options, retries + 1);
    }
    
    throw error;
  }
};

export const useEnergyStore = create<EnergyStore>((set, get) => ({
  loading: false,
  prediction: null,
  forecast: null,
  predictionHistory: [],
  hasMoreHistory: true,

  setLoading: (loading) => set({ loading }),

  clearPredictionHistory: () => set({ predictionHistory: [], hasMoreHistory: true }),

  fetchPredictionHistory: async (page = 1) => {
    try {
      set({ loading: true });
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user");

      const { data: existingUser } = await supabase
        .from("users")
        .select("id")
        .eq("auth_user_id", user.id)
        .single();

      if (!existingUser) return;

      const PAGE_SIZE = 10;
      const { data: predictions, error } = await supabase
        .from("predictions")
        .select("*")
        .eq("user_id", existingUser.id)
        .order("created_at", { ascending: false })
        .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

      if (error) throw error;

      set((state) => ({
        predictionHistory: page === 1 ? predictions : [...state.predictionHistory, ...predictions],
        hasMoreHistory: predictions.length === PAGE_SIZE
      }));
    } catch (error) {
      console.error("Error fetching prediction history:", error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  fetchPrediction: async (data: PredictionRequest) => {
    const startTime = performance.now();
    try {
      set({ loading: true });
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user");

      // Generate cache key
      const cacheKey = JSON.stringify({
        ...data,
        userId: user.id
      });

      // Check exact cache first
      const cachedPrediction = await predictionCache.get(cacheKey, user.id);
      if (cachedPrediction) {
        const cacheTime = performance.now() - startTime;
        console.log('🔵 Exact Cache Hit:', {
          time: `${cacheTime.toFixed(2)}ms`,
          key: cacheKey
        });
        set({ prediction: cachedPrediction });
        return cachedPrediction;
      }

      // Check for similar predictions
      const similarPrediction = await predictionCache.findSimilarPrediction(data, user.id);
      if (similarPrediction) {
        const similarTime = performance.now() - startTime;
        console.log('🟡 Similar Cache Hit:', {
          time: `${similarTime.toFixed(2)}ms`,
          original: similarPrediction
        });
        set({ prediction: similarPrediction });
        return similarPrediction;
      }

      console.log('🔴 Cache Miss:', {
        key: cacheKey,
        cacheSize: predictionCache.cache.size
      });

      // Get or create user in the database
      const { data: existingUser, error: userError } = await supabase
        .from("users")
        .select("id")
        .eq("auth_user_id", user.id)
        .single();

      let userId = existingUser?.id;

      if (!existingUser) {
        // Try to insert, but handle duplicate gracefully
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

        if (createError && createError.code === '23505') {
          // Duplicate email, fetch the user by email
          const { data: userByEmail, error: fetchError } = await supabase
            .from("users")
            .select("id")
            .eq("email", user.email)
            .single();
          if (userByEmail) {
            userId = userByEmail.id;
          } else {
            throw fetchError || createError;
          }
        } else if (createError) {
          throw createError;
        } else {
          userId = newUser.id;
        }
      }

      if (!userId) throw new Error("Could not get or create user");

      // Make API call to backend with retry logic
      const apiStartTime = performance.now();
      const response = await fetchWithRetry(`${API_URL}/predict`, {
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
      const apiTime = performance.now() - apiStartTime;
      console.log('🟢 API Response:', {
        time: `${apiTime.toFixed(2)}ms`,
        status: response.status
      });
      
      // Calculate days before using it
      const days = calculateDays(data.start_date, data.end_date);
      
      // Store prediction in Supabase
      const dbStartTime = performance.now();
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
      const dbTime = performance.now() - dbStartTime;
      console.log('💾 Database Save:', {
        time: `${dbTime.toFixed(2)}ms`
      });

      // Cache the prediction with input data
      await predictionCache.set(cacheKey, savedPrediction, data, userId);
      
      const totalTime = performance.now() - startTime;
      console.log('📊 Total Operation:', {
        totalTime: `${totalTime.toFixed(2)}ms`,
        apiTime: `${apiTime.toFixed(2)}ms`,
        dbTime: `${dbTime.toFixed(2)}ms`,
        cacheSize: predictionCache.cache.size
      });

      set({ prediction: savedPrediction });
      return savedPrediction;
    } catch (error) {
      const errorTime = performance.now() - startTime;
      console.error('❌ Error:', {
        time: `${errorTime.toFixed(2)}ms`,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      if (error instanceof Error) {
        throw new Error(`Prediction failed: ${error.message}`);
      }
      throw new Error('An unexpected error occurred during prediction');
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
}));
