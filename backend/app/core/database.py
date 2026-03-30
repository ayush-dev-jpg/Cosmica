# app/core/database.py
import os
import motor.motor_asyncio

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")

client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_URI)
db = client.cosmica

users_collection      = db.users
kundlis_collection    = db.kundlis
predictions_collection = db.predictions
knowledge_collection  = db.knowledge

print(f"DB: {'Atlas' if 'mongodb+srv' in MONGO_URI else 'Local'}")
