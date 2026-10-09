# app/core/database.py
import os
import motor.motor_asyncio

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")

print(f"DB: {'Atlas' if 'mongodb+srv' in MONGO_URI else 'Local'}")

# Lazy initialization — connection only happens on first actual DB call
# NOT at import time — this fixes Railway DNS resolution issues
_client = None
_db     = None

def _get_db():
    global _client, _db
    if _db is None:
        _client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_URI)
        _db     = _client.cosmica
    return _db

class LazyCollection:
    """Proxy that defers DB connection until first use"""
    def __init__(self, name):
        self._name = name
    def __getattr__(self, attr):
        return getattr(_get_db()[self._name], attr)
    def __getitem__(self, key):
        return _get_db()[self._name][key]

class LazyDB:
    def __getattr__(self, name):
        return LazyCollection(name)
    def __getitem__(self, key):
        return LazyCollection(key)

db                     = LazyDB()
users_collection       = LazyCollection("users")
kundlis_collection     = LazyCollection("kundlis")
predictions_collection = LazyCollection("predictions")
knowledge_collection   = LazyCollection("knowledge")
