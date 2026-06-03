"""
Seed script — creates demo accounts if they don't exist yet.
Called once on app startup.

Demo accounts:
  Admin:    admin@datastraw.in   /  Admin@123
  Customer: demo@customer.com    /  Demo@123
"""

import sqlite3
from app.auth import hash_password
from app.database import get_db


SEED_USERS = [
    {
        "name": "Admin User",
        "email": "admin@datastraw.in",
        "password": "Admin@123",
        "role": "admin",
    },
    {
        "name": "Demo Customer",
        "email": "demo@customer.com",
        "password": "Demo@123",
        "role": "customer",
    },
]


def seed_users() -> None:
    with get_db() as db:
        for user in SEED_USERS:
            existing = db.execute(
                "SELECT id FROM users WHERE LOWER(email) = ?",
                (user["email"].lower(),),
            ).fetchone()

            if not existing:
                db.execute(
                    "INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)",
                    (user["name"], user["email"].lower(), hash_password(user["password"]), user["role"]),
                )
                print(f"[seed] Created {user['role']}: {user['email']}")
            else:
                print(f"[seed] Already exists: {user['email']}")
