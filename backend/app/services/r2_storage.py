import os
import boto3
from botocore.client import Config
from typing import BinaryIO
import uuid
from dotenv import load_dotenv

load_dotenv()

class R2Storage:
    def __init__(self):
        """Initialize R2 client using Cloudflare R2 credentials"""
        self.account_id = os.getenv("R2_ACCOUNT_ID")
        self.access_key_id = os.getenv("R2_ACCESS_KEY_ID")
        self.secret_access_key = os.getenv("R2_SECRET_ACCESS_KEY")
        self.bucket_name = os.getenv("R2_BUCKET_NAME")
        print(self.account_id, self.access_key_id, self.secret_access_key, self.bucket_name)
        if not all([self.account_id, self.access_key_id, self.secret_access_key, self.bucket_name]):
            raise ValueError("Missing R2 credentials in environment variables")
        
        # Configure S3 client for Cloudflare R2
        self.s3_client = boto3.client(
            service_name='s3',
            endpoint_url=f'https://{self.account_id}.r2.cloudflarestorage.com',
            aws_access_key_id=self.access_key_id,
            aws_secret_access_key=self.secret_access_key,
            config=Config(signature_version='s3v4'),
            region_name='auto'
        )
    
    def upload_file(self, file_data: BinaryIO, user_id: str, filename: str) -> str:
        """
        Upload file to R2 storage
        
        Args:
            file_data: File binary data
            user_id: User ID for organizing files
            filename: Original filename
            
        Returns:
            str: S3 path to uploaded file (e.g., "uploads/user123/abc-123.zip")
        """
        # Generate unique upload ID
        upload_id = str(uuid.uuid4())
        
        # Create S3 key path: uploads/{user_id}/{upload_id}.zip
        file_extension = os.path.splitext(filename)[1]
        s3_key = f"uploads/{user_id}/{upload_id}{file_extension}"
        
        # Upload to R2
        self.s3_client.upload_fileobj(
            file_data,
            self.bucket_name,
            s3_key,
            ExtraArgs={
                'ContentType': 'application/zip',
                'Metadata': {
                    'original_filename': filename,
                    'user_id': user_id
                }
            }
        )
        
        return s3_key
    
    def download_file(self, s3_key: str, local_path: str):
        """
        Download file from R2 to local path
        
        Args:
            s3_key: S3 object key
            local_path: Local filesystem path to save file
        """
        self.s3_client.download_file(self.bucket_name, s3_key, local_path)
    
    def delete_file(self, s3_key: str):
        """
        Delete file from R2
        
        Args:
            s3_key: S3 object key to delete
        """
        self.s3_client.delete_object(Bucket=self.bucket_name, Key=s3_key)
    
    def get_file_url(self, s3_key: str, expiration: int = 3600) -> str:
        """
        Generate presigned URL for file access
        
        Args:
            s3_key: S3 object key
            expiration: URL expiration time in seconds (default 1 hour)
            
        Returns:
            str: Presigned URL
        """
        url = self.s3_client.generate_presigned_url(
            'get_object',
            Params={'Bucket': self.bucket_name, 'Key': s3_key},
            ExpiresIn=expiration
        )
        return url


# Singleton instance
r2_storage = R2Storage()
