from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime, timedelta
import random
from pydantic import BaseModel
from typing import Dict, Optional, List
import uuid
import numpy as np
import pandas as pd
from statsforecast import StatsForecast
from statsforecast.models import MSTL, AutoARIMA

app = FastAPI(
    title="Energy Consumption Predictor API",
    description="API for energy consumption prediction and time series forecasting",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create model instance with MSTL decomposition
model = MSTL(
    season_length=[7],  # Weekly seasonality
    trend_forecaster=AutoARIMA()
)

# Energy consumption factors
ENERGY_FACTORS = {
    "lightbulbs": 0.3,
    "tvs": 2.5,
    "computers": 1.8,
    "fans": 0.5,
    "refrigerators": 4.5,
    "washingMachines": 1.2,
    "coffeeMakers": 0.4,
    "smartphones": 0.1,
    "default": 1.0
}

# Models
class ApplianceInput(BaseModel):
    appliances: Dict[str, int]
    start_date: str
    end_date: str

class TimeSeriesInput(BaseModel):
    values: List[float]
    horizon: int = 7  # Default forecast horizon

class ComparisonInput(BaseModel):
    appliances: Dict[str, int]
    start_date: str
    end_date: str
    historical_values: Optional[List[float]] = None

@app.post("/predict")
async def predict_energy(input_data: ApplianceInput):
    try:
        # Parse dates
        start_date = datetime.strptime(input_data.start_date, "%Y-%m-%d").date()
        end_date = datetime.strptime(input_data.end_date, "%Y-%m-%d").date()
        
        # Calculate number of days
        days = (end_date - start_date).days
        if days <= 0:
            raise HTTPException(status_code=400, detail="End date must be after start date")
        
        # Calculate total appliances
        total_appliances = sum(input_data.appliances.values())
        if total_appliances <= 0:
            raise HTTPException(status_code=400, detail="At least one appliance is required")
        
        # Calculate base consumption
        base_consumption = 0
        for appliance_type, count in input_data.appliances.items():
            daily_factor = ENERGY_FACTORS.get(appliance_type, ENERGY_FACTORS["default"])
            base_consumption += daily_factor * count
        
        # Generate historical data with patterns
        historical_days = days // 2  # Use half the period for historical data
        historical_values = []
        for i in range(historical_days):
            daily_base = base_consumption
            # Add weekly pattern
            weekly_pattern = 0.2 * np.sin(2 * np.pi * i / 7)  # 20% variation over a week
            # Add daily pattern
            daily_pattern = 0.1 * np.sin(2 * np.pi * i)  # 10% variation within a day
            # Add random noise
            noise = np.random.normal(0, 0.05)  # 5% random variation
            # Combine all patterns
            daily_value = daily_base * (1 + weekly_pattern + daily_pattern + noise)
            historical_values.append(daily_value)
        
        # Use MSTL model for future predictions
        dates = pd.date_range(start=start_date, periods=historical_days, freq='D')
        df = pd.DataFrame({
            'unique_id': ['ts1'] * historical_days,
            'ds': dates,
            'y': historical_values
        })
        
        # Create StatsForecast object with the model
        sf = StatsForecast(
            models=[model],
            freq='D'
        )
        
        # Make prediction for the remaining days
        future_days = days - historical_days
        forecast = sf.forecast(df=df, h=future_days)
        
        # Extract predictions
        time_series_predictions = forecast.filter(like='MSTL').iloc[:, 0].tolist()
        
        # Calculate total consumption
        total_consumption = sum(historical_values) + sum(time_series_predictions)
        
        return {
            "id": str(uuid.uuid4()),
            "consumption": total_consumption,
            "days": days,
            "total_appliances": total_appliances,
            "historical_values": historical_values,
            "time_series_predictions": time_series_predictions,
            "dates": pd.date_range(start=start_date, periods=days, freq='D').strftime('%Y-%m-%d').tolist()
        }
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Invalid input: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

@app.get("/")
async def root():
    return {"message": "Welcome to Energy Consumption Predictor API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)