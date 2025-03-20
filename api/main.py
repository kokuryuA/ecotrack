from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict
import numpy as np
from datetime import datetime, timedelta

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class PredictionRequest(BaseModel):
    appliances: Dict[str, float]
    start_date: str
    end_date: str

class PredictionResponse(BaseModel):
    id: str
    user_id: str = "demo_user"  # Placeholder until auth is implemented
    consumption: float
    days: int
    total_appliances: int
    created_at: str
    start_date: str
    end_date: str
    appliances: Dict[str, float]
    time_series_predictions: List[float]

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.post("/predict", response_model=PredictionResponse)
async def predict_energy(request: PredictionRequest):
    try:
        # Calculate number of days
        start = datetime.strptime(request.start_date, "%Y-%m-%d")
        end = datetime.strptime(request.end_date, "%Y-%m-%d")
        days = (end - start).days + 1

        if days <= 0:
            raise HTTPException(status_code=400, detail="End date must be after start date")

        # Calculate base consumption for each appliance
        total_consumption = sum(request.appliances.values())
        
        # Generate time series predictions with some randomness
        base_predictions = []
        for _ in range(days):
            # Add some random variation (±10%) to the daily consumption
            daily_variation = np.random.uniform(0.9, 1.1)
            base_predictions.append(total_consumption * daily_variation)

        # Create response
        response = PredictionResponse(
            id=f"pred_{datetime.now().strftime('%Y%m%d%H%M%S')}",
            consumption=sum(base_predictions),
            days=days,
            total_appliances=len(request.appliances),
            created_at=datetime.now().isoformat(),
            start_date=request.start_date,
            end_date=request.end_date,
            appliances=request.appliances,
            time_series_predictions=base_predictions
        )
        
        return response

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 