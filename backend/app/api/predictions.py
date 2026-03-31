# app/api/predictions.py
from fastapi import APIRouter, HTTPException, Depends
from app.services.prediction import generate_prediction
from app.core.security import get_current_user, get_current_user_optional
from app.core.database import kundlis_collection, predictions_collection
from pydantic import BaseModel
from datetime import datetime
from bson import ObjectId

router = APIRouter(prefix="/predictions", tags=["Predictions"])

class PredictionRequest(BaseModel):
    kundli_id: str
    prediction_type: str = "general"   # general, daily, weekly, monthly

@router.post("/generate")
async def create_prediction(
    req: PredictionRequest,
    current_user: dict = Depends(get_current_user_optional)
):
    """Generate an AI prediction for a saved Kundli"""

    # Fetch the Kundli from database
    try:
        query = {"_id": ObjectId(req.kundli_id)}
        if current_user:
            # Match kundlis owned by this user OR created as guest
            query["user_id"] = {"$in": [str(current_user["_id"]), "guest"]}
        else:
            query["user_id"] = "guest"
        kundli_doc = await kundlis_collection.find_one(query)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid Kundli ID")

    if not kundli_doc:
        raise HTTPException(status_code=404, detail="Kundli not found")

    # Generate the prediction
    result = await generate_prediction(kundli_doc["kundli"], req.prediction_type)

    # Save prediction to database
    pred_doc = {
        "user_id": str(current_user["_id"]) if current_user else "guest",
        "kundli_id": req.kundli_id,
        "person_name": kundli_doc.get("person_name"),
        **result,
        "created_at": datetime.utcnow(),
    }
    saved = await predictions_collection.insert_one(pred_doc)

    return {
        "prediction_id": str(saved.inserted_id),
        **result
    }

@router.get("/history")
async def get_prediction_history(current_user: dict = Depends(get_current_user)):
    """Get all past predictions for the current user"""
    cursor = predictions_collection.find(
        {"user_id": {"$in": [str(current_user["_id"]), "guest"]}},
        sort=[("created_at", -1)],
        limit=20
    )
    history = []
    async for doc in cursor:
        history.append({
            "id": str(doc["_id"]),
            "kundli_id": doc.get("kundli_id"),
            "person_name": doc.get("person_name"),
            "prediction_type": doc.get("prediction_type"),
            "prediction": doc.get("prediction"),
            "nakshatra": doc.get("nakshatra"),
            "moon_rashi": doc.get("moon_rashi"),
            "created_at": doc.get("created_at"),
        })
    return {"history": history}
