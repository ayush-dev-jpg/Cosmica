# app/core/database.py
# MongoDB async connection using Motor driver
import motor.motor_asyncio
from app.core.config import settings

# Create async MongoDB client
client = motor.motor_asyncio.AsyncIOMotorClient(settings.MONGODB_URL)

# The main database
db = client.cosmica

# Collections (like tables in SQL)
users_collection = db.users
kundlis_collection = db.kundlis
predictions_collection = db.predictions
knowledge_collection = db.knowledge
