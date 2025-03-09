import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 8000;

// JWT settings
const SECRET_KEY = process.env.VITE_JWT_SECRET || "your-secret-key-for-jwt-tokens";
const ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7; // 1 week

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage for users and predictions
const users = {};
const lastPrediction = {};

// Energy consumption factors for different appliance types (kWh per day)
const ENERGY_FACTORS = {
  "lightbulbs": 0.3,
  "tvs": 2.5,
  "computers": 1.8,
  "fans": 0.5,
  "refrigerators": 4.5,
  "washingMachines": 1.2,
  "coffeeMakers": 0.4,
  "smartphones": 0.1,
  // Default for any other appliance
  "default": 1.0
};

// Helper functions
const createToken = (userId) => {
  return jwt.sign({ sub: userId }, SECRET_KEY, {
    expiresIn: `${ACCESS_TOKEN_EXPIRE_MINUTES}m`
  });
};

// Authentication middleware
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ detail: "Not authenticated" });
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    // Try to verify as a local token
    try {
      const decoded = jwt.verify(token, SECRET_KEY);
      const userId = decoded.sub;
      
      if (users[userId]) {
        req.user = users[userId];
        return next();
      }
    } catch (localError) {
      // If local verification fails, try to decode as Auth0 token
      const decoded = jwt.decode(token);
      if (decoded && decoded.sub) {
        req.user = {
          id: decoded.sub,
          email: decoded.email || 'user@example.com'
        };
        return next();
      }
    }
    
    return res.status(401).json({ detail: "Invalid token" });
  } catch (error) {
    return res.status(401).json({ detail: "Invalid token" });
  }
};

// Routes
app.get('/', (req, res) => {
  res.json({ message: "Welcome to the Energy Consumption Predictor API" });
});

app.post('/auth/signup', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Check if email already exists
    for (const userId in users) {
      if (users[userId].email === email) {
        return res.status(400).json({ detail: "Email already registered" });
      }
    }
    
    // Create new user
    const userId = uuidv4();
    const hashedPassword = await bcrypt.hash(password, 10);
    
    users[userId] = {
      id: userId,
      email,
      hashedPassword
    };
    
    // Create access token
    const token = createToken(userId);
    
    res.status(200).json({
      token,
      user: {
        id: userId,
        email
      }
    });
  } catch (error) {
    res.status(500).json({ detail: "Server error" });
  }
});

app.post('/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Find user by email
    let user = null;
    let userId = null;
    
    for (const id in users) {
      if (users[id].email === username) {
        user = users[id];
        userId = id;
        break;
      }
    }
    
    if (!user || !(await bcrypt.compare(password, user.hashedPassword))) {
      return res.status(401).json({ detail: "Incorrect email or password" });
    }
    
    // Create access token
    const token = createToken(userId);
    
    res.status(200).json({
      token,
      user: {
        id: userId,
        email: user.email
      }
    });
  } catch (error) {
    res.status(500).json({ detail: "Server error" });
  }
});

app.post('/predict', authenticate, (req, res) => {
  try {
    const { appliances, start_date, end_date } = req.body;
    
    // Parse dates
    const startDate = new Date(start_date);
    const endDate = new Date(end_date);
    
    // Calculate number of days
    const days = Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24));
    if (days <= 0) {
      return res.status(400).json({ detail: "End date must be after start date" });
    }
    
    // Calculate total appliances
    const totalAppliances = Object.values(appliances).reduce((sum, count) => sum + count, 0);
    if (totalAppliances <= 0) {
      return res.status(400).json({ detail: "At least one appliance is required" });
    }
    
    // Calculate base consumption
    let baseConsumption = 0;
    for (const [applianceType, count] of Object.entries(appliances)) {
      const dailyFactor = ENERGY_FACTORS[applianceType] || ENERGY_FACTORS.default;
      baseConsumption += dailyFactor * count * days;
    }
    
    // Add some randomness (±15%)
    const randomness = 0.85 + Math.random() * 0.3; // Random between 0.85 and 1.15
    const consumption = baseConsumption * randomness;
    
    // Store the prediction for later use
    const userId = req.user.id;
    if (!lastPrediction[userId]) {
      lastPrediction[userId] = {};
    }
    
    lastPrediction[userId] = {
      consumption,
      days,
      totalAppliances,
      timestamp: new Date()
    };
    
    res.status(200).json({
      consumption,
      days,
      total_appliances: totalAppliances
    });
  } catch (error) {
    res.status(400).json({ detail: `Invalid input: ${error.message}` });
  }
});

app.get('/forecast', authenticate, (req, res) => {
  const userId = req.user.id;
  
  if (!lastPrediction[userId]) {
    return res.status(400).json({ detail: "No previous prediction available" });
  }
  
  // Get the last prediction
  const currentConsumption = lastPrediction[userId].consumption;
  
  // Generate a trend factor (-10% to +20%)
  const trendFactor = 0.9 + Math.random() * 0.3; // Random between 0.9 and 1.2
  const forecastedConsumption = currentConsumption * trendFactor;
  
  // Calculate percentage change
  const percentageChange = ((forecastedConsumption - currentConsumption) / currentConsumption) * 100;
  
  // Determine trend direction
  let trend;
  if (percentageChange > 2) {
    trend = "increase";
  } else if (percentageChange < -2) {
    trend = "decrease";
  } else {
    trend = "stable";
  }
  
  res.status(200).json({
    consumption: forecastedConsumption,
    trend,
    percentage_change: percentageChange
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});