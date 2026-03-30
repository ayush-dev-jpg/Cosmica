# app/api/admin.py
from fastapi import APIRouter

router = APIRouter(prefix="/admin", tags=["Admin"])

@router.get("/status")
async def status():
    return {"message": "Admin API running. PDF upload feature temporarily disabled."}
