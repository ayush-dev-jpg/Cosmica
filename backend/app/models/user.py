# app/models/user.py
# Pydantic models = data validation schemas (like TypeScript types)

from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class UserCreate(BaseModel):
    """Schema for signup request"""
    name: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    """Schema for login request"""
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    """Schema for user data returned to frontend (never includes password)"""
    id: str
    name: str
    email: str
    role: str
    created_at: datetime

class TokenResponse(BaseModel):
    """Schema for auth token response"""
    access_token: str
    token_type: str
    user: dict
