# app/core/database.py
# MongoDB async connection using Motor driver
import motor.motor_asyncio
from app.core.config import settings

import os
from motor.motor_asyncio import AsyncIOMotorClient

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
client = AsyncIOMotorClient(MONGO_URI)
db = client.cosmica

# Create async MongoDB client
client = motor.motor_asyncio.AsyncIOMotorClient(settings.MONGODB_URL)

# The main database
db = client.cosmica

# Collections (like tables in SQL)
users_collection = db.users
kundlis_collection = db.kundlis
predictions_collection = db.predictions
knowledge_collection = db.knowledge

