"""
Cloudinary helper for image uploads.
Replaces local filesystem storage so images persist across Railway redeploys.

Required environment variables:
  CLOUDINARY_CLOUD_NAME
  CLOUDINARY_API_KEY
  CLOUDINARY_API_SECRET
"""
import cloudinary
import cloudinary.uploader
import os

cloudinary.config(
    cloud_name=os.environ.get('CLOUDINARY_CLOUD_NAME'),
    api_key=os.environ.get('CLOUDINARY_API_KEY'),
    api_secret=os.environ.get('CLOUDINARY_API_SECRET'),
    secure=True
)


def upload_image(file, folder: str) -> str:
    """
    Upload a file-like object to Cloudinary.

    Args:
        file: werkzeug FileStorage object from request.files
        folder: Cloudinary folder name (e.g. 'towers', 'units', 'layouts')

    Returns:
        Secure HTTPS URL of the uploaded image.
    """
    result = cloudinary.uploader.upload(
        file,
        folder=f"rental_portal/{folder}",
        resource_type="image",
        overwrite=True
    )
    return result['secure_url']
