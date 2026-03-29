#!/usr/bin/env python3
"""
STEP 3: Import all knowledge into MongoDB Atlas
Usage:
  python3 import_to_atlas.py "mongodb+srv://user:pass@cluster.mongodb.net/cosmica"

Get your Atlas URI from:
  Atlas Dashboard → Connect → Connect your application → Copy URI
  Replace <password> with your actual password
"""

import asyncio
import json
import sys
import motor.motor_asyncio
from datetime import datetime

if len(sys.argv) < 2:
    print("Usage: python3 import_to_atlas.py YOUR_ATLAS_URI")
    print('Example: python3 import_to_atlas.py "mongodb+srv://ayush:mypassword@cluster0.abc123.mongodb.net/cosmica"')
    sys.exit(1)

ATLAS_URI = sys.argv[1]

async def import_all():
    print(f"🔗 Connecting to Atlas...")
    client = motor.motor_asyncio.AsyncIOMotorClient(ATLAS_URI)
    db = client.cosmica

    # Test connection
    try:
        await client.admin.command('ping')
        print("✅ Atlas connection successful!")
    except Exception as e:
        print(f"❌ Connection failed: {e}")
        print("Check your URI and make sure your IP is whitelisted in Atlas Network Access")
        sys.exit(1)

    # Load export file
    try:
        with open("cosmica_knowledge_export.json", "r", encoding="utf-8") as f:
            data = json.load(f)
    except FileNotFoundError:
        print("❌ cosmica_knowledge_export.json not found!")
        print("Run export_to_atlas.py first")
        sys.exit(1)

    total_inserted = 0
    total_updated  = 0

    for col_name, entries in data.items():
        if not entries:
            print(f"  ⏭️  {col_name}: empty, skipping")
            continue

        col = db[col_name]
        inserted = 0
        updated  = 0

        for entry in entries:
            entry["updated_at"] = datetime.utcnow()

            # Build unique query per collection type
            if col_name == "planet_house_knowledge":
                query = {"planet": entry["planet"], "house": entry["house"], "lagna": entry.get("lagna")}
            elif col_name == "lord_in_house_knowledge":
                query = {"lord_house": entry["lord_house"], "placed_in_house": entry["placed_in_house"], "lagna": entry.get("lagna")}
            elif col_name == "planet_sign_knowledge":
                query = {"planet": entry["planet"], "rashi": entry["rashi"]}
            elif col_name == "rashi_knowledge":
                query = {"rashi": entry["rashi"]}
            elif col_name == "nakshatra_knowledge":
                query = {"nakshatra": entry["nakshatra"]}
            else:
                continue

            result = await col.update_one(query, {"$set": {**entry}}, upsert=True)
            if result.upserted_id:
                inserted += 1
            else:
                updated += 1

        print(f"  ✅ {col_name}: {inserted} inserted, {updated} updated")
        total_inserted += inserted
        total_updated  += updated

    print(f"\n{'='*55}")
    print(f"🎉 Done! {total_inserted} inserted + {total_updated} updated = {total_inserted+total_updated} total")
    print(f"{'='*55}")
    print(f"\nNext steps:")
    print(f"  1. Update your backend .env: MONGO_URI={ATLAS_URI}")
    print(f"  2. Deploy to Railway")

if __name__ == "__main__":
    asyncio.run(import_all())