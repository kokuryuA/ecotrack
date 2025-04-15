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
    allow_origins=["https://ecotrack22.netlify.app", "http://localhost:5173", "http://localhost:5174", "https://ecotrack-api-uw71.onrender.com"],  # Frontend URLs
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
        days = (end_date - start_date).days + 1  # Add 1 to include both start and end dates
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
        
        # Static historical values (21 days)
        base_historical_values = [
            100, 105, 102, 108, 106, 110, 105,  # Week 1
            103, 107, 104, 109, 108, 112, 107,  # Week 2
            105, 108, 106, 111, 110, 115, 109   # Week 3
        ]
        
        # Calculate how many historical days we need
        historical_days = min(days // 2, len(base_historical_values))
        
        # Calculate scale factor based on base consumption
        scale_factor = base_consumption / np.mean(base_historical_values)
        
        # Scale historical values
        historical_values = [v * scale_factor for v in base_historical_values[:historical_days]]
        
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
        future_days = days - len(historical_values)
        if future_days > 0:
            forecast = sf.forecast(df=df, h=future_days)
            # Extract and scale predictions
            time_series_predictions = forecast.filter(like='MSTL').iloc[:, 0].tolist()
        else:
            time_series_predictions = []
        
        # Calculate total consumption
        total_consumption = sum(historical_values) + (sum(time_series_predictions) if time_series_predictions else 0)
        
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