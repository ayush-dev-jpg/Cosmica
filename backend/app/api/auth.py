# app/api/auth.py
from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel
from app.models.user import UserCreate, UserLogin
from app.core.security import (
    hash_password, verify_password,
    create_access_token, get_current_user
)
from app.core.database import users_collection
from datetime import datetime
from typing import Optional

router = APIRouter(prefix="/auth", tags=["Authentication"])

GOOGLE_CLIENT_ID = "508207275158-oj5lm0k6veiqvm2d130bm6aum5t5jsa0.apps.googleusercontent.com"

# ── Standard signup ───────────────────────────────────────────
@router.post("/signup")
async def signup(user: UserCreate):
    existing = await users_collection.find_one({"email": user.email})
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")
    hashed  = hash_password(user.password)
    new_user = {
        "name": user.name, "email": user.email,
        "hashed_password": hashed, "role": "user",
        "auth_provider": "email",
        "created_at": datetime.utcnow(), "saved_kundlis": [],
    }
    result  = await users_collection.insert_one(new_user)
    user_id = str(result.inserted_id)
    token   = create_access_token({"sub": user_id})
    return {"access_token": token, "token_type": "bearer",
            "user": {"id": user_id, "name": user.name, "email": user.email, "role": "user"}}

# ── Standard login ────────────────────────────────────────────
@router.post("/login")
async def login(credentials: UserLogin):
    user = await users_collection.find_one({"email": credentials.email})
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")
    # Google-only accounts have no password
    if not user.get("hashed_password"):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
            detail="This account uses Google Sign-In. Please use the Google button to log in.")
    if not verify_password(credentials.password, user["hashed_password"]):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")
    user_id = str(user["_id"])
    token   = create_access_token({"sub": user_id})
    return {"access_token": token, "token_type": "bearer",
            "user": {"id": user_id, "name": user["name"], "email": user["email"],
                     "role": user.get("role", "user"), "picture": user.get("picture","")}}

# ── Google OAuth ──────────────────────────────────────────────
class GoogleAuthRequest(BaseModel):
    credential: str

@router.post("/google")
async def google_auth(req: GoogleAuthRequest):
    """Sign in or sign up with Google. Preserves existing roles (admin stays admin)."""
    try:
        from google.oauth2 import id_token
        from google.auth.transport import requests as google_requests
        idinfo = id_token.verify_oauth2_token(
            req.credential,
            google_requests.Request(),
            GOOGLE_CLIENT_ID
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid Google token: {str(e)}")

    google_email = idinfo.get("email", "")
    google_name  = idinfo.get("name", "")
    google_id    = idinfo.get("sub", "")
    picture      = idinfo.get("picture", "")

    if not google_email:
        raise HTTPException(status_code=400, detail="Could not get email from Google")

    # Check existing user
    existing = await users_collection.find_one({"email": google_email})

    if existing:
        # ⚠️ PRESERVE EXISTING ROLE — admin stays admin
        user_id = str(existing["_id"])
        await users_collection.update_one(
            {"_id": existing["_id"]},
            {"$set": {"google_id": google_id, "picture": picture, "last_google_login": datetime.utcnow()}}
        )
        token = create_access_token({"sub": user_id})
        return {
            "access_token": token, "token_type": "bearer",
            "user": {
                "id":      user_id,
                "name":    existing["name"],
                "email":   existing["email"],
                "role":    existing.get("role", "user"),  # ← keeps admin role
                "picture": picture,
            }
        }
    else:
        # New Google user
        new_user = {
            "name": google_name, "email": google_email,
            "google_id": google_id, "picture": picture,
            "hashed_password": None,
            "role": "user",
            "auth_provider": "google",
            "created_at": datetime.utcnow(),
            "saved_kundlis": [],
        }
        result  = await users_collection.insert_one(new_user)
        user_id = str(result.inserted_id)
        token   = create_access_token({"sub": user_id})
        return {
            "access_token": token, "token_type": "bearer",
            "user": {"id": user_id, "name": google_name, "email": google_email,
                     "role": "user", "picture": picture}
        }

# ── Get current user ──────────────────────────────────────────
@router.get("/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    return {
        "id":         str(current_user["_id"]),
        "name":       current_user["name"],
        "email":      current_user["email"],
        "role":       current_user.get("role", "user"),
        "picture":    current_user.get("picture", ""),
        "created_at": current_user.get("created_at"),
        "auth_provider": current_user.get("auth_provider", "email"),
    }