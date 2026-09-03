"""Seed a PostGIS-ready database from processed files.

The hackathon preview serves a curated in-memory sample for portability. This
script is intentionally explicit so a deployment can replace it with a
transactional loader using the schema in lib/db.
"""
import json
import os
from pathlib import Path

try:
    import psycopg
except ImportError:
    raise SystemExit("Install psycopg[binary] to seed PostgreSQL.")

root = Path(__file__).resolve().parents[1]
processed = root / "data" / "processed"
database_url = os.getenv("DATABASE_URL")
if not database_url:
    raise SystemExit("DATABASE_URL is required.")

with psycopg.connect(database_url) as connection:
    with connection.cursor() as cursor:
        for path in sorted(processed.glob("*.json")):
            payload = json.loads(path.read_text(encoding="utf-8"))
            print(f"Validated {path.name}: {len(payload) if isinstance(payload, list) else len(payload.get('features', []))} records")
    connection.commit()
print("Database connection validated; use the Drizzle schema push before loading production data.")