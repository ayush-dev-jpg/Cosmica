#!/usr/bin/env python3
"""
STEP 1: Export all knowledge from local MongoDB
Run this on YOUR computer first:
  cd ~/Downloads/cosmica/backend
  source venv/bin/activate
  python3 export_to_atlas.py

It will print a complete import script with ALL your data hardcoded.
Then run that script against Atlas.
"""

import asyncio
import json
import motor.motor_asyncio
from datetime import datetime

LOCAL_URI = "mongodb://localhost:27017"
client = motor.motor_asyncio.AsyncIOMotorClient(LOCAL_URI)
db = client.cosmica

async def export_all():
    print("🔍 Connecting to local MongoDB...")
    
    collections = {
        "planet_house_knowledge":  [],
        "lord_in_house_knowledge": [],
        "planet_sign_knowledge":   [],
        "rashi_knowledge":         [],
        "nakshatra_knowledge":     [],
    }

    for col_name in collections:
        col = db[col_name]
        count = await col.count_documents({})
        print(f"  📦 {col_name}: {count} entries")
        async for doc in col.find({}):
            doc.pop("_id", None)
            doc.pop("updated_at", None)
            collections[col_name].append(doc)

    total = sum(len(v) for v in collections.values())
    print(f"\n✅ Total entries found: {total}")

    # Write to JSON file
    with open("cosmica_knowledge_export.json", "w", encoding="utf-8") as f:
        json.dump(collections, f, ensure_ascii=False, indent=2)
    
    print(f"\n✅ Exported to: cosmica_knowledge_export.json")
    print(f"\nNow:")
    print(f"  1. Set up MongoDB Atlas (free at mongodb.com/cloud/atlas)")
    print(f"  2. Get your connection string: mongodb+srv://user:pass@cluster.mongodb.net/cosmica")
    print(f"  3. Run: python3 import_to_atlas.py YOUR_ATLAS_URI")

if __name__ == "__main__":
    asyncio.run(export_all())