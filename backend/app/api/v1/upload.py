from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from app.services.r2_storage import r2_storage
import uuid
import logging
from datetime import datetime

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    age: str = Form(None),
    sex: str = Form(None),
    lifestyle: str = Form(None)
):
    """
    Upload Spotify data ZIP file to R2 storage
    
    Flow:
    1. Validate file type and size
    2. Upload to R2 storage
    3. Create upload job in database (TODO)
    4. Trigger background worker (TODO)
    5. Return job_id to frontend
    """
    
    # Log upload attempt
    logger.info(f"Upload initiated - Filename: {file.filename}, Age: {age}, Sex: {sex}")
    
    # Validate file exists
    if not file or not file.filename:
        logger.warning("Upload failed: No file provided")
        raise HTTPException(status_code=400, detail="No file provided")
    
    # Validate file type
    if not file.filename.endswith('.zip'):
        logger.warning(f"Upload failed: Invalid file type - {file.filename}")
        raise HTTPException(status_code=400, detail="Only .zip files are allowed")
    
    # Validate file size (max 50MB)
    file_content = await file.read()
    file_size_mb = len(file_content) / (1024 * 1024)
    
    if file_size_mb > 50:
        logger.warning(f"Upload failed: File too large - {file_size_mb:.2f}MB")
        raise HTTPException(status_code=400, detail=f"File size ({file_size_mb:.2f}MB) exceeds 50MB limit")
    
    logger.info(f"File validation passed - Size: {file_size_mb:.2f}MB")
    
    # Reset file pointer for upload
    await file.seek(0)
    
    try:
        # Generate user_id (temporary - should come from auth session)
        user_id = "anonymous"  # TODO: Get from authenticated session
        
        # Upload to R2
        logger.info(f"Uploading to R2: {file.filename}")
        file_path = r2_storage.upload_file(
            file_data=file.file,
            user_id=user_id,
            filename=file.filename
        )
        logger.info(f"Upload successful - R2 path: {file_path}")
        
        # Generate job ID
        job_id = str(uuid.uuid4())
        logger.info(f"Job created - ID: {job_id}")
        
        # TODO: Create database record in upload_jobs table
        # db.create_upload_job(
        #     id=job_id,
        #     user_id=user_id,
        #     file_path=file_path,
        #     status="pending",
        #     metadata={"age": age, "sex": sex, "lifestyle": lifestyle}
        # )
        
        # TODO: Trigger background worker
        # worker.enqueue_job(job_id, file_path, user_id)
        
        logger.info(f"Upload completed successfully - Job ID: {job_id}")
        
        return {
            "success": True,
            "job_id": job_id,
            "file_path": file_path,
            "filename": file.filename,
            "file_size_mb": round(file_size_mb, 2),
            "metadata": {
                "age": age,
                "sex": sex,
                "lifestyle": lifestyle
            },
            "message": "File uploaded successfully. Processing will begin shortly.",
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Upload failed - Error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")
