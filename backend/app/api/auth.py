# app/api/auth.py
# Authentication routes: signup, login, get current user

from fastapi import APIRouter, HTTPException, Depends, status
from app.models.user import UserCreate, UserLogin
from app.core.security import (
    hash_password, verify_password,
    create_access_token, get_current_user
)
from app.core.database import users_collection
from datetime import datetime

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/signup")
async def signup(user: UserCreate):
    """Register a new user account"""

    # Check if email is already registered
    existing = await users_collection.find_one({"email": user.email})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # Hash the password before storing
    hashed = hash_password(user.password)

    # Build user document for MongoDB
    new_user = {
        "name": user.name,
        "email": user.email,
        "hashed_password": hashed,
        "role": "user",         # Default role
        "created_at": datetime.utcnow(),
        "saved_kundlis": [],    # Empty list of saved charts
    }

    result = await users_collection.insert_one(new_user)
    user_id = str(result.inserted_id)

    # Create JWT token immediately so user is logged in after signup
    token = create_access_token({"sub": user_id})

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user_id,
            "name": user.name,
            "email": user.email,
            "role": "user"
        }
    }

@router.post("/login")
async def login(credentials: UserLogin):
    """Login with email and password"""

    # Find user by email
    user = await users_collection.find_one({"email": credentials.email})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    # Verify password
    if not verify_password(credentials.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    # Create JWT token
    user_id = str(user["_id"])
    token = create_access_token({"sub": user_id})

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user_id,
            "name": user["name"],
            "email": user["email"],
            "role": user.get("role", "user")
        }
    }

@router.get("/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    """Get current logged-in user's profile"""
    return {
        "id": str(current_user["_id"]),
        "name": current_user["name"],
        "email": current_user["email"],
        "role": current_user.get("role", "user"),
        "created_at": current_user.get("created_at"),
    }
