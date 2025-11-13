from fastapi import FastAPI
from app.api.v1 import upload

app = FastAPI(title="Spotify Insight API")

app.include_router(upload.router, prefix="/api/v1")
