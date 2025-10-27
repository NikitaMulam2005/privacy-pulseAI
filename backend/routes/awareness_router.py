from fastapi import APIRouter
from backend.utils.awareness import get_awareness_content

router = APIRouter(prefix="/awareness", tags=["awareness"])

@router.get("/")
async def fetch_awareness():
    """
    Returns the daily tip, quiz, and leaderboard for the Awareness section.
    """
    data = get_awareness_content()
    return {"status": "success", "data": data}
