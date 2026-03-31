# app/api/kundli.py
# Routes for generating and fetching Kundli charts

from fastapi import APIRouter, HTTPException, Depends
from app.models.kundli import BirthInput
from app.astrology.engine import generate_kundli
from app.core.security import get_current_user, get_current_user_optional
from app.core.database import kundlis_collection
from geopy.geocoders import Nominatim
from geopy.exc import GeocoderTimedOut
from datetime import datetime
from bson import ObjectId
import timezonefinder

router = APIRouter(prefix="/kundli", tags=["Kundli"])

def get_coordinates(city: str, country: str):
    """Convert city name to latitude/longitude using free geocoding"""
    try:
        geolocator = Nominatim(user_agent="cosmica_app")
        location = geolocator.geocode(f"{city}, {country}", timeout=10)
        if not location:
            raise HTTPException(status_code=400, detail=f"Location '{city}, {country}' not found")
        return location.latitude, location.longitude
    except GeocoderTimedOut:
        raise HTTPException(status_code=408, detail="Geocoding timed out, try again")

def get_timezone(lat: float, lon: float) -> str:
    """Auto-detect timezone from coordinates"""
    try:
        tf = timezonefinder.TimezoneFinder()
        timezone = tf.timezone_at(lat=lat, lng=lon)
        return timezone or "Asia/Kolkata"
    except Exception:
        return "Asia/Kolkata"

@router.post("/generate")
async def create_kundli(
    data: BirthInput,
    current_user: dict = Depends(get_current_user_optional)
):
    """Generate a complete Vedic birth chart from birth details"""

    # Step 1: Get coordinates from city name
    lat, lon = get_coordinates(data.city, data.country)

    # Step 2: Auto-detect timezone
    timezone = get_timezone(lat, lon)

    # Step 3: Generate the full Kundli using Swiss Ephemeris
    try:
        kundli_data = generate_kundli(data.date, data.time, lat, lon, timezone)
    except ImportError as e:
        raise HTTPException(status_code=503, detail=str(e))

    # Step 4: Build document to save in MongoDB
    kundli_doc = {
        "user_id": str(current_user["_id"]) if current_user else "guest",
        "person_name": data.name,
        "birth_details": {
            "date": data.date,
            "time": data.time,
            "city": data.city,
            "country": data.country,
            "latitude": lat,
            "longitude": lon,
            "timezone": timezone,
        },
        "kundli": kundli_data,
        "created_at": datetime.utcnow(),
    }

    # Step 5: Save to database
    result = await kundlis_collection.insert_one(kundli_doc)

    return {
        "status": "success",
        "kundli_id": str(result.inserted_id),
        "person_name": data.name,
        "birth_details": kundli_doc["birth_details"],
        "kundli": kundli_data,
    }

@router.get("/my-charts")
async def get_my_charts(current_user: dict = Depends(get_current_user)):
    """Get all saved Kundli charts for the current user"""
    cursor = kundlis_collection.find({
        "user_id": {"$in": [str(current_user["_id"]), "guest"]}
    })
    charts = []
    async for doc in cursor:
        charts.append({
            "id": str(doc["_id"]),
            "person_name": doc.get("person_name", "Unknown"),
            "birth_details": doc.get("birth_details", {}),
            "created_at": doc.get("created_at"),
            "nakshatra": doc["kundli"].get("nakshatra", {}).get("name"),
            "moon_rashi": doc["kundli"].get("moon_rashi"),
            "lagna": doc["kundli"].get("lagna", {}).get("name"),
        })
    return {"charts": charts}

@router.get("/{kundli_id}")
async def get_kundli(
    kundli_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get a specific Kundli by ID"""
    try:
        doc = await kundlis_collection.find_one({
            "_id": ObjectId(kundli_id),
            "user_id": {"$in": [str(current_user["_id"]), "guest"]}
        })
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid Kundli ID")

    if not doc:
        raise HTTPException(status_code=404, detail="Kundli not found")

    return {
        "id": str(doc["_id"]),
        "person_name": doc.get("person_name"),
        "birth_details": doc.get("birth_details"),
        "kundli": doc.get("kundli"),
        "created_at": doc.get("created_at"),
    }

@router.delete("/{kundli_id}")
async def delete_kundli(
    kundli_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Delete a saved Kundli chart"""
    result = await kundlis_collection.delete_one({
        "_id": ObjectId(kundli_id),
        "user_id": {"$in": [str(current_user["_id"]), "guest"]}
    })
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Kundli not found")
    return {"message": "Chart deleted successfully"}
