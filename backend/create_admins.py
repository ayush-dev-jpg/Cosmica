"""
Seed script: Create two admin accounts for Cosmica.

Usage:
    cd backend
    python create_admins.py

Credentials (change these after first login):
    admin1@cosmica.com / Admin@123
    admin2@cosmica.com / Admin@456
"""

import asyncio
from datetime import datetime
from app.core.database import users_collection
from app.core.security import hash_password

ADMINS = [
    {"name": "Admin One", "email": "admin1@cosmica.com", "password": "Admin@123"},
    {"name": "Admin Two", "email": "admin2@cosmica.com", "password": "Admin@456"},
]


async def seed():
    print("Seeding admin accounts...")
    for admin in ADMINS:
        existing = await users_collection.find_one({"email": admin["email"]})
        if existing:
            print(f"  {admin['email']} already exists, skipping")
            continue
        doc = {
            "name": admin["name"],
            "email": admin["email"],
            "hashed_password": hash_password(admin["password"]),
            "role": "admin",
            "created_at": datetime.utcnow(),
            "saved_kundlis": [],
        }
        await users_collection.insert_one(doc)
        print(f"  Created admin: {admin['email']}")
    print("Done!")


asyncio.run(seed())
