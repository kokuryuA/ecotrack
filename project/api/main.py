from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import random
from . import models
from .database import engine, get_db
from pydantic import BaseModel, EmailStr
from typing import Dict, Optional, List
import uuid

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Energy Consumption Predictor API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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

class PredictionOutput(BaseModel):
    id: str
    consumption: float
    days: int
    total_appliances: int
    created_at: datetime

class ForecastOutput(BaseModel):
    id: str
    consumption: float
    trend: str
    percentage_change: float
    created_at: datetime

@app.post("/predict/{user_id}", response_model=PredictionOutput)
async def predict_energy(
    user_id: str,
    input_data: ApplianceInput,
    db: Session = Depends(get_db)
):
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
            base_consumption += daily_factor * count * days
        
        # Add randomness (±15%)
        randomness = random.uniform(0.85, 1.15)
        consumption = base_consumption * randomness
        
        # Create prediction record
        prediction = models.Prediction(
            id=uuid.uuid4(),
            user_id=user_id,
            appliances=input_data.appliances,
            start_date=start_date,
            end_date=end_date,
            consumption=consumption,
            days=days,
            total_appliances=total_appliances
        )
        
        db.add(prediction)
        db.commit()
        db.refresh(prediction)
        
        return prediction
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Invalid input: {str(e)}")

@app.get("/forecast/{prediction_id}", response_model=ForecastOutput)
async def forecast_next_period(prediction_id: str, db: Session = Depends(get_db)):
    prediction = db.query(models.Prediction).filter(models.Prediction.id == prediction_id).first()
    
    if not prediction:
        raise HTTPException(status_code=404, detail="Prediction not found")
    
    # Generate a trend factor (-10% to +20%)
    trend_factor = random.uniform(0.9, 1.2)
    forecasted_consumption = prediction.consumption * trend_factor
    
    # Calculate percentage change
    percentage_change = ((forecasted_consumption - prediction.consumption) / prediction.consumption) * 100
    
    # Determine trend direction
    if percentage_change > 2:
        trend = "increase"
    elif percentage_change < -2:
        trend = "decrease"
    else:
        trend = "stable"
    
    # Create forecast record
    forecast = models.Forecast(
        id=uuid.uuid4(),
        prediction_id=prediction_id,
        user_id=prediction.user_id,
        consumption=forecasted_consumption,
        trend=trend,
        percentage_change=percentage_change
    )
    
    db.add(forecast)
    db.commit()
    db.refresh(forecast)
    
    return forecast

@app.get("/predictions/{user_id}", response_model=List[PredictionOutput])
async def get_predictions(user_id: str, db: Session = Depends(get_db)):
    predictions = db.query(models.Prediction)\
        .filter(models.Prediction.user_id == user_id)\
        .order_by(models.Prediction.created_at.desc())\
        .all()
    return predictions

@app.post("/users")
async def create_user(email: EmailStr, auth0_id: str, db: Session = Depends(get_db)):
    user = models.User(
        id=uuid.uuid4(),
        email=email,
        auth0_id=auth0_id
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)