import asyncio
import logging
import sys
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.routes import scan, dashboard, awareness_router, webscan_router
import os

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

# Set WindowsSelectorEventLoopPolicy at module level
if os.name == 'nt':
    logger.info("Setting WindowsSelectorEventLoopPolicy for Windows")
    try:
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
        loop = asyncio.get_event_loop()
        logger.info(f"Event loop policy set to: {asyncio.get_event_loop_policy().__class__.__name__}")
        logger.info(f"Event loop: {loop.__class__.__name__}")
    except Exception as e:
        logger.error(f"Failed to set event loop policy: {str(e)}")
        sys.exit(1)

app = FastAPI(title="PrivacyPulse AI")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://privacypulse-backend.onrender.com",
        "chrome-extension://*",
        "http://localhost:5173",
        "*",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(scan.router, prefix="/api/scan", tags=["scan"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["dashboard"])
app.include_router(awareness_router.router)
app.include_router(webscan_router.router)

@app.get("/")
def root():
    return {"message": "PrivacyPulse AI Backend is running"}