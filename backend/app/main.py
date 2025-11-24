from fastapi import FastAPI
from fastapi.responses import JSONResponse
from app.api.v1 import upload
import logging
from datetime import datetime

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Spotify Insight API",
    description="Backend API for Spotify listening history analysis",
    version="1.0.0"
)

app.include_router(upload.router, prefix="/api/v1")

@app.get("/")
async def home():
    """Home endpoint with API information"""
    return {
        "name": "Spotify Insight API",
        "version": "1.0.0",
        "status": "running",
        "endpoints": {
            "health": "/health",
            "upload": "/api/v1/upload",
            "docs": "/docs"
        },
        "timestamp": datetime.utcnow().isoformat()
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "spotify-insight-backend",
        "timestamp": datetime.utcnow().isoformat()
    }
