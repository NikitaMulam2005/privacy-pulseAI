import motor.motor_asyncio
import os
from dotenv import load_dotenv
from bson import ObjectId
from datetime import datetime
import logging

load_dotenv()
logging.basicConfig(level=logging.INFO)

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/privacypulse")
client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_URI)
db = client.get_default_database()

async def save_scan_result(result: dict):
    try:
        result["created_at"] = datetime.utcnow()
        res = await db.scans.insert_one(result)
        logging.info(f" Inserted document with ID: {res.inserted_id}")
        return str(res.inserted_id)
    except Exception as e:
        logging.error(f"Failed to insert: {e}")
        raise

async def get_scan_history(limit: int = 100):
    try:
        docs = await db.scans.find().sort("created_at", -1).to_list(limit)
        for doc in docs:
            doc["_id"] = str(doc["_id"])
        logging.info(f"Retrieved {len(docs)} docs")
        return docs
    except Exception as e:
        logging.error(f"Failed to fetch history: {e}")
        return []
