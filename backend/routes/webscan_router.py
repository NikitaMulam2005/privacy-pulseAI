from fastapi import APIRouter, Query
from backend.utils.web_scanner import analyze_website

router = APIRouter(prefix="/scan", tags=["webscan"])

@router.get("/")
async def scan_site(url: str = Query(..., description="Website URL to scan")):
    """
    Scans a website for security headers, cookies, and trackers.
    """
    result = analyze_website(url)
    return {"status": "success", "data": result}
