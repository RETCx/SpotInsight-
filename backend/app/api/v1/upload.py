from fastapi import APIRouter, UploadFile, File
import os
from pathlib import Path

router = APIRouter()

@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    tmp_dir = Path("tmp")
    tmp_dir.mkdir(parents=True, exist_ok=True)

    save_path = tmp_dir / "my_spotify_data.zip"

    with open(save_path, "wb") as buffer:
        buffer.write(await file.read())

    return {"message": f"File uploaded to {save_path}"}
