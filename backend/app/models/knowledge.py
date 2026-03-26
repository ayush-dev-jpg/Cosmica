# app/models/knowledge.py
from pydantic import BaseModel
from typing import Optional

class PlanetHouseKnowledge(BaseModel):
    planet: str
    house: int
    lagna: Optional[str] = None
    text: str

class RashiKnowledge(BaseModel):
    rashi: str
    text: str

class NakshatraKnowledge(BaseModel):
    nakshatra: str
    text: str

class LordInHouseKnowledge(BaseModel):
    """Prediction for a house lord placed in a specific house"""
    lord_house: int           # which house the lord RULES (e.g. 9 = 9th lord)
    placed_in_house: int      # which house the lord is PLACED IN (e.g. 1 = 1st house)
    lagna: Optional[str] = None  # None = applies to all lagnas
    text: str                # prediction text