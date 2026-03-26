# app/models/kundli.py
# Data schemas for birth details and kundli generation

from pydantic import BaseModel
from typing import Optional

class BirthInput(BaseModel):
    """Schema for birth details form submission"""
    name: str
    date: str           # Format: "YYYY-MM-DD"
    time: str           # Format: "HH:MM"
    city: str
    country: str
    timezone: Optional[str] = "Asia/Kolkata"   # Default to IST

class PredictionRequest(BaseModel):
    """Schema for requesting a prediction"""
    kundli_id: str
    prediction_type: str = "general"    # general, daily, weekly, monthly
