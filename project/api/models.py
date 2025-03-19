from sqlalchemy import Column, Integer, String, Float, JSON, Date, ForeignKey, DateTime, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, index=True)
    auth0_id = Column(String, unique=True)
    created_at = Column(DateTime, server_default=func.now())

    predictions = relationship("Prediction", back_populates="user")

class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    appliances = Column(JSON)
    start_date = Column(Date)
    end_date = Column(Date)
    consumption = Column(Float)
    days = Column(Integer)
    total_appliances = Column(Integer)
    time_series_predictions = Column(JSON)
    created_at = Column(DateTime, server_default=func.now())

    user = relationship("User", back_populates="predictions")
    forecasts = relationship("Forecast", back_populates="prediction")

class Forecast(Base):
    __tablename__ = "forecasts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    prediction_id = Column(UUID(as_uuid=True), ForeignKey("predictions.id"))
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    consumption = Column(Float)
    trend = Column(String)
    percentage_change = Column(Float)
    created_at = Column(DateTime, server_default=func.now())

    prediction = relationship("Prediction", back_populates="forecasts")