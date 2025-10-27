from fastapi import APIRouter
from backend.database import get_scan_history

router = APIRouter()

@router.get("/history")
async def history(limit: int = 50):
    docs = await get_scan_history(limit)
    # Optionally sanitize before returning
    return docs
